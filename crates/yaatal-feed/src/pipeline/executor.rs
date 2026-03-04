// yaatal-feed/src/pipeline/executor.rs
//
// Adapted from xai-org/x-algorithm candidate_pipeline.rs execute() flow.
// Same pattern: hydrate query → source → hydrate candidates → filter → score → select → side effects

use crate::pipeline::traits::*;
use futures::future::join_all;
use std::sync::Arc;
use tracing::{error, info, warn};

pub struct PipelineResult<Q, C> {
    pub candidates: Vec<C>,
    pub query: Arc<Q>,
    pub stats: PipelineStats,
}

#[derive(Debug, Clone, Default)]
pub struct PipelineStats {
    pub sourced: usize,
    pub after_hydration: usize,
    pub after_filter: usize,
    pub after_scoring: usize,
    pub selected: usize,
    pub filtered_out: usize,
}

pub struct FeedPipeline<Q, C>
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    pub query_hydrators: Vec<Box<dyn QueryHydrator<Q>>>,
    pub sources: Vec<Box<dyn Source<Q, C>>>,
    pub hydrators: Vec<Box<dyn Hydrator<Q, C>>>,
    pub filters: Vec<Box<dyn Filter<Q, C>>>,
    pub scorers: Vec<Box<dyn Scorer<Q, C>>>,
    pub selector: Box<dyn Selector<Q, C>>,
    pub post_selection_filters: Vec<Box<dyn Filter<Q, C>>>,
    pub side_effects: Arc<Vec<Box<dyn SideEffect<Q, C>>>>,
    pub result_size: usize,
}

impl<Q, C> FeedPipeline<Q, C>
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    pub async fn execute(&self, query: Q, request_id: &str) -> PipelineResult<Q, C> {
        let mut stats = PipelineStats::default();

        // 1. Hydrate query (parallel)
        let hydrated_query = self.hydrate_query(query, request_id).await;

        // 2. Fetch candidates from all sources (parallel)
        let candidates = self.fetch_candidates(&hydrated_query, request_id).await;
        stats.sourced = candidates.len();
        info!(request_id, sourced = stats.sourced, "candidates sourced");

        // 3. Hydrate candidates (parallel)
        let hydrated = self
            .hydrate_candidates(&hydrated_query, candidates, request_id)
            .await;
        stats.after_hydration = hydrated.len();

        // 4. Filter (sequential)
        let (kept, removed) = self
            .run_filters(&hydrated_query, hydrated, &self.filters, request_id)
            .await;
        stats.after_filter = kept.len();
        stats.filtered_out = removed.len();
        info!(
            request_id,
            kept = kept.len(),
            removed = removed.len(),
            "pre-score filter"
        );

        // 5. Score (sequential — order matters)
        let scored = self.run_scorers(&hydrated_query, kept, request_id).await;
        stats.after_scoring = scored.len();

        // 6. Select (sort + truncate)
        let selected = if self.selector.enable(&hydrated_query) {
            self.selector.select(&hydrated_query, scored)
        } else {
            scored
        };

        // 7. Post-selection filters
        let (mut final_candidates, _) = self
            .run_filters(
                &hydrated_query,
                selected,
                &self.post_selection_filters,
                request_id,
            )
            .await;
        final_candidates.truncate(self.result_size);
        stats.selected = final_candidates.len();

        info!(request_id, selected = stats.selected, "feed built");

        // 8. Fire side effects (non-blocking)
        let arc_query = Arc::new(hydrated_query);
        let input = Arc::new(SideEffectInput {
            query: arc_query.clone(),
            selected_candidates: final_candidates.clone(),
        });
        let side_effects = self.side_effects.clone();
        tokio::spawn(async move {
            let futures = side_effects
                .iter()
                .filter(|se| se.enable(&input.query))
                .map(|se| se.run(input.clone()));
            let _ = join_all(futures).await;
        });

        PipelineResult {
            candidates: final_candidates,
            query: arc_query,
            stats,
        }
    }

    async fn hydrate_query(&self, query: Q, request_id: &str) -> Q {
        let enabled: Vec<_> = self
            .query_hydrators
            .iter()
            .filter(|h| h.enable(&query))
            .collect();
        let futures = enabled.iter().map(|h| h.hydrate(&query));
        let results = join_all(futures).await;

        let mut hydrated = query;
        for (hydrator, result) in enabled.iter().zip(results) {
            match result {
                Ok(h) => hydrator.update(&mut hydrated, h),
                Err(e) => {
                    error!(request_id, component = hydrator.name(), error = %e, "query hydrator failed")
                }
            }
        }
        hydrated
    }

    async fn fetch_candidates(&self, query: &Q, request_id: &str) -> Vec<C> {
        let enabled: Vec<_> = self.sources.iter().filter(|s| s.enable(query)).collect();
        let futures = enabled.iter().map(|s| s.get_candidates(query));
        let results = join_all(futures).await;

        let mut collected = Vec::new();
        for (source, result) in enabled.iter().zip(results) {
            match result {
                Ok(mut candidates) => {
                    info!(
                        request_id,
                        source = source.name(),
                        count = candidates.len(),
                        "source fetched"
                    );
                    collected.append(&mut candidates);
                }
                Err(e) => error!(request_id, source = source.name(), error = %e, "source failed"),
            }
        }
        collected
    }

    async fn hydrate_candidates(
        &self,
        query: &Q,
        mut candidates: Vec<C>,
        request_id: &str,
    ) -> Vec<C> {
        let enabled: Vec<_> = self.hydrators.iter().filter(|h| h.enable(query)).collect();
        let expected = candidates.len();
        let futures = enabled.iter().map(|h| h.hydrate(query, &candidates));
        let results = join_all(futures).await;

        for (hydrator, result) in enabled.iter().zip(results) {
            match result {
                Ok(hydrated) => {
                    if hydrated.len() == expected {
                        hydrator.update_all(&mut candidates, hydrated);
                    } else {
                        warn!(
                            request_id,
                            hydrator = hydrator.name(),
                            expected,
                            got = hydrated.len(),
                            "hydrator length mismatch, skipping"
                        );
                    }
                }
                Err(e) => {
                    error!(request_id, hydrator = hydrator.name(), error = %e, "hydrator failed")
                }
            }
        }
        candidates
    }

    async fn run_filters(
        &self,
        query: &Q,
        mut candidates: Vec<C>,
        filters: &[Box<dyn Filter<Q, C>>],
        request_id: &str,
    ) -> (Vec<C>, Vec<C>) {
        let mut all_removed = Vec::new();

        for filter in filters.iter().filter(|f| f.enable(query)) {
            let backup = candidates.clone();
            match filter.filter(query, candidates).await {
                Ok(result) => {
                    if !result.removed.is_empty() {
                        info!(
                            request_id,
                            filter = filter.name(),
                            removed = result.removed.len(),
                            "filter applied"
                        );
                    }
                    candidates = result.kept;
                    all_removed.extend(result.removed);
                }
                Err(e) => {
                    error!(request_id, filter = filter.name(), error = %e, "filter failed, using backup");
                    candidates = backup;
                }
            }
        }
        (candidates, all_removed)
    }

    async fn run_scorers(&self, query: &Q, mut candidates: Vec<C>, request_id: &str) -> Vec<C> {
        let expected = candidates.len();

        for scorer in self.scorers.iter().filter(|s| s.enable(query)) {
            match scorer.score(query, &candidates).await {
                Ok(scored) => {
                    if scored.len() == expected {
                        scorer.update_all(&mut candidates, scored);
                    } else {
                        warn!(
                            request_id,
                            scorer = scorer.name(),
                            expected,
                            got = scored.len(),
                            "scorer length mismatch, skipping"
                        );
                    }
                }
                Err(e) => error!(request_id, scorer = scorer.name(), error = %e, "scorer failed"),
            }
        }
        candidates
    }
}

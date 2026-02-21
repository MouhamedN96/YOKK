// yaatal-feed/src/pipeline/traits.rs
//
// Adapted from xai-org/x-algorithm candidate-pipeline (Apache-2.0)
// Simplified for YOKK's scale — no gRPC, no Kafka, no proto dependencies.
// Same trait-based composable architecture, voice-first focus.

use async_trait::async_trait;
use std::sync::Arc;

// ─── Source ────────────────────────────────────────────────────────

/// Fetches candidates from a data source.
/// Multiple sources run in parallel (e.g., following + discovery).
#[async_trait]
pub trait Source<Q, C>: Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: &Q) -> bool {
        true
    }

    async fn get_candidates(&self, query: &Q) -> Result<Vec<C>, FeedError>;

    fn name(&self) -> &'static str;
}

// ─── QueryHydrator ─────────────────────────────────────────────────

/// Enriches the feed query with additional context before sourcing.
/// Runs in parallel. E.g., fetch user's engagement history, language prefs.
#[async_trait]
pub trait QueryHydrator<Q>: Send + Sync
where
    Q: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: &Q) -> bool {
        true
    }

    async fn hydrate(&self, query: &Q) -> Result<Q, FeedError>;

    fn update(&self, query: &mut Q, hydrated: Q);

    fn name(&self) -> &'static str;
}

// ─── Hydrator ──────────────────────────────────────────────────────

/// Enriches candidates with additional data (author info, voice metadata, etc.).
/// Runs in parallel. Must return same number of candidates in same order.
#[async_trait]
pub trait Hydrator<Q, C>: Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: &Q) -> bool {
        true
    }

    async fn hydrate(&self, query: &Q, candidates: &[C]) -> Result<Vec<C>, FeedError>;

    fn update(&self, candidate: &mut C, hydrated: C);

    fn update_all(&self, candidates: &mut [C], hydrated: Vec<C>) {
        for (c, h) in candidates.iter_mut().zip(hydrated) {
            self.update(c, h);
        }
    }

    fn name(&self) -> &'static str;
}

// ─── Filter ────────────────────────────────────────────────────────

pub struct FilterResult<C> {
    pub kept: Vec<C>,
    pub removed: Vec<C>,
}

/// Partitions candidates into kept/removed. Runs sequentially.
#[async_trait]
pub trait Filter<Q, C>: Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: &Q) -> bool {
        true
    }

    async fn filter(&self, query: &Q, candidates: Vec<C>) -> Result<FilterResult<C>, FeedError>;

    fn name(&self) -> &'static str;
}

// ─── Scorer ────────────────────────────────────────────────────────

/// Scores candidates. Runs sequentially (order matters — ML predictions first,
/// then weighted combination, then diversity adjustments).
/// Must return same number of candidates in same order.
#[async_trait]
pub trait Scorer<Q, C>: Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: &Q) -> bool {
        true
    }

    async fn score(&self, query: &Q, candidates: &[C]) -> Result<Vec<C>, FeedError>;

    fn update(&self, candidate: &mut C, scored: C);

    fn update_all(&self, candidates: &mut [C], scored: Vec<C>) {
        for (c, s) in candidates.iter_mut().zip(scored) {
            self.update(c, s);
        }
    }

    fn name(&self) -> &'static str;
}

// ─── Selector ──────────────────────────────────────────────────────

/// Sorts and truncates candidates. Typically: sort by score desc, take top K.
pub trait Selector<Q, C>: Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn select(&self, _query: &Q, candidates: Vec<C>) -> Vec<C> {
        let mut sorted = self.sort(candidates);
        if let Some(limit) = self.size() {
            sorted.truncate(limit);
        }
        sorted
    }

    fn enable(&self, _query: &Q) -> bool {
        true
    }

    fn score(&self, candidate: &C) -> f64;

    fn sort(&self, candidates: Vec<C>) -> Vec<C> {
        let mut sorted = candidates;
        sorted.sort_by(|a, b| {
            self.score(b)
                .partial_cmp(&self.score(a))
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        sorted
    }

    fn size(&self) -> Option<usize> {
        None
    }

    fn name(&self) -> &'static str;
}

// ─── SideEffect ────────────────────────────────────────────────────

/// Fire-and-forget async actions after selection (caching, analytics, etc.).
#[derive(Clone)]
pub struct SideEffectInput<Q, C> {
    pub query: Arc<Q>,
    pub selected_candidates: Vec<C>,
}

#[async_trait]
pub trait SideEffect<Q, C>: Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: &Arc<Q>) -> bool {
        true
    }

    async fn run(&self, input: Arc<SideEffectInput<Q, C>>) -> Result<(), FeedError>;

    fn name(&self) -> &'static str;
}

// ─── Error ─────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct FeedError {
    pub stage: String,
    pub component: String,
    pub message: String,
}

impl std::fmt::Display for FeedError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[{}::{}] {}", self.stage, self.component, self.message)
    }
}

impl std::error::Error for FeedError {}

impl FeedError {
    pub fn new(stage: impl Into<String>, component: impl Into<String>, msg: impl Into<String>) -> Self {
        Self {
            stage: stage.into(),
            component: component.into(),
            message: msg.into(),
        }
    }
}

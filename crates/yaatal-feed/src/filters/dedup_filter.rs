use crate::pipeline::traits::*;
use crate::types::*;
use async_trait::async_trait;
use std::collections::HashSet;

pub struct DedupFilter;

#[async_trait]
impl Filter<FeedQuery, FeedCandidate> for DedupFilter {
    async fn filter(
        &self,
        _query: &FeedQuery,
        candidates: Vec<FeedCandidate>,
    ) -> Result<FilterResult<FeedCandidate>, FeedError> {
        let mut seen = HashSet::new();
        let mut kept = Vec::new();
        let mut removed = Vec::new();

        for c in candidates {
            if seen.insert(c.id.clone()) {
                kept.push(c);
            } else {
                removed.push(c);
            }
        }

        Ok(FilterResult { kept, removed })
    }

    fn name(&self) -> &'static str {
        "DedupFilter"
    }
}

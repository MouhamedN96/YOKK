use crate::pipeline::traits::*;
use crate::types::*;
use async_trait::async_trait;

pub struct SelfPostFilter;

#[async_trait]
impl Filter<FeedQuery, FeedCandidate> for SelfPostFilter {
    async fn filter(
        &self,
        query: &FeedQuery,
        candidates: Vec<FeedCandidate>,
    ) -> Result<FilterResult<FeedCandidate>, FeedError> {
        let (kept, removed) = candidates
            .into_iter()
            .partition(|c| c.author_id != query.user_id);
        Ok(FilterResult { kept, removed })
    }

    fn name(&self) -> &'static str {
        "SelfPostFilter"
    }
}

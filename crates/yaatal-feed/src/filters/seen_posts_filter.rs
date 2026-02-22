use crate::pipeline::traits::*;
use crate::types::*;
use async_trait::async_trait;
use std::collections::HashSet;

pub struct SeenPostsFilter;

#[async_trait]
impl Filter<FeedQuery, FeedCandidate> for SeenPostsFilter {
    async fn filter(
        &self,
        query: &FeedQuery,
        candidates: Vec<FeedCandidate>,
    ) -> Result<FilterResult<FeedCandidate>, FeedError> {
        let seen: HashSet<&str> = query
            .seen_post_ids
            .iter()
            .chain(query.served_post_ids.iter())
            .map(|s| s.as_str())
            .collect();

        let (kept, removed) = candidates
            .into_iter()
            .partition(|c| !seen.contains(c.id.as_str()));
        Ok(FilterResult { kept, removed })
    }

    fn name(&self) -> &'static str {
        "SeenPostsFilter"
    }
}

use crate::pipeline::traits::*;
use crate::types::*;
use async_trait::async_trait;
use std::collections::HashSet;

pub struct BlockedAuthorsFilter;

#[async_trait]
impl Filter<FeedQuery, FeedCandidate> for BlockedAuthorsFilter {
    async fn filter(
        &self,
        query: &FeedQuery,
        candidates: Vec<FeedCandidate>,
    ) -> Result<FilterResult<FeedCandidate>, FeedError> {
        let blocked: HashSet<&str> = query.blocked_ids.iter().map(|s| s.as_str()).collect();
        let muted: HashSet<&str> = query.muted_ids.iter().map(|s| s.as_str()).collect();
        let (kept, removed) = candidates.into_iter().partition(|c| {
            !blocked.contains(c.author_id.as_str()) && !muted.contains(c.author_id.as_str())
        });
        Ok(FilterResult { kept, removed })
    }

    fn name(&self) -> &'static str {
        "BlockedAuthorsFilter"
    }
}

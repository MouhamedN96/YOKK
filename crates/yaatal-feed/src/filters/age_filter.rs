use crate::pipeline::traits::*;
use crate::types::*;
use crate::weights as w;
use async_trait::async_trait;
use chrono::Utc;

pub struct AgeFilter;

#[async_trait]
impl Filter<FeedQuery, FeedCandidate> for AgeFilter {
    async fn filter(
        &self,
        _query: &FeedQuery,
        candidates: Vec<FeedCandidate>,
    ) -> Result<FilterResult<FeedCandidate>, FeedError> {
        let now = Utc::now();
        let max_age = chrono::Duration::hours(w::MAX_POST_AGE_HOURS as i64);
        let (kept, removed) = candidates.into_iter().partition(|c| {
            c.created_at
                .map(|t| (now - t) < max_age)
                .unwrap_or(false) // unknown age = drop
        });
        Ok(FilterResult { kept, removed })
    }

    fn name(&self) -> &'static str {
        "AgeFilter"
    }
}

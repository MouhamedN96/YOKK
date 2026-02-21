// yaatal-feed/src/selectors/mod.rs

use crate::pipeline::traits::Selector;
use crate::types::*;

pub struct TopKSelector {
    pub k: usize,
}

impl Default for TopKSelector {
    fn default() -> Self {
        Self {
            k: 25, // Default replaced
        }
    }
}

impl Selector<FeedQuery, FeedCandidate> for TopKSelector {
    fn score(&self, candidate: &FeedCandidate) -> f64 {
        candidate.final_score.or(candidate.weighted_score).unwrap_or(0.0)
    }

    fn size(&self) -> Option<usize> {
        Some(self.k)
    }

    fn name(&self) -> &'static str {
        "TopKSelector"
    }
}

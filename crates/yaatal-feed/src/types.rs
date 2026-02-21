// yaatal-feed/src/types.rs
//
// Generic equivalents of X's PostCandidate + ScoredPostsQuery.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ─── Feed Query ────────────────────────────────────────────────────
// What X calls ScoredPostsQuery → what we call FeedQuery.

#[derive(Clone, Debug, Default)]
pub struct FeedQuery {
    pub user_id: String,
    pub request_id: String,
    pub language_codes: Vec<String>,      // user's preferred languages
    pub country_code: String,             // e.g., "SN"
    pub seen_post_ids: Vec<String>,       // already seen — don't re-serve
    pub served_post_ids: Vec<String>,     // served this session
    pub in_network_only: bool,            // false = include discovery
    pub cursor: Option<String>,           // pagination
    pub limit: usize,                     // how many to return

    // Hydrated by QueryHydrators (start empty, get populated):
    pub following_ids: Vec<String>,       // who this user follows
    pub blocked_ids: Vec<String>,         // who this user blocked
    pub muted_ids: Vec<String>,           // who this user muted
    pub engagement_history: Vec<EngagementEvent>, // recent actions for scoring context
}

impl FeedQuery {
    pub fn new(user_id: impl Into<String>, country: impl Into<String>, limit: usize) -> Self {
        Self {
            user_id: user_id.into(),
            request_id: Uuid::new_v4().to_string(),
            country_code: country.into(),
            limit,
            ..Default::default()
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EngagementEvent {
    pub item_id: String,
    pub action: EngagementAction,
    pub timestamp: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum EngagementAction {
    Listen,              // played voice post
    ListenFull,          // listened to completion
    Reply,               // replied
    Share,               // shared item
    Like,                // liked/hearted
    Skip,                // scrolled past quickly
    Mute,                // muted author
    Block,               // blocked author
    Report,              // reported item
    ProfileClick,        // tapped author profile
    Follow,              // followed author
    AddToCart,           // For commerce (NJOOBA)
    Purchase,            // For commerce (NJOOBA)
    Enroll,              // For learning (DAARA)
    
    // Extensible catch-all
    Other(String),
}

// ─── Feed Candidate ────────────────────────────────────────────────
// What X calls PostCandidate → what we call FeedCandidate.

#[derive(Clone, Debug, Default)]
pub struct FeedCandidate {
    // Identity
    pub id: String,
    pub author_id: String,
    pub created_at: Option<DateTime<Utc>>,

    // Content types
    pub content_type: ContentType,
    pub text: Option<String>,
    pub media_urls: Vec<String>,
    pub language: Option<String>,

    // Voice specific
    pub voice_url: Option<String>,
    pub voice_duration_ms: Option<u32>,

    // Social graph
    pub in_reply_to_id: Option<String>,
    pub repost_of_id: Option<String>,
    pub in_network: Option<bool>,

    // Author info (hydrated)
    pub author_username: Option<String>,
    pub author_display_name: Option<String>,
    pub author_followers_count: Option<u32>,
    pub author_is_verified: Option<bool>,

    // Engagement predictions (populated by scorers)
    pub scores: EngagementScores,

    // Final ranking
    pub weighted_score: Option<f64>,
    pub final_score: Option<f64>,

    // Pipeline metadata
    pub source_name: Option<String>,
}

#[derive(Clone, Debug, Default, PartialEq)]
pub enum ContentType {
    #[default]
    Text,            // Standard text post
    Voice,           // Voice-only (YOKK)
    VoiceText,       // Voice + Transcription
    ProductListing,  // NJOOBA (Commerce)
    CourseModule,    // DAARA (Learning)
    Repost,          // simple reshare
}

/// Engagement probability predictions
#[derive(Clone, Debug, Default)]
pub struct EngagementScores {
    // Positive signals
    pub p_listen: Option<f64>,
    pub p_listen_full: Option<f64>,
    pub p_reply: Option<f64>,
    pub p_like: Option<f64>,
    pub p_share: Option<f64>,
    pub p_repost: Option<f64>,
    pub p_profile_click: Option<f64>,
    pub p_follow: Option<f64>,
    
    // Commerce specific
    pub p_add_to_cart: Option<f64>,
    pub p_purchase: Option<f64>,

    // Negative signals
    pub p_skip: Option<f64>,
    pub p_mute: Option<f64>,
    pub p_block: Option<f64>,
    pub p_report: Option<f64>,

    // Continuous
    pub predicted_listen_pct: Option<f64>,
}

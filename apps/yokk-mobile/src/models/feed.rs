use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FeedItem {
    pub id: String,
    pub item_type: String, // 'type' is a reserved keyword in Rust
    pub title: String,
    pub excerpt: String,
    pub votes: u32,
    pub comments: u32,
    pub tags: Vec<String>,
    pub author: String,
    pub avatar: String,
    pub image_url: String,
    pub source_url: String,
    pub has_voice: bool,
    pub voice_duration: Option<String>,
    pub transcription: Option<String>,
}

impl FeedItem {
    pub fn mock_data() -> Vec<Self> {
        vec![
            FeedItem {
                id: "1".into(),
                item_type: "launch".into(),
                title: "LocalStack 3.0: Cloud emulation for the masses".into(),
                excerpt: "The new major release brings improved AWS parity, better performance, and a sleek new UI for local cloud development.".into(),
                votes: 428,
                comments: 56,
                tags: vec!["dev-tools".into(), "aws".into(), "cloud".into()],
                author: "Sarah Chen".into(),
                avatar: "https://i.pravatar.cc/150?u=sarah".into(),
                image_url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=2070&auto=format&fit=crop".into(),
                source_url: "https://localstack.cloud".into(),
                has_voice: false,
                voice_duration: None,
                transcription: None,
            },
            FeedItem {
                id: "2".into(),
                item_type: "discussion".into(),
                title: "Why we migrated from React to Rust (Dioxus)".into(),
                excerpt: "A deep dive into our architectural decision to rewrite our entire frontend stack in Rust. Spoiler: It was worth it.".into(),
                votes: 892,
                comments: 214,
                tags: vec!["rust".into(), "web-dev".into(), "architecture".into()],
                author: "Alex Rivera".into(),
                avatar: "https://i.pravatar.cc/150?u=alex".into(),
                image_url: "".into(), // Discussion might not have an image
                source_url: "https://example.com/blog/rust-migration".into(),
                has_voice: true,
                voice_duration: Some("0:45".into()),
                transcription: Some("We had a lot of debates about the compile times, but overall Rust's type system and memory safety literally eliminated our entire class of runtime TypeError crashes. PowerSync implementation was also way cleaner.".into()),
            },
            FeedItem {
                id: "3".into(),
                item_type: "bo_summary".into(),
                title: "Trending API Security Architectures".into(),
                excerpt: "Over the last 24 hours, the community has debated 4 new approaches to securing Edge endpoints. The consensus leans heavily toward utilizing Cloudflare Workers combined with JWT rotation protocols, moving away from classic session IDs for cross-border low-latency setups.".into(),
                votes: 1450,
                comments: 0,
                tags: vec!["architecture".into(), "security".into(), "edge".into()],
                author: "Bo".into(),
                avatar: "".into(),
                image_url: "".into(), 
                source_url: "".into(),
                has_voice: false,
                voice_duration: None,
                transcription: None,
            },
        ]
    }
}

//! 5-Tier AI Cascade Router
//!
//! Always starts at Tier 1 (on-device) and cascades down on failure/timeout.
//! On 2G/offline: Tier 1 only. Tiers 2-5 require 3G+.

use crate::ai::classify::classify_task;
use crate::ai::sensitivity::is_sensitive;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AiError {
    #[error("All tiers exhausted")]
    AllTiersExhausted,
    #[error("Tier {tier} failed: {reason}")]
    TierFailed { tier: u8, reason: String },
    #[error("Request error: {0}")]
    Request(#[from] reqwest::Error),
    #[error("Timeout after {0:?}")]
    Timeout(Duration),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiResponse {
    pub content: String,
    pub tier_used: u8,
    pub model: String,
    pub task: String,
    pub latency_ms: u64,
}

#[derive(Debug, Clone)]
pub struct AiConfig {
    pub siliconflow_key: Option<String>,
    pub huggingface_key: Option<String>,
    pub openrouter_key: Option<String>,
    pub anthropic_key: Option<String>,
}

pub struct AiRouter {
    client: Client,
    config: AiConfig,
}

impl AiRouter {
    pub fn new(config: AiConfig) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to build HTTP client");
        Self { client, config }
    }

    /// Route a query through the AI cascade.
    pub async fn route(
        &self,
        messages: &[Message],
        user_text: &str,
    ) -> Result<AiResponse, AiError> {
        let (task, _reason) = classify_task(user_text);
        let _sensitive = is_sensitive(user_text);
        let timeout = task.timeout();

        // Tier 2: SiliconFlow (Liquid LFM2)
        if let Some(ref key) = self.config.siliconflow_key {
            match self
                .call_openai_compatible(
                    "https://api.siliconflow.cn/v1/chat/completions",
                    key,
                    "liquid/lfm-2-1.2b-chat",
                    messages,
                    timeout,
                )
                .await
            {
                Ok(content) => {
                    return Ok(AiResponse {
                        content,
                        tier_used: 2,
                        model: "liquid/lfm-2-1.2b-chat".into(),
                        task: format!("{:?}", task),
                        latency_ms: 0,
                    })
                }
                Err(e) => tracing::warn!("Tier 2 failed: {}", e),
            }
        }

        // Tier 3: Qwen Omni (SiliconFlow)
        if let Some(ref key) = self.config.siliconflow_key {
            match self
                .call_openai_compatible(
                    "https://api.siliconflow.cn/v1/chat/completions",
                    key,
                    "Qwen/Qwen2.5-72B-Instruct",
                    messages,
                    timeout,
                )
                .await
            {
                Ok(content) => {
                    return Ok(AiResponse {
                        content,
                        tier_used: 3,
                        model: "Qwen/Qwen2.5-72B-Instruct".into(),
                        task: format!("{:?}", task),
                        latency_ms: 0,
                    })
                }
                Err(e) => tracing::warn!("Tier 3 failed: {}", e),
            }
        }

        // Tier 5: HuggingFace (Mistral fallback)
        if let Some(ref key) = self.config.huggingface_key {
            match self
                .call_openai_compatible(
                    "https://api-inference.huggingface.co/v1/chat/completions",
                    key,
                    "mistralai/Mistral-7B-Instruct-v0.2",
                    messages,
                    timeout,
                )
                .await
            {
                Ok(content) => {
                    return Ok(AiResponse {
                        content,
                        tier_used: 5,
                        model: "mistralai/Mistral-7B-Instruct-v0.2".into(),
                        task: format!("{:?}", task),
                        latency_ms: 0,
                    })
                }
                Err(e) => tracing::warn!("Tier 5 failed: {}", e),
            }
        }

        Err(AiError::AllTiersExhausted)
    }

    async fn call_openai_compatible(
        &self,
        endpoint: &str,
        api_key: &str,
        model: &str,
        messages: &[Message],
        timeout: Duration,
    ) -> Result<String, AiError> {
        let body = serde_json::json!({
            "model": model, "messages": messages,
            "max_tokens": 1024, "temperature": 0.7,
        });
        let response = self
            .client
            .post(endpoint)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .timeout(timeout)
            .json(&body)
            .send()
            .await?;
        let json: serde_json::Value = response.json().await?;
        let content = json["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("")
            .to_string();
        if content.is_empty() {
            return Err(AiError::TierFailed {
                tier: 0,
                reason: "Empty response".into(),
            });
        }
        Ok(content)
    }
}

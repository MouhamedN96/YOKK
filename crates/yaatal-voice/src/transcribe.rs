//! Audio transcription via HuggingFace Whisper API

use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TranscriptionError {
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),
    #[error("API error ({status}): {message}")]
    Api { status: u16, message: String },
    #[error("Model is loading, retry after {estimated_time:.0}s")]
    ModelLoading { estimated_time: f64 },
    #[error("Empty transcription result")]
    EmptyResult,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptionResult {
    pub text: String,
    pub model: String,
    pub duration_ms: u64,
}

const DEFAULT_MODEL: &str = "openai/whisper-small";
const DEFAULT_TIMEOUT: Duration = Duration::from_secs(30);

pub async fn transcribe_audio(
    client: &Client,
    api_key: &str,
    audio_bytes: &[u8],
) -> Result<TranscriptionResult, TranscriptionError> {
    transcribe_with_model(client, api_key, audio_bytes, DEFAULT_MODEL).await
}

pub async fn transcribe_with_model(
    client: &Client,
    api_key: &str,
    audio_bytes: &[u8],
    model: &str,
) -> Result<TranscriptionResult, TranscriptionError> {
    let url = format!(
        "https://api-inference.huggingface.co/models/{}",
        model
    );

    let start = std::time::Instant::now();

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "audio/wav")
        .timeout(DEFAULT_TIMEOUT)
        .body(audio_bytes.to_vec())
        .send()
        .await?;

    let status = response.status();
    let json: serde_json::Value = response.json().await?;
    let duration_ms = start.elapsed().as_millis() as u64;

    // Handle HuggingFace-specific errors
    if !status.is_success() {
        // Model loading (503 with estimated_time)
        if status.as_u16() == 503 {
            if let Some(time) = json["estimated_time"].as_f64() {
                return Err(TranscriptionError::ModelLoading {
                    estimated_time: time,
                });
            }
        }
        let message = json["error"]
            .as_str()
            .unwrap_or("Unknown API error")
            .to_string();
        return Err(TranscriptionError::Api {
            status: status.as_u16(),
            message,
        });
    }

    // Extract transcription text
    let text = json["text"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or(TranscriptionError::EmptyResult)?;

    if text.is_empty() {
        return Err(TranscriptionError::EmptyResult);
    }

    Ok(TranscriptionResult {
        text,
        model: model.to_string(),
        duration_ms,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transcription_result_serializes() {
        let result = TranscriptionResult {
            text: "Hello world".into(),
            model: "openai/whisper-small".into(),
            duration_ms: 1234,
        };
        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("Hello world"));
        assert!(json.contains("1234"));
    }

    #[test]
    fn test_error_display() {
        let err = TranscriptionError::ModelLoading {
            estimated_time: 20.5,
        };
        let msg = format!("{}", err);
        assert!(msg.contains("retry after"));
        assert!(msg.contains("20"));
    }

    #[test]
    fn test_api_error_display() {
        let err = TranscriptionError::Api {
            status: 429,
            message: "Rate limit exceeded".into(),
        };
        let msg = format!("{}", err);
        assert!(msg.contains("429"));
        assert!(msg.contains("Rate limit"));
    }
}

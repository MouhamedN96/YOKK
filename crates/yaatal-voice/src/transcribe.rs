use thiserror::Error;
// use candle_core::{Device, Tensor}; // commented out until wired
// use hf_hub::api::sync::Api;

#[derive(Debug, Error)]
pub enum TranscribeError {
    #[error("Cloud API error: {0}")]
    CloudError(#[from] reqwest::Error),
    #[error("Local ML engine error: {0}")]
    LocalInferenceError(#[from] candle_core::Error),
    #[error("Model loading failed")]
    ModelLoadError,
}

/// The intelligent transcription router.
/// Decides whether to use cloud APIs or run the local `candle` Whisper model
/// based on network condition flags.
pub struct TranscriptionRouter;

impl TranscriptionRouter {
    /// Transcribes an audio file payload (e.g., WAV).
    /// If `offline` is true, forces the use of the local Candle Whisper model.
    pub async fn transcribe(audio_payload: &[u8], offline: bool) -> Result<String, TranscribeError> {
        if offline {
            tracing::info!("Network offline or gated: routing to pure-Rust local Candle model");
            // NOTE: In a real environment, Model loading should be cached statically
            // or instantiated once at startup, not per-request, to save RAM and time.
            Self::transcribe_local(audio_payload)
        } else {
            tracing::info!("Network stable: routing to Cloud Whisper API to save battery");
            Self::transcribe_cloud(audio_payload).await
        }
    }

    fn transcribe_local(_audio_payload: &[u8]) -> Result<String, TranscribeError> {
        // TODO(#E6): Wire up candle-transformers Whisper model here.
        // Requires importing hf_hub to fetch weights natively if not present,
        // moving tensors to Device::Cpu, and decoding the logits.
        Ok(String::from("[Local Transcript Stub] Yaatal Offline Voice"))
    }

    async fn transcribe_cloud(_audio_payload: &[u8]) -> Result<String, TranscribeError> {
        // TODO(#E6): Wire up Reqwest payload to a remote cascade router.
        Ok(String::from("[Cloud Transcript Stub] Yaatal Cloud Voice"))
    }
}

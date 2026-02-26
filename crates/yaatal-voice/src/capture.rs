use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::{Arc, Mutex};
use thiserror::Error;

/// Errors that can occur during audio capture.
#[derive(Debug, Error)]
pub enum CaptureError {
    #[error("No input device available")]
    NoDevice,
    #[error("Failed to get supported config: {0}")]
    SupportedStreamConfigError(#[from] cpal::SupportedStreamConfigError),
    #[error("Failed to build stream: {0}")]
    BuildStreamError(#[from] cpal::BuildStreamError),
    #[error("Failed to play stream: {0}")]
    PlayStreamError(#[from] cpal::PlayStreamError),
    #[error("Failed to pause stream: {0}")]
    PauseStreamError(#[from] cpal::PauseStreamError),
    #[error("Stream is already recording")]
    AlreadyRecording,
    #[error("Stream is not recording")]
    NotRecording,
}

/// A service to capture audio from the microphone using standard `cpal`.
pub struct VoiceRecorder {
    host: cpal::Host,
    device: cpal::Device,
    // Store the stream so we can pause/play it, and a buffer to hold the raw PCM data.
    // In a real app, this buffer grows over time, so we must cap it or compress it on the fly.
    // For now, it holds the raw raw f32 samples.
    buffer: Arc<Mutex<Vec<f32>>>,
    stream: Option<cpal::Stream>,
}

impl VoiceRecorder {
    /// Creates a new `VoiceRecorder` targeting the default system input device.
    pub fn new() -> Result<Self, CaptureError> {
        let host = cpal::default_host();
        let device = host.default_input_device().ok_or(CaptureError::NoDevice)?;

        Ok(Self {
            host,
            device,
            buffer: Arc::new(Mutex::new(Vec::new())),
            stream: None,
        })
    }

    /// Starts recording audio into the internal buffer.
    pub fn start(&mut self) -> Result<(), CaptureError> {
        if self.stream.is_some() {
            return Err(CaptureError::AlreadyRecording);
        }

        // Use a standard config (e.g., mono, 16kHz) to keep file size small
        let config = self.device.default_input_config()?;
        let sample_format = config.sample_format();
        let config: cpal::StreamConfig = config.into();

        let buffer_clone = Arc::clone(&self.buffer);

        // A simple callback that pushes samples into our buffer.
        let err_fn = move |err| {
            tracing::error!("an error occurred on stream: {}", err);
        };

        let stream = match sample_format {
            cpal::SampleFormat::F32 => self.device.build_input_stream(
                &config,
                move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    if let Ok(mut buf) = buffer_clone.lock() {
                        buf.extend_from_slice(data);
                    }
                },
                err_fn,
                None, // Use default timeout
            )?,
            // Fallback for i16 and u16 are omitted for brevity, but would be matched here
            _ => {
                return Err(CaptureError::BuildStreamError(
                    cpal::BuildStreamError::FormatNotSupported,
                ))
            }
        };

        stream.play()?;
        self.stream = Some(stream);

        Ok(())
    }

    /// Stops recording and returns the raw PCM buffer.
    pub fn stop(&mut self) -> Result<Vec<f32>, CaptureError> {
        if let Some(stream) = self.stream.take() {
            stream.pause()?;
            // Take the buffer's contents and clear it for the next recording
            let mut buf = self.buffer.lock().unwrap();
            let data = std::mem::take(&mut *buf);
            Ok(data)
        } else {
            Err(CaptureError::NotRecording)
        }
    }
}

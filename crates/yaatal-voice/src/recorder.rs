//! Voice recorder using cpal
//!
//! [UNVERIFIED] cpal AAudio backend on Android inside Dioxus.
//! This is the Day 1 kill gate — test before building on top of it.

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::{Arc, Mutex};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum RecorderError {
    #[error("No audio input device available")]
    NoDevice,
    #[error("Failed to build audio stream: {0}")]
    BuildStream(String),
    #[error("Audio encoding error: {0}")]
    Encoding(String),
    #[error("Recorder lock poisoned — audio callback panicked")]
    LockPoisoned,
    #[error("Recording already in progress")]
    AlreadyRecording,
}

pub struct VoiceRecorder {
    samples: Arc<Mutex<Vec<f32>>>,
    sample_rate: u32,
    channels: u16,
    recording: Arc<Mutex<bool>>,
}

impl VoiceRecorder {
    pub fn new() -> Result<Self, RecorderError> {
        let host = cpal::default_host();
        let device = host.default_input_device().ok_or(RecorderError::NoDevice)?;
        let config = device
            .default_input_config()
            .map_err(|e| RecorderError::BuildStream(e.to_string()))?;
        Ok(Self {
            samples: Arc::new(Mutex::new(Vec::new())),
            sample_rate: config.sample_rate().0,
            channels: config.channels(),
            recording: Arc::new(Mutex::new(false)),
        })
    }

    pub fn start(&self) -> Result<cpal::Stream, RecorderError> {
        // Guard against concurrent recording sessions
        {
            let mut is_recording = self
                .recording
                .lock()
                .map_err(|_| RecorderError::LockPoisoned)?;
            if *is_recording {
                return Err(RecorderError::AlreadyRecording);
            }
            *is_recording = true;
        }

        let host = cpal::default_host();
        let device = host.default_input_device().ok_or(RecorderError::NoDevice)?;
        let config = device
            .default_input_config()
            .map_err(|e| RecorderError::BuildStream(e.to_string()))?;

        // Validate config matches what we stored in new()
        if config.sample_rate().0 != self.sample_rate || config.channels() != self.channels {
            tracing::warn!(
                "Audio device config changed: expected {}Hz/{}ch, got {}Hz/{}ch",
                self.sample_rate,
                self.channels,
                config.sample_rate().0,
                config.channels()
            );
        }

        let samples = self.samples.clone();
        let recording = self.recording.clone();
        let stream = device
            .build_input_stream(
                &config.into(),
                move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    if let Ok(mut buffer) = samples.lock() {
                        buffer.extend_from_slice(data);
                    }
                    // If lock is poisoned, silently drop frames — logging in
                    // the audio callback would block and cause worse problems.
                },
                move |err| {
                    tracing::error!("Audio stream error: {}", err);
                    // Mark recording as stopped on stream error
                    if let Ok(mut r) = recording.lock() {
                        *r = false;
                    }
                },
                None,
            )
            .map_err(|e| RecorderError::BuildStream(e.to_string()))?;
        stream
            .play()
            .map_err(|e| RecorderError::BuildStream(e.to_string()))?;
        Ok(stream)
    }

    /// Stop recording and encode captured audio as 16-bit PCM WAV.
    ///
    /// Returns WAV bytes suitable for Whisper and other speech APIs.
    /// Converts from f32 [-1.0, 1.0] to i16 [-32768, 32767].
    pub fn stop_and_encode_wav(&self) -> Result<Vec<u8>, RecorderError> {
        // Mark recording as stopped
        if let Ok(mut r) = self.recording.lock() {
            *r = false;
        }

        let samples = self
            .samples
            .lock()
            .map_err(|_| RecorderError::LockPoisoned)?
            .clone();

        if samples.is_empty() {
            return Err(RecorderError::Encoding("No audio data recorded".into()));
        }

        // Encode as 16-bit PCM WAV (universally compatible with speech APIs)
        let spec = hound::WavSpec {
            channels: self.channels,
            sample_rate: self.sample_rate,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };
        let mut cursor = std::io::Cursor::new(Vec::new());
        {
            let mut writer = hound::WavWriter::new(&mut cursor, spec)
                .map_err(|e| RecorderError::Encoding(e.to_string()))?;
            for &sample in &samples {
                // Clamp and convert f32 -> i16
                let clamped = sample.clamp(-1.0, 1.0);
                let pcm = (clamped * i16::MAX as f32) as i16;
                writer
                    .write_sample(pcm)
                    .map_err(|e| RecorderError::Encoding(e.to_string()))?;
            }
            writer
                .finalize()
                .map_err(|e| RecorderError::Encoding(e.to_string()))?;
        }
        Ok(cursor.into_inner())
    }

    pub fn clear(&self) -> Result<(), RecorderError> {
        self.samples
            .lock()
            .map_err(|_| RecorderError::LockPoisoned)?
            .clear();
        Ok(())
    }

    pub fn is_recording(&self) -> bool {
        self.recording.lock().map(|r| *r).unwrap_or(false)
    }

    pub fn sample_count(&self) -> usize {
        self.samples.lock().map(|s| s.len()).unwrap_or(0)
    }

    pub fn sample_rate(&self) -> u32 {
        self.sample_rate
    }

    pub fn channels(&self) -> u16 {
        self.channels
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_empty_returns_error() {
        // Build a recorder with dummy config (bypass device)
        let recorder = VoiceRecorder {
            samples: Arc::new(Mutex::new(Vec::new())),
            sample_rate: 16000,
            channels: 1,
            recording: Arc::new(Mutex::new(false)),
        };
        let result = recorder.stop_and_encode_wav();
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), RecorderError::Encoding(_)));
    }

    #[test]
    fn test_encode_wav_produces_valid_header() {
        let samples: Vec<f32> = (0..1600).map(|i| i as f32 / 1600.0 * 2.0 - 1.0).collect();
        let recorder = VoiceRecorder {
            samples: Arc::new(Mutex::new(samples)),
            sample_rate: 16000,
            channels: 1,
            recording: Arc::new(Mutex::new(false)),
        };
        let wav = recorder.stop_and_encode_wav().unwrap();
        // RIFF header check
        assert_eq!(&wav[0..4], b"RIFF");
        assert_eq!(&wav[8..12], b"WAVE");
    }

    #[test]
    fn test_encode_wav_16bit_pcm() {
        let samples = vec![0.0_f32, 0.5, -0.5, 1.0, -1.0];
        let recorder = VoiceRecorder {
            samples: Arc::new(Mutex::new(samples)),
            sample_rate: 16000,
            channels: 1,
            recording: Arc::new(Mutex::new(false)),
        };
        let wav = recorder.stop_and_encode_wav().unwrap();
        // Verify it's parseable by hound
        let reader = hound::WavReader::new(std::io::Cursor::new(&wav)).unwrap();
        let spec = reader.spec();
        assert_eq!(spec.bits_per_sample, 16);
        assert_eq!(spec.sample_format, hound::SampleFormat::Int);
        assert_eq!(spec.sample_rate, 16000);
        assert_eq!(spec.channels, 1);
    }

    #[test]
    fn test_clear_resets_samples() {
        let recorder = VoiceRecorder {
            samples: Arc::new(Mutex::new(vec![1.0, 2.0, 3.0])),
            sample_rate: 16000,
            channels: 1,
            recording: Arc::new(Mutex::new(false)),
        };
        assert_eq!(recorder.sample_count(), 3);
        recorder.clear().unwrap();
        assert_eq!(recorder.sample_count(), 0);
    }

    #[test]
    fn test_f32_to_i16_clamping() {
        // Values outside [-1.0, 1.0] should be clamped
        let samples = vec![2.0_f32, -2.0, 0.0];
        let recorder = VoiceRecorder {
            samples: Arc::new(Mutex::new(samples)),
            sample_rate: 16000,
            channels: 1,
            recording: Arc::new(Mutex::new(false)),
        };
        let wav = recorder.stop_and_encode_wav().unwrap();
        let mut reader = hound::WavReader::new(std::io::Cursor::new(&wav)).unwrap();
        let decoded: Vec<i16> = reader.samples::<i16>().map(|s| s.unwrap()).collect();
        assert_eq!(decoded[0], i16::MAX); // 2.0 clamped to 1.0 -> MAX
        assert_eq!(decoded[1], -i16::MAX); // -2.0 clamped to -1.0 -> -MAX
        assert_eq!(decoded[2], 0); // 0.0 -> 0
    }
}

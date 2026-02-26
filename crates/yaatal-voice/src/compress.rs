use hound::{WavSpec, WavWriter};
use std::io::Cursor;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CompressError {
    #[error("Hound encoding error: {0}")]
    HoundError(#[from] hound::Error),
}

/// Encodes raw PCM f32 audio into a WAV formatted byte vector.
/// This format is technically uncompressed, but it adds the necessary headers
/// for Whisper and other audio APIs to read the data correctly.
pub fn encode_wav(
    samples: &[f32],
    sample_rate: u32,
    channels: u16,
) -> Result<Vec<u8>, CompressError> {
    let spec = WavSpec {
        channels,
        sample_rate,
        bits_per_sample: 32,
        sample_format: hound::SampleFormat::Float,
    };

    let mut cursor = Cursor::new(Vec::new());
    {
        // Must drop the writer to ensure it flushes properly
        let mut writer = WavWriter::new(&mut cursor, spec)?;
        for &sample in samples {
            writer.write_sample(sample)?;
        }
        writer.finalize()?;
    }

    Ok(cursor.into_inner())
}

/// Placeholder for true bandwidth-crushing Opus encoding.
/// This avoids C++ bindings (`libopus`) during the early build phases,
/// but will be fully implemented when YOKK PWA integration requires it.
pub fn encode_opus(_samples: &[f32]) -> Result<Vec<u8>, CompressError> {
    unimplemented!("Opus encoding requires C-bindings and is deferred to E8/YOKK integration.")
}

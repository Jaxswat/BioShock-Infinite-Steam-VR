

pub mod speech_anim {
    use std::fs::File;
    use std::io::BufReader;
    use std::path::Path;
    use hound::{WavReader};

    pub fn generate_speech_anim(frame_rate: usize, audio_file_path: &Path) -> Vec<f64> {
        let file = File::open(audio_file_path).expect(format!("Failed to open the file: {}", audio_file_path.display()).as_str());
        let reader = BufReader::new(file);
        let mut wav_reader = WavReader::new(reader).expect("Failed to create WavReader");

        let spec = wav_reader.spec();
        let num_channels = spec.channels as usize;

        let mut clip_peak_amplitude: f64 = 0.0;
        let samples: Vec<f64> = wav_reader
            .samples::<i16>()
            .map(|s| {
                let sample = s.expect("Failed to read sample") as f64 / i16::MAX as f64;
                clip_peak_amplitude = clip_peak_amplitude.max(sample);
                sample
            })
            .collect();

        let samples_per_frame = (spec.sample_rate as usize) / frame_rate;
        let mouth_movement: Vec<f64> = samples
            .chunks(num_channels * samples_per_frame)
            .map(|chunk| {
                let frame_peak_amplitude = chunk
                    .iter()
                    .fold(0.0, |max_val: f64, &val| max_val.max(val.abs()));
                frame_peak_amplitude / clip_peak_amplitude
            })
            .collect();

        mouth_movement
    }
}

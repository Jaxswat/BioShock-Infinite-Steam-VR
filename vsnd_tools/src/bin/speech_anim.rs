use std::fs::File;
use std::io::BufReader;
use bsi_tools_lib::format::format_float;
use hound::{WavReader};

fn main() {
    const FRAME_RATE: usize = 10;

    let file = File::open("speech.wav").expect("Failed to open the file");
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

    let samples_per_frame = (spec.sample_rate as usize) / FRAME_RATE;
    let mouth_movement: Vec<f64> = samples
        .chunks(num_channels * samples_per_frame)
        .map(|chunk| {
            let frame_peak_amplitude  = chunk
                .iter()
                .fold(0.0, |max_val: f64, &val| max_val.max(val.abs()));
            frame_peak_amplitude / clip_peak_amplitude
        })
        .collect();

    println!("frame rate: {} sample rate: {}", FRAME_RATE, spec.sample_rate);
    println!("animation keyframes: {:?}", mouth_movement.len());
    println!("animation: {:?}", mouth_movement.iter().map(|&val| format_float(val)).collect::<Vec<String>>());
}

mod clip;
mod speech_anim;

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use bsi_tools_lib::format::format_float;
use toml::de;
use serde::Deserialize;
use crate::clip::clip::{Clip, ClipsMap};
use crate::speech_anim::speech_anim::generate_speech_anim;

#[derive(Debug, Deserialize)]
struct TomlClip {
    speech_tag: String,
    speech_type: String,
    sentiment: String,
    intensity: String,
    #[serde(default = "default_bool_true")]
    animate: Option<bool>,
}

fn default_bool_true() -> Option<bool> {
    Some(true)
}

fn create_tag_to_folder_map() -> HashMap<&'static str, &'static str> {
    let mut map = HashMap::new();
    map.insert("greeting", "greetings");
    map.insert("hmm", "hmms");
    map.insert("oh", "hmms");
    map.insert("lookAtThis", "look_at_this");
    map.insert("smelly", "smelly");
    map.insert("foundMoney", "found_money");
    map.insert("catchMoney", "chirps");
    map.insert("playerFoundMoney", "chirps");
    map.insert("toss", "toss");
    map.insert("chirp", "chirps");
    map.insert("body", "body");
    map
}

fn read_toml_file(file_path: &Path) -> Result<ClipsMap, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(file_path)?;
    let clips_from_file: HashMap<String, TomlClip> = de::from_str(&content)?;
    let tags_to_folders = create_tag_to_folder_map();

    let clips: ClipsMap = clips_from_file
        .into_iter()
        .map(|(key, clip_data)| {
            let clip = Clip {
                asset_name: key.clone(),
                asset_folder: tags_to_folders[&clip_data.speech_tag.as_str()].to_string(),
                speech_tag: clip_data.speech_tag,
                speech_type: clip_data.speech_type,
                sentiment: clip_data.sentiment,
                intensity: clip_data.intensity,
                animate: clip_data.animate.unwrap(),
            };
            (key, clip)
        })
        .collect();

    Ok(clips)
}

fn process_directory(directory: &Path) -> Result<ClipsMap, Box<dyn std::error::Error>> {
    let mut all_clips = ClipsMap::new();

    for entry in fs::read_dir(directory)? {
        let entry = entry?;
        let path = entry.path();

        if path.extension().and_then(|ext| ext.to_str()) == Some("toml") {
            let clips = read_toml_file(&path)?;
            all_clips.extend(clips);
        }
    }

    Ok(all_clips)
}

const VSND_LIZ_CLIP_DIRECTORY_PREFIX: &str = "sounds/elizabeth";
const VSND_LIZ_CLIP_PREFIX: &str = "liz_clip_";
// Not sure what you're talking about, it works on my machine!
const MOD_ROOT_DIRECTORY: &str = r"C:\Program Files (x86)\Steam\steamapps\common\SteamVR\tools\steamvr_environments\content\steamtours_addons\bsi_battleship_bay";

fn capitalize_first(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(first) => first.to_uppercase().chain(chars).collect()
    }
}

fn codegen_typescript_clips(clips: &ClipsMap) -> Result<String, Box<dyn std::error::Error>> {
    let mut sorted_clips: Vec<_> = clips.iter().collect();
    sorted_clips.sort_by_key(|(_, c)| format!("{}_{}", c.asset_folder, c.asset_name));

    let mut output = String::new();
    output.push_str("// CODE GENERATED CLIPS DATA. DO NOT EDIT.\n\n");
    output.push_str("import { registerSpeechClip as r, LizSpeechTag as T, LizSpeechType as Y, ");
    output.push_str("LizSpeechSentiment as S, LizSpeechIntensity as I } from '../lizSpeech';\n\n");

    for (_, clip) in sorted_clips {
        output.push_str("r(");
        output.push_str(&format!("'{}{}_{}', ", VSND_LIZ_CLIP_PREFIX, clip.asset_folder, clip.asset_name));
        output.push_str(&format!("'{}/{}/{}.vsnd', ", VSND_LIZ_CLIP_DIRECTORY_PREFIX, clip.asset_folder, clip.asset_name));

        if clip.speech_tag != "" {
            output.push_str(&format!("T.{}, ", capitalize_first(clip.speech_tag.as_str())));
        } else {
            output.push_str("null, ");
        }

        if clip.speech_type != "" {
            output.push_str(&format!("Y.{}, ", capitalize_first(clip.speech_type.as_str())));
        } else {
            output.push_str("null, ");
        }

        if clip.sentiment != "" {
            output.push_str(&format!("S.{}, ", capitalize_first(clip.sentiment.as_str())));
        } else {
            output.push_str("null, ");
        }

        if clip.intensity != "" {
            output.push_str(&format!("I.{}, ", capitalize_first(clip.intensity.as_str())));
        } else {
            output.push_str("null, ");
        }

        let mut audio_file_path = PathBuf::from(MOD_ROOT_DIRECTORY);
        audio_file_path.push(r"sounds\elizabeth");
        audio_file_path.push(&clip.asset_folder);
        let mut asset_name_as_wav = clip.asset_name.clone();
        asset_name_as_wav.push_str(".wav");
        audio_file_path.push(asset_name_as_wav);

        if clip.animate {
            let frame_rate = 60;
            let speech_keyframes = generate_speech_anim(frame_rate, audio_file_path.as_path());

            output.push_str(frame_rate.to_string().as_str());
            output.push_str(", ");
            output.push_str("[");
            let speech_keyframes_str = speech_keyframes.iter().map(|&val| format_float(val)).collect::<Vec<String>>().join(", ");
            output.push_str(speech_keyframes_str.as_str());
            output.push_str("]");
        } else {
            output.push_str("0, []");
        }

        output.push_str(");\n");
    }

    Ok(output)
}

fn codegen_vsnd_clips(clips: &ClipsMap) -> Result<String, Box<dyn std::error::Error>> {
    let mut sorted_clips: Vec<_> = clips.iter().collect();
    sorted_clips.sort_by_key(|(_, c)| format!("{}_{}", c.asset_folder, c.asset_name));

    let mut output = String::new();
    output.push_str("\t//////////////////////////////////////////////////////////\n");
    output.push_str("\t// Elizabeth - CODE GENERATED CLIPS DATA. DO NOT EDIT.\n");
    output.push_str("\t//////////////////////////////////////////////////////////\n\n");

    for (_, clip) in sorted_clips {
        output.push_str(&format!("\t{}{}_{} =\n", VSND_LIZ_CLIP_PREFIX, clip.asset_folder, clip.asset_name));
        output.push_str("\t{\n");
        output.push_str("\t\ttype = \"destinations.simple_vr\"\n");
        output.push_str("\t\tvolume = 1\n");
        output.push_str("\t\tpitch = 1\n");
        output.push_str("\t\tdelay = 0\n");
        output.push_str("\t\tuse_hrtf = 1\n");
        output.push_str("\t\tvolume_falloff_min = 100\n");
        output.push_str("\t\tvolume_falloff_max = 1000\n");
        output.push_str(&format!("\t\tvsnd_files = \"{}/{}/{}.vsnd\"\n", VSND_LIZ_CLIP_DIRECTORY_PREFIX, clip.asset_folder, clip.asset_name));
        output.push_str("\t}\n");
    }

    Ok(output)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let dir_path = "./config/elizabeth_clips";
    let directory = Path::new(dir_path);
    let clips = process_directory(directory)?;

    let ts_output = codegen_typescript_clips(&clips)?;
    fs::write("lizSpeechClips.ts", ts_output).unwrap();
    let vsnd_output = codegen_vsnd_clips(&clips)?;
    fs::write("liz_clips_snippet.vsndevts", vsnd_output).unwrap();


    Ok(())
}

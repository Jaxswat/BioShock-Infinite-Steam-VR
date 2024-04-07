# BioShock: Infinite for SteamVR Home

I like BioShock: Infinite so I wanted to make an experience around it in SteamVR Home.
This repository contains the code and other custom tools I wrote to make it.

#### [Subscribe on Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=2952477736)

[<img src="https://img.youtube.com/vi/-QKq8XJSEFk/maxresdefault.jpg" width=500px>](https://youtu.be/-QKq8XJSEFk)

## Assets

For an overview on how I made the map and extracted assets, read my [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2953264938).

Note: `asset_tools/animations/bsi_anim.exe` is a C# program written by a mysterious character named [ID-Dameon](https://www.gildor.org/smf/index.php?topic=2478.0).
It extracts animations from the game's morpheme animation files.
The original Zenhax thread seems to be gone, but I've preserved the tool in this repo.
I have verified that the source code is harmless via ILSpy, it's just a quickly hacked together binary format decoder.

## Code

SteamVR allows you to write scripts in Lua. I don't like Lua.
It's fine for small scripts, but I wanted to create advanced game-engine like systems, and Lua was not going to scale for me.
TypeScript is a great solution to this because it has types while still maintaining a script-like runtime, so for this I use [TypeScriptToLua](https://github.com/TypeScriptToLua/TypeScriptToLua).

Thankfully the DotA2 modding community has already done a lot of the effort of writing type declaration files.
Most of them have been heavily modified to fit my style and the differences in the SteamVR Scripting API.

This paired with some postprocessing scripts has made for an incredibly powerful scripting environment.
Writing complex AI logic for Elizabeth's behavior has been incredibly easy in comparison to when I was prototyping in plain Lua.
While the SteamVR Scripting API isn't thoroughly documented, I've been able to solve most of my needs through trial and error.

All of the scripts at the moment use [`bun`](https://github.com/oven-sh/bun).

### VScript

These are the game scripts that run in the SteamVR environment.

Directory: `vscript`

Scripts:
- `bun run clean` - deletes `build/`
- `bun run build` - builds the code into `build/`
- `bun run copy` - copies `build/` into the SteamVR environment's `vscripts` directory
- `bun run build-and-copy` does all of the above steps

### VSND Generator

SteamVR Home requires all sound files to be defined in `soundevents_addon.vsndevts`.
I also require these clips to be cataloged for Elizabeth's AI code.

This script does code generation for the .vsndevts file as well as my TypeScript code.
Sounds are configured in the code of this file, and then I paste in the generated code into the respective files.

Directory: `vsnd_generator`

Scripts:
- `bun run generate` - Creates code snippets for `.vsndevts` and TypeScript speech config.

### VoiceDB

Elizabeth has about 1600 lines of dialogue.
To help catalog these, I transcribed them with [OpenAI's Whisper](https://github.com/openai/whisper), and then made a simple Express server to tag them by sentiment and intensity.

I also transcribed the other characters' lines, but I haven't tagged them yet.
Whisper isn't completely accurate, but these files are good for simple CTRL+F searching.

The JSON files are stored in `data/`.

Directory: `voicedb`

The scripts have some hardcoded configuration, but they work:
- `bun run transcribe` - runs `whisper` command on all audio files
- `bun run dupecheck` - Verifies that there are no duplicate files. (I don't think the game would pack duplicated but I was suspicous at some point)
- `bun run tag` - runs express server on `localhost:3000` for a simple tagging interface

### bsi_anim (Morpheme Animation to Source SMD)

This tool converts Morpheme animations (`MorphemeAnimSet` and .`MorphemeAnimSequence`) to Source SMD files (`smd`).
It only supports a few specific types of animations, but it works for the animations I cared to extract.

It was published on August 29th, 2016 by a mysterious character named [id-dameon on the Zenhax forums](https://web.archive.org/web/20230429095935/https://zenhax.com/viewtopic.php?f=5&t=3009).
The entire forum seems to be gone, but I've preserved the original executable in this repo (`asset_tools/animations/bsi_anim.exe`).
I'm not even sure if id-dameon knew the format, they probably reverse engineered it from the game's assembly.
It's incredibly mysterious to me, but it works.

The original executable is a harmless C# program that reads the binary protocol and outputs SMD files.
In an attempt to improve (or at least open source) the tool, I've decompiled it with ILSpy and began translating it to rust.
It runs 10x faster, but it's not perfect. As expected, a lot of things were lost in translation.
It's an absolute mess of code, but it is able to traverse the undocumented Morpheme binary format.

My rust translation runs, but skips some keyframes due to some math/data type conversion issues.
Should be fixable.

Directory: `bsi_anim`

# Questions / Suggestions

Scripting in Source 2 can be very hard due to the sparse documentation. If you have any questions, ideas, or suggestions let me know.
Either open an issue on this repo, or ping me on Discord `@jaxswat`.

# BioShock: Infinite for SteamVR Home

I like BioShock: Infinite so I wanted to make an experience around it in SteamVR Home.
This repository contains the code and other custom tools I wrote to make it.

#### [Subscribe on Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=2952477736)

[<img src="https://img.youtube.com/vi/-QKq8XJSEFk/maxresdefault.jpg" width=500px>](https://youtu.be/-QKq8XJSEFk)

## Assets

For an overview on how I made the map and extracted assets, read my [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2953264938).

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

Directory: `vscript`

These are the game scripts that run in the SteamVR environment.

Scripts:
- `bun run clean` - deletes `build/`
- `bun run build` - builds the code into `build/`
- `bun run copy` - copies `build/` into the SteamVR environment's `vscripts` directory
- `bun run build-and-copy` does all of the above steps

### VSND Generator

Directory: `vsnd_generator`

SteamVR Home requires all sound files to be defined in `soundevents_addon.vsndevts`.
I also require these clips to be cataloged for Elizabeth's AI code.

This script does code generation for the .vsndevts file as well as my TypeScript code.
Sounds are configured in the code of this file, and then I paste in the generated code into the respective files.

Scripts:
- `bun run generate` - Creates code snippets for `.vsndevts` and TypeScript speech config.

### VoiceDB

Directory: `voicedb`

Elizabeth has about 1600 lines of dialogue.
To help catalog these, I transcribed them with [OpenAI's Whisper](https://github.com/openai/whisper), and then made a simple Express server to tag them by sentiment and intensity.

I also transcribed the other characters' lines, but I haven't tagged them yet.
Whisper isn't completely accurate, but these files are good for simple CTRL+F searching.

The JSON files are stored in `data/`.

The scripts have some hardcoded configuration, but they work:
- `bun run transcribe` - runs `whisper` command on all audio files
- `bun run dupecheck` - Verifies that there are no duplicate files. (I don't think the game would pack duplicated but I was suspicous at some point)
- `bun run tag` - runs express server on `localhost:3000` for a simple tagging interface

### bsi_anim (Morpheme Animation to Source SMD)

Directory: `bsi_anim`

This tool converts Morpheme animations (`MorphemeAnimSet` and .`MorphemeAnimSequence`) to Source SMD files (`smd`).
It only supports a few specific types of animations, but it works for the animations I cared to extract.

The original executable was written in C# and published on August 29th, 2016 by [id-dameon on the Zenhax forums](https://web.archive.org/web/20230429095935/https://zenhax.com/viewtopic.php?f=5&t=3009).
The Zenhax forum is no longer online, but [id-dameon is still an active member on ResHax](https://reshax.com/profile/8-id-daemon).
Without any documentation or source code, he reverse engineered the animation data from the Morpheme files to create the tool.

In an effort to improve and preserve the tool, I have decompiled it and rewritten it in rust.
The code is chaotic as it originates from decompiled/obfuscated C#, but it works.
I have added a better CLI interface, as well as some logic that makes it work with Blender's SMD importer.

Usage: `bsi_anim.exe ./path/to/your/animation.MorphemeAnimSequence`

Optional flag: `-l` / `--legacy` - Uses the original program output

Point it to a `.MorphemeAnimSequence` file and it will output a `.smd` file in that same directory.
It does require the `MorphemeAnimSet` file to be in the parent directory, but it will find it automatically.
If you've used the UModel exporter, they should already be unpacked in this folder structure.

### VConsole Tunnel (VTunnel)

Directory: `vtunnel`

VTunnel is a rust program that enables bidirectional communication with the game's Lua scripts using the VConsole server.
Data is encoded and sent from the game in `print()` statements, while the server sends them back through a custom `vtunnel_receive` command.
VTunnel is also able to read/write some other parts of the VConsole protocol.

The goal of this tool is to enhance the speed of developing complex features with debugging and data extraction.

The message protocol looks something like this:
`$vt!69!my_message_name!s(5):example string!f:3.141592!i:8192!v3:3.14,5.92,0.314!s(0):!f:-3.14!i:-69!b:1!b:0!`
It is able to send strings, floats, integers, 3D vectors, and booleans.
It is also operates as an RPC with request/reply functionality.
It can draw debug spheres, run ray-traces, and pretty much anything else that can be done in the Lua code.

Right now the program captures some game state (server time, Elizabeth state, player state).
As a proof of concept, I have also implemented some basic RPC functionality for remotely running ray-traces.
I have also added an intractable tool that lets me control the program from within the game with my VR controller.

It is incredibly convenient to be able to interact with the game from an external program.

<img src="https://github.com/Jaxswat/BioShock-Infinite-Steam-VR/assets/8656187/4b9653ce-7d86-40c7-8152-b84f3e5d8e5b" alt="nav generation using VTunnel demo" width="400">

> In this demo screenshot, navigation points are being generated on the VTunnel application.
> When the VTunnel Tool is fired it triggers the server to run a line trace to find the floor and a box trace to see if Elizabeth fits.
> Red spheres are un-walkable, while green spheres are walkable.
> The logic is processed in VTunnel while the visualization is rendered in-game.
> This allows designing a custom navigation mesh and persisting it to disk externally.
> The nav mesh can then be baked into the Lua and distributed on in the workshop addon.

### VSND Tools

Directory: `vsnd_tools`

For now this contains a program that reads `.wav` files and turns them into a primitive mouth movement animation for Elizabeth.

I plan on expanding this program to organize and auto generate the `soundevents_addon.vsndevts` (which is currently done by VSND Generator).

### SteamVR Nav Tools

Directory: `steamvr_nav_tools`

This program contains a parser for Source 2 (SteamVR Home) `.nav` files, which use polygon nav areas instead of the old plane-based ones.
It also contains a program that reads the nav file and bakes it into a TypeScript file for the SteamVR environment.
Elizabeth can use it to walk around in-game with a custom A* navigation algorithm.

# Questions / Suggestions

Scripting in Source 2 can be very hard due to the sparse documentation. If you have any questions, ideas, or suggestions let me know.
Either open an issue on this repo, or ping me on Discord `@jaxswat`.

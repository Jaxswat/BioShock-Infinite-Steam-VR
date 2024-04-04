import fs from 'fs';
import { promisify } from 'util';
import { exec as execSync } from 'child_process';
import { JSONFilePreset } from 'lowdb/node';
const readFile = promisify(fs.readFile);
const exec = promisify(execSync);

class Clip {
	file = '';
	tags = [];
	text = '';

	constructor(file) {
		this.file = file;
	}
};

const fileName = './voicedb_plebs.json';
const rootPath = ''; // TODO: Set this to the path of the unpacked .wav audio files
const whisperFolder = 'whisper_json';
const batchSize = 5;

function buildWhisperCommand(files) {
	const cmd = [];
	cmd.push('whisper');
	for (let file of files) {
		cmd.push(`"${file}"`);
	}
	cmd.push('--fp16 False');
	cmd.push('--language English');
	cmd.push('--output_format json');
	cmd.push('--device cuda');
	cmd.push('--output_dir whisper_json');

	return cmd.join(' ');
}

async function main() {
	const voicedb = await JSONFilePreset(fileName, { clips: [] });
	await voicedb.read();

	const allFiles = fs.readdirSync(rootPath);
	const oggFiles = allFiles.filter(f => f.endsWith('.ogg'));
	
	for (let file of oggFiles) {
		let clip = voicedb.data.clips.find(c => c.file === file);
		if (!clip) {
			clip = new Clip(file);
			voicedb.data.clips.push(clip);
		}
	}
	await voicedb.write();

	const batches = [];
	let currentBatch = [];
	for (let clip of voicedb.data.clips) {
		if (clip.text) {
			continue;
		}

		currentBatch.push(clip.file);
		if (currentBatch.length === batchSize) {
			batches.push(currentBatch);
			currentBatch = [];
		}
	}

	let i = 0;
	while (i < batches.length) {
		console.log(`Running batch ${i+1}/${batches.length}...`);
		const files = batches[i];
		const cmd = buildWhisperCommand(files);
		const { stderr } = await exec(cmd, { cwd: rootPath });
		if (stderr) {
			console.error('FAILED TO WHISPER FILES:', files);
			console.error(stderr);
			continue;
		}

		for (let file of files) {
			const jsonFileName = file.substring(0, file.length - 4) + '.json';
			const whisperDataRaw = await readFile(rootPath + '/' + whisperFolder + '/' + jsonFileName, 'utf8');
			const whisperData = JSON.parse(whisperDataRaw);
			const clip = voicedb.data.clips.find(c => c.file === file);
			clip.text = whisperData.text.trim() || null;
		}
		await voicedb.write();
		i++;
	}
	console.log('Done!');
	process.exit();
}

main().catch(console.error);
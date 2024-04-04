import fs from 'fs';
import { promisify } from 'util';
import { JSONFilePreset } from 'lowdb/node';
import { createHash } from 'crypto';
const readFile = promisify(fs.readFile);

class Clip {
	file = '';
	tags = [];
	text = '';
	hash = null;

	constructor(file) {
		this.file = file;
	}
};

const rootPath = ''; // TODO: set this to the path of the unpacked .wav audio files

async function main() {
	const voicedb = await JSONFilePreset('./voicedb_liz.json', { clips: [] });
	await voicedb.read();
	
	for (let clip of voicedb.data.clips) {
		if (clip.hash) {
			continue;
		}

		const fileData = await readFile(rootPath + '/' + clip.file, 'binary');
		clip.hash = createHash('sha256').update(fileData).digest('hex');
	}
	await voicedb.write();


	const dupeMap = new Map();
	for (let clip of voicedb.data.clips) {
		if (!dupeMap.has(clip.hash)) {
			dupeMap.set(clip.hash, 0);
		}

		dupeMap.set(clip.hash, dupeMap.get(clip.hash) + 1);
	}

	const pairs = Array
		.from(dupeMap)
		.filter(x => x[1] > 1)
		.sort((a, b) => a[1] - b[1]);
	console.log(pairs);

	console.log('Done!');
	process.exit();
}

main().catch(console.error);

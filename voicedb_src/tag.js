import { JSONFilePreset } from 'lowdb/node';
import express from 'express';
import asyncHandler from 'express-async-handler';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { copyFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const allTags = [
	'plot',
	'chirp',
	'loot',
	'combat',
	'somber',
	'cheerful',
	'assertive',
	'yelling',
	'bakedsfx',
	'nonspeech',
	'reusable'
];

const tagFiltersForViewer = [
	'reusable'
];

let viewerMode = true;
let voicedb;
let voiceDbFile = './voicedb_liz.json';
const rootPath = ''; // TODO: set this to the path of the unpacked .wav audio files
const copiedClipsDir = './copied_clips';
const port = 3000;
const app = express();

app.get('/', (req, res) => {
  res.sendFile('tag.html', { root: __dirname });
});

app.get('/clip/*', (req, res) => {
	res.sendFile(req.path.substring(6), { root: rootPath });
});

app.get('/clips', asyncHandler(async (req, res) => {
	let clips;
	if (viewerMode) {
		clips = voicedb.data.clips.filter(c => c.tags.some(t => tagFiltersForViewer.includes(t)));
	} else {
		clips = voicedb.data.clips;
	}

	res.json(clips);
}));

app.get('/config', asyncHandler(async (req, res) => {
	res.json({
		viewerMode,
		tags: allTags
	});
}));

app.use(express.json());
app.post('/copy-clip', asyncHandler(async (req, res) => {
	const file = req.body.file;
	await copyFile(rootPath + '/' + file, copiedClipsDir + '/' + file);
	res.sendStatus(204);
}));

app.post('/toggle-tag', asyncHandler(async (req, res) => {
	if (viewerMode) {
		res.sendStatus(403);
		return;
	}

	const file = req.body.file;
	const tag = req.body.tag;

	const clip = voicedb.data.clips.find(c => c.file === file);
	if (!clip) {
		res.sendStatus(404);
		return;
	}

	const tags = new Set(clip.tags);
	if (tags.has(tag)) {
		tags.delete(tag);
	} else {
		tags.add(tag);
	}
	clip.tags = Array.from(tags);
	await voicedb.write();

	res.sendStatus(204);
}));

app.listen(port, async () => {
	voicedb = await JSONFilePreset(voiceDbFile, { clips: [] });
	await voicedb.read();
  	console.log(`voicedb tag listening on port ${port}`)
});

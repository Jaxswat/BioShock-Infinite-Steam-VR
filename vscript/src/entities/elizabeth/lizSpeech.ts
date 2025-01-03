
export enum LizSpeechType {
	Speech = 0,	
	NonSpeech = 1,
	Singing = 2
}

export enum LizSpeechTag {
	Default = 0,
	Greeting = 1,
	Hmm = 2,
	LookAtThis = 3,
	Smelly = 4,
	FoundMoney = 5,
	CatchMoney = 6,
	PlayerFoundMoney = 7,
	Toss = 8,
	Chirp = 9,
	Body = 10,
	Oh = 11,
	GunPoint = 12,
}

export enum LizSpeechSentiment {
	StrongDislike = 0.0,
	Dislike = 0.25,
	Neutral = 0.5,
	Like = 0.75,
	StrongLike = 1.0
}

export enum LizSpeechIntensity {
	Somber = 0.0,
	Neutral = 0.5,
	Cheerful = 0.5,
	Assertive = 0.75,
	Yelling = 1.0
}

let soundIdSequence = 0;
export class LizSpeechClip {
	public id: number;
	public name: string;
	public assetName: string;
	public assetPath: string;
	public tag: LizSpeechTag
	public type: LizSpeechType;
	public sentiment: LizSpeechSentiment;
	public intensity: LizSpeechIntensity;
	public animated: boolean;
	public framerate: number;
	public keyframes: number[];

	constructor(assetName: string, assetPath: string, tag: LizSpeechTag | null, type: LizSpeechType | null, sentiment: LizSpeechSentiment | null, intensity: LizSpeechIntensity | null, framerate: number, keyframes: number[]) {
		this.id = ++soundIdSequence;
		this.name = assetName;
		this.assetName = assetName;
		this.assetPath = assetPath;
		this.tag = LizSpeechTag.Default;
		this.type = LizSpeechType.Speech;
		this.sentiment = LizSpeechSentiment.Neutral;
		this.intensity = LizSpeechIntensity.Neutral;
		this.animated = framerate > 0;
		this.framerate = framerate;
		this.keyframes = keyframes;

		if (tag) {
			this.tag = tag;
		}
		if (type) {
			this.type = type;
		}
		if (sentiment) {
			this.sentiment = sentiment;
		}
		if (intensity) {
			this.intensity = intensity;
		}
	}
}

const lizSpeechClips: LizSpeechClip[] = [];

export function registerSpeechClip(assetName: string, assetPath: string, tag: LizSpeechTag | null, type: LizSpeechType | null, sentiment: LizSpeechSentiment | null, intensity: LizSpeechIntensity | null, framerate: number, keyframes: number[]) {
	lizSpeechClips.push(new LizSpeechClip(assetName, assetPath, tag, type, sentiment, intensity, framerate, keyframes));
};

export function getClipByID(clipID: number): LizSpeechClip | null {
	return lizSpeechClips[clipID - 1] || null;
}

export function getClipByName(name: string): LizSpeechClip | null {
	return lizSpeechClips.find(c => c.name === name) || null;
}

export function getSpeechClip(tag: LizSpeechTag, sentiment: LizSpeechSentiment | null, intensity: LizSpeechIntensity | null): LizSpeechClip | null {
	let clipIDs = [];
	for (let clip of lizSpeechClips) {
		if (clip.tag === tag) {
			const matchSentiment = sentiment && (sentiment >= LizSpeechSentiment.Neutral ? clip.sentiment >= sentiment : clip.sentiment <= sentiment);
			const matchIntensity = intensity && (intensity <= LizSpeechIntensity.Neutral ? clip.intensity <= intensity : clip.intensity >= intensity);
			if (matchSentiment || matchIntensity) {
				return clip;
			}
			clipIDs.push(clip.id);
		}
	}
	
	if (clipIDs.length > 0) {
		const clipIndex = RandomInt(0, clipIDs.length - 1);
		return getClipByID(clipIDs[clipIndex]);
	}
	
	return null;
}

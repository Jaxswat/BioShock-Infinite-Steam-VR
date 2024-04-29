
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

	constructor(name: string | null, assetName: string, assetPath: string, tag: LizSpeechTag | null, type: LizSpeechType | null, sentiment: LizSpeechSentiment | null, intensity: LizSpeechIntensity | null) {
		this.id = ++soundIdSequence;
		this.name = assetName;
		this.assetName = assetName;
		this.assetPath = assetPath;
		this.tag = LizSpeechTag.Default;
		this.type = LizSpeechType.Speech;
		this.sentiment = LizSpeechSentiment.Neutral;
		this.intensity = LizSpeechIntensity.Neutral;

		if (name) {
			this.name = name;
		}
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

// Clips are code-gen'd from a config both here and in the .vsndevts file
const lizSpeechClips: LizSpeechClip[] = [
	new LizSpeechClip(null, 'liz_clip_greetings_bright_hey', 'sounds/elizabeth/greetings/bright_hey.vsnd', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_greetings_bright_hey2', 'sounds/elizabeth/greetings/bright_hey2.vsnd', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_greetings_hello', 'sounds/elizabeth/greetings/hello.vsnd', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_greetings_hi_there', 'sounds/elizabeth/greetings/hi_there.vsnd', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_greetings_my_name_is_elizabeth', 'sounds/elizabeth/greetings/my_name_is_elizabeth.vsnd', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_greetings_regular_hey', 'sounds/elizabeth/greetings/regular_hey.vsnd', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_greetings_soft_hey', 'sounds/elizabeth/greetings/soft_hey.vsnd', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_hmms_huh01', 'sounds/elizabeth/hmms/huh01.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_huh02', 'sounds/elizabeth/hmms/huh02.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_huh03', 'sounds/elizabeth/hmms/huh03.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_huh04', 'sounds/elizabeth/hmms/huh04.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Like, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_huh05', 'sounds/elizabeth/hmms/huh05.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_huh06', 'sounds/elizabeth/hmms/huh06.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_hmms_huh07', 'sounds/elizabeth/hmms/huh07.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_huh08', 'sounds/elizabeth/hmms/huh08.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_huh09', 'sounds/elizabeth/hmms/huh09.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_huh10', 'sounds/elizabeth/hmms/huh10.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_huh11', 'sounds/elizabeth/hmms/huh11.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm01', 'sounds/elizabeth/hmms/hmm01.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm02', 'sounds/elizabeth/hmms/hmm02.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm03', 'sounds/elizabeth/hmms/hmm03.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm04', 'sounds/elizabeth/hmms/hmm04.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm05', 'sounds/elizabeth/hmms/hmm05.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm06', 'sounds/elizabeth/hmms/hmm06.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm07', 'sounds/elizabeth/hmms/hmm07.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm08', 'sounds/elizabeth/hmms/hmm08.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm09', 'sounds/elizabeth/hmms/hmm09.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm10', 'sounds/elizabeth/hmms/hmm10.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm11', 'sounds/elizabeth/hmms/hmm11.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm12', 'sounds/elizabeth/hmms/hmm12.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm13', 'sounds/elizabeth/hmms/hmm13.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_ahh01', 'sounds/elizabeth/hmms/ahh01.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_ahh02', 'sounds/elizabeth/hmms/ahh02.vsnd', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_oh01', 'sounds/elizabeth/hmms/oh01.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_oh02', 'sounds/elizabeth/hmms/oh02.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_oh03', 'sounds/elizabeth/hmms/oh03.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_oh04', 'sounds/elizabeth/hmms/oh04.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_oh05', 'sounds/elizabeth/hmms/oh05.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_oh01', 'sounds/elizabeth/hmms/oh01.vsnd', LizSpeechTag.Oh, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_oh02', 'sounds/elizabeth/hmms/oh02.vsnd', LizSpeechTag.Oh, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_oh03', 'sounds/elizabeth/hmms/oh03.vsnd', LizSpeechTag.Oh, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_oh04', 'sounds/elizabeth/hmms/oh04.vsnd', LizSpeechTag.Oh, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_oh05', 'sounds/elizabeth/hmms/oh05.vsnd', LizSpeechTag.Oh, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_hmm_interesting', 'sounds/elizabeth/hmms/hmm_interesting.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_strange', 'sounds/elizabeth/hmms/strange.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_i_wonder', 'sounds/elizabeth/hmms/i_wonder.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_hmms_interesting01', 'sounds/elizabeth/hmms/interesting01.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_hmms_interesting02', 'sounds/elizabeth/hmms/interesting02.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_odd01', 'sounds/elizabeth/hmms/odd01.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_hmms_odd02', 'sounds/elizabeth/hmms/odd02.vsnd', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_look_at_this_booker_here', 'sounds/elizabeth/look_at_this/booker_here.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Yelling),
	new LizSpeechClip(null, 'liz_clip_look_at_this_come_look_at_these', 'sounds/elizabeth/look_at_this/come_look_at_these.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_look_at_this_do_you_want_this', 'sounds/elizabeth/look_at_this/do_you_want_this.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_look_at_this_huh_whats_this01', 'sounds/elizabeth/look_at_this/huh_whats_this01.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_look_at_this_huh_whats_this02', 'sounds/elizabeth/look_at_this/huh_whats_this02.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_i_think_you_should_see_this', 'sounds/elizabeth/look_at_this/i_think_you_should_see_this.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_that01', 'sounds/elizabeth/look_at_this/look_at_that01.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_that02', 'sounds/elizabeth/look_at_this/look_at_that02.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_that03', 'sounds/elizabeth/look_at_this/look_at_that03.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_that04', 'sounds/elizabeth/look_at_this/look_at_that04.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_this01', 'sounds/elizabeth/look_at_this/look_at_this01.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_this02', 'sounds/elizabeth/look_at_this/look_at_this02.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_this03', 'sounds/elizabeth/look_at_this/look_at_this03.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_this04', 'sounds/elizabeth/look_at_this/look_at_this04.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_this05', 'sounds/elizabeth/look_at_this/look_at_this05.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_this06', 'sounds/elizabeth/look_at_this/look_at_this06.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_this07', 'sounds/elizabeth/look_at_this/look_at_this07.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_at_this08', 'sounds/elizabeth/look_at_this/look_at_this08.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_look_mr_dewitt01', 'sounds/elizabeth/look_at_this/look_mr_dewitt01.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
	new LizSpeechClip(null, 'liz_clip_look_at_this_oh_whats_that', 'sounds/elizabeth/look_at_this/oh_whats_that.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_over_here01', 'sounds/elizabeth/look_at_this/over_here01.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_over_here02', 'sounds/elizabeth/look_at_this/over_here02.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_see_this01', 'sounds/elizabeth/look_at_this/see_this01.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_this_looks_important01', 'sounds/elizabeth/look_at_this/this_looks_important01.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_look_at_this_this_looks_important02', 'sounds/elizabeth/look_at_this/this_looks_important02.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_look_at_this_what_is_this01', 'sounds/elizabeth/look_at_this/what_is_this01.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_look_at_this_what_is_this02', 'sounds/elizabeth/look_at_this/what_is_this02.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_look_at_this_whats_that', 'sounds/elizabeth/look_at_this/whats_that.vsnd', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_smelly_smelly01', 'sounds/elizabeth/smelly/smelly01.vsnd', LizSpeechTag.Smelly, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_smelly_smelly02', 'sounds/elizabeth/smelly/smelly02.vsnd', LizSpeechTag.Smelly, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_smelly_smelly03', 'sounds/elizabeth/smelly/smelly03.vsnd', LizSpeechTag.Smelly, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_smelly_smelly04', 'sounds/elizabeth/smelly/smelly04.vsnd', LizSpeechTag.Smelly, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_smelly_smelly05', 'sounds/elizabeth/smelly/smelly05.vsnd', LizSpeechTag.Smelly, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_smelly_oh_whats_that_smell', 'sounds/elizabeth/smelly/oh_whats_that_smell.vsnd', LizSpeechTag.Smelly, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_found_money_cash_booker', 'sounds/elizabeth/found_money/cash_booker.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_found_money_found_some_money', 'sounds/elizabeth/found_money/found_some_money.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_found_money_found_this_for_you', 'sounds/elizabeth/found_money/found_this_for_you.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_found_money_heres_some_cash', 'sounds/elizabeth/found_money/heres_some_cash.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_found_money_hey_found_some_money', 'sounds/elizabeth/found_money/hey_found_some_money.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_found_money_i_found_some_change', 'sounds/elizabeth/found_money/i_found_some_change.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_found_money_more_money', 'sounds/elizabeth/found_money/more_money.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_found_money_need_money', 'sounds/elizabeth/found_money/need_money.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_found_money_wanna_hold_on_to_this', 'sounds/elizabeth/found_money/wanna_hold_on_to_this.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_toss_take_it', 'sounds/elizabeth/toss/take_it.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_toss_catch_booker', 'sounds/elizabeth/toss/catch_booker.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_toss_catch', 'sounds/elizabeth/toss/catch.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
	new LizSpeechClip(null, 'liz_clip_toss_here', 'sounds/elizabeth/toss/here.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_toss_here_you_go', 'sounds/elizabeth/toss/here_you_go.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
	new LizSpeechClip(null, 'liz_clip_toss_catch2', 'sounds/elizabeth/toss/catch2.vsnd', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
	new LizSpeechClip(null, 'liz_clip_toss_take_it', 'sounds/elizabeth/toss/take_it.vsnd', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_toss_catch_booker', 'sounds/elizabeth/toss/catch_booker.vsnd', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_toss_catch', 'sounds/elizabeth/toss/catch.vsnd', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
	new LizSpeechClip(null, 'liz_clip_toss_here', 'sounds/elizabeth/toss/here.vsnd', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_toss_here_you_go', 'sounds/elizabeth/toss/here_you_go.vsnd', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
	new LizSpeechClip(null, 'liz_clip_toss_catch_booker2', 'sounds/elizabeth/toss/catch_booker2.vsnd', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
	new LizSpeechClip(null, 'liz_clip_toss_catch2', 'sounds/elizabeth/toss/catch2.vsnd', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
	new LizSpeechClip(null, 'liz_clip_chirps_amazing_what_people_leave_lying_around', 'sounds/elizabeth/chirps/amazing_what_people_leave_lying_around.vsnd', LizSpeechTag.CatchMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_dont_spend_it_all_in_one_place', 'sounds/elizabeth/chirps/dont_spend_it_all_in_one_place.vsnd', LizSpeechTag.CatchMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_someone_must_have_dropped_this', 'sounds/elizabeth/chirps/someone_must_have_dropped_this.vsnd', LizSpeechTag.CatchMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_arent_we_the_well_to_do_types', 'sounds/elizabeth/chirps/arent_we_the_well_to_do_types.vsnd', LizSpeechTag.PlayerFoundMoney, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_i_imagine_sofa_cushions_turn_up_quarter', 'sounds/elizabeth/chirps/i_imagine_sofa_cushions_turn_up_quarter.vsnd', LizSpeechTag.PlayerFoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_seems_like_were_fairly_well_healed', 'sounds/elizabeth/chirps/seems_like_were_fairly_well_healed.vsnd', LizSpeechTag.PlayerFoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_seems_like_were_fairly_well_healed2', 'sounds/elizabeth/chirps/seems_like_were_fairly_well_healed2.vsnd', LizSpeechTag.PlayerFoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_and_how_has_that_worked_out_for_you', 'sounds/elizabeth/chirps/and_how_has_that_worked_out_for_you.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_har_har', 'sounds/elizabeth/chirps/har_har.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_will_the_circle_humming_short', 'sounds/elizabeth/chirps/will_the_circle_humming_short.vsnd', LizSpeechTag.Chirp, LizSpeechType.NonSpeech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_you_do_have_your_useful_qualities', 'sounds/elizabeth/chirps/you_do_have_your_useful_qualities.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_you_do_have_your_useful_qualities2', 'sounds/elizabeth/chirps/you_do_have_your_useful_qualities2.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_youve_got_quite_a_knack_for_that', 'sounds/elizabeth/chirps/youve_got_quite_a_knack_for_that.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_have_it_your_way_i_suppose', 'sounds/elizabeth/chirps/have_it_your_way_i_suppose.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_i_have_a_better_idea', 'sounds/elizabeth/chirps/i_have_a_better_idea.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_indeed', 'sounds/elizabeth/chirps/indeed.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_its_about_7_30', 'sounds/elizabeth/chirps/its_about_7_30.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_no', 'sounds/elizabeth/chirps/no.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_chirps_no', 'sounds/elizabeth/chirps/no.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_yes', 'sounds/elizabeth/chirps/yes.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_are_you_interested_in_gardening', 'sounds/elizabeth/chirps/are_you_interested_in_gardening.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_are_you_trying_to_get_us_both_arrested', 'sounds/elizabeth/chirps/are_you_trying_to_get_us_both_arrested.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_do_you_hear_anything', 'sounds/elizabeth/chirps/do_you_hear_anything.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_exactly_what_business_do_you_have_in_here', 'sounds/elizabeth/chirps/exactly_what_business_do_you_have_in_here.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_okay_just_one_more', 'sounds/elizabeth/chirps/okay_just_one_more.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_ready_now', 'sounds/elizabeth/chirps/ready_now.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_really', 'sounds/elizabeth/chirps/really.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_really2', 'sounds/elizabeth/chirps/really2.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_well', 'sounds/elizabeth/chirps/well.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_buffalo_tonic_whats_this', 'sounds/elizabeth/chirps/buffalo_tonic_whats_this.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_madam_warblers_whiskey_cure', 'sounds/elizabeth/chirps/madam_warblers_whiskey_cure.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_doest_seem_to_work_very_well', 'sounds/elizabeth/chirps/doest_seem_to_work_very_well.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_i_love_it', 'sounds/elizabeth/chirps/i_love_it.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_maybe_that_machine_has_some_things_we_can_use', 'sounds/elizabeth/chirps/maybe_that_machine_has_some_things_we_can_use.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_maybe_you_should_get_that', 'sounds/elizabeth/chirps/maybe_you_should_get_that.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_shock_jockey_who_needs_the_power_company', 'sounds/elizabeth/chirps/shock_jockey_who_needs_the_power_company.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_this_is_it_isnt_it', 'sounds/elizabeth/chirps/this_is_it_isnt_it.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_where_do_you_think_this_goes', 'sounds/elizabeth/chirps/where_do_you_think_this_goes.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_you_really_should_pick_that_up', 'sounds/elizabeth/chirps/you_really_should_pick_that_up.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_youve_got_a_keen_eye_booker_noticed_trinkets', 'sounds/elizabeth/chirps/youve_got_a_keen_eye_booker_noticed_trinkets.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_almost_pumps_raincatchers', 'sounds/elizabeth/chirps/almost_pumps_raincatchers.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_guess_we_should_come_back_later', 'sounds/elizabeth/chirps/guess_we_should_come_back_later.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_thats_foolish', 'sounds/elizabeth/chirps/thats_foolish.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_well_ill_be', 'sounds/elizabeth/chirps/well_ill_be.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_what_happened_there', 'sounds/elizabeth/chirps/what_happened_there.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_whos_that', 'sounds/elizabeth/chirps/whos_that.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_fifty_percent', 'sounds/elizabeth/chirps/fifty_percent.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_i_wanna_see_paris_everything', 'sounds/elizabeth/chirps/i_wanna_see_paris_everything.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_imagining_you_on_a_carousel', 'sounds/elizabeth/chirps/imagining_you_on_a_carousel.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_its_her', 'sounds/elizabeth/chirps/its_her.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_look_on_the_other_side', 'sounds/elizabeth/chirps/look_on_the_other_side.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_seems_like_an_unnecessary_complication', 'sounds/elizabeth/chirps/seems_like_an_unnecessary_complication.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_that_was_odd', 'sounds/elizabeth/chirps/that_was_odd.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_this_is_going_to_be_fantastic', 'sounds/elizabeth/chirps/this_is_going_to_be_fantastic.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_watch_this', 'sounds/elizabeth/chirps/watch_this.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_well_the_mans_got_an_ego', 'sounds/elizabeth/chirps/well_the_mans_got_an_ego.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_whats_going_on', 'sounds/elizabeth/chirps/whats_going_on.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_better_to_stay_away_from_that_crowd', 'sounds/elizabeth/chirps/better_to_stay_away_from_that_crowd.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
	new LizSpeechClip(null, 'liz_clip_chirps_looks_like_trouble_we_should_be_careful', 'sounds/elizabeth/chirps/looks_like_trouble_we_should_be_careful.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_chirps_i_am_glad_were_on_the_same_side', 'sounds/elizabeth/chirps/i_am_glad_were_on_the_same_side.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_chirps_incredible', 'sounds/elizabeth/chirps/incredible.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Assertive),
	new LizSpeechClip(null, 'liz_clip_chirps_three_cheers_for_us', 'sounds/elizabeth/chirps/three_cheers_for_us.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Yelling),
	new LizSpeechClip(null, 'liz_clip_chirps_you_can_stop_shooting_hes_dead', 'sounds/elizabeth/chirps/you_can_stop_shooting_hes_dead.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_chirps_youve_done_this_before_havent_you', 'sounds/elizabeth/chirps/youve_done_this_before_havent_you.vsnd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
	new LizSpeechClip(null, 'liz_clip_body_cough01', 'sounds/elizabeth/body/cough01.vsnd', LizSpeechTag.Body, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_body_cough02', 'sounds/elizabeth/body/cough02.vsnd', LizSpeechTag.Body, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
	new LizSpeechClip(null, 'liz_clip_body_sneeze01', 'sounds/elizabeth/body/sneeze01.vsnd', LizSpeechTag.Body, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),

];

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

/**
 * Code generator for Liz speech clips.
 *
 * This generates the TypeScript and .vsndevts code for the clips.
 *
 * Clips are defined at the bottom
 */
import {existsSync, mkdirSync, writeFileSync} from 'fs';

const volume = '1.0';
const volumeFalloffMin = '100';
const volumeFalloffMax = '1000.0';
const vsndPrefix = 'liz_clip_';
const directoryPrefix = 'sounds/elizabeth';

interface LizSpeechClip {
    name: string | null;
    assetName: string;
    assetFolder: string;
    tag: LizSpeechTag;
    type: LizSpeechType;
    sentiment: LizSpeechSentiment;
    intensity: LizSpeechIntensity;
}

enum LizSpeechType {
    Speech = 'Speech',
    NonSpeech = 'NonSpeech',
    Singing = 'Singing',
}

enum LizSpeechTag {
    Default = 'Default',
    Greeting = 'Greeting',
    Hmm = 'Hmm',
    Oh = 'Oh',
    LookAtThis = 'LookAtThis',
    Smelly = 'Smelly',
    FoundMoney = 'FoundMoney',
    CatchMoney = 'CatchMoney',
    PlayerFoundMoney = 'PlayerFoundMoney',
    Toss = 'Toss',
    Chirp = 'Chirp',
    Body = 'Body',
}

enum LizSpeechSentiment {
    StrongDislike = 'StrongDislike',
    Dislike = 'Dislike',
    Neutral = 'Neutral',
    Like = 'Like',
    StrongLike = 'StrongLike',
}

enum LizSpeechIntensity {
    Somber = 'Somber',
    Cheerful = 'Cheerful',
    Neutral = 'Neutral',
    Assertive = 'Assertive',
    Yelling = 'Yelling',
}

const tagToFolderMap = {
    [LizSpeechTag.Greeting]: 'greetings',
    [LizSpeechTag.Hmm]: 'hmms',
    [LizSpeechTag.Oh]: 'hmms',
    [LizSpeechTag.LookAtThis]: 'look_at_this',
    [LizSpeechTag.Smelly]: 'smelly',
    [LizSpeechTag.FoundMoney]: 'found_money',
    [LizSpeechTag.CatchMoney]: 'chirps',
    [LizSpeechTag.PlayerFoundMoney]: 'chirps',
    [LizSpeechTag.Toss]: 'toss',
    [LizSpeechTag.Chirp]: 'chirps',
    [LizSpeechTag.Body]: 'body',
};

function getClipObject(assetName: string, speechTag: LizSpeechTag, type: LizSpeechType, sentiment: LizSpeechSentiment, intensity: LizSpeechIntensity, overrides?: Partial<LizSpeechClip>): LizSpeechClip {
    return {
        name: null,
        assetName,
        assetFolder: tagToFolderMap[speechTag],
        tag: speechTag,
        type,
        sentiment,
        intensity,
        ...overrides
    };
}

function getClipBlock(clip) {
    let vsndTxt = '';

    vsndTxt += vsndPrefix + clip.assetFolder + '_' + clip.assetName;
    vsndTxt += ' =\n';
    vsndTxt += '{\n';
    vsndTxt += '\ttype = "destinations.simple_vr"\n';
    vsndTxt += `\tvolume = ${volume}\n`;
    vsndTxt += `\tpitch = ${'1.0'}\n`;
    vsndTxt += `\tdelay = ${'0.0'}\n`;
    vsndTxt += `\tuse_hrtf = ${'1.0'}\n`;
    vsndTxt += `\tvolume_falloff_min = ${volumeFalloffMin}\n`;
    vsndTxt += `\tvolume_falloff_max = ${volumeFalloffMax}\n`;
    vsndTxt += `\tvsnd_files = "${directoryPrefix}/${clip.assetFolder}/${clip.assetName}.vsnd"\n`;
    vsndTxt += '}\n';

    return vsndTxt;
}

function getClipTypescript(clip) {
    let tsTxt = '';

    tsTxt += 'new LizSpeechClip(';
    tsTxt += `${clip.name ? `'${clip.name}'` : 'null'}, `;
    tsTxt += `'${vsndPrefix}${clip.assetFolder}_${clip.assetName}', `;
    tsTxt += `'${directoryPrefix}/${clip.assetFolder}/${clip.assetName}.vsnd', `;
    if (clip.tag) {
        tsTxt += `LizSpeechTag.${clip.tag}, `;
    } else {
        tsTxt += 'null, ';
    }
    if (clip.type) {
        tsTxt += `LizSpeechType.${clip.type}, `;
    } else {
        tsTxt += 'null, ';
    }
    if (clip.sentiment) {
        tsTxt += `LizSpeechSentiment.${clip.sentiment}, `;
    } else {
        tsTxt += 'null, ';
    }
    if (clip.intensity) {
        tsTxt += `LizSpeechIntensity.${clip.intensity}`;
    } else {
        tsTxt += 'null';
    }
    tsTxt += '),\n';

    return tsTxt;
}

///////////////////////////////////////////////
const lizClips = [
    // Greetings!
    getClipObject('bright_hey', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('bright_hey2', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('hello', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('hi_there', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('my_name_is_elizabeth', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
    getClipObject('regular_hey', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('soft_hey', LizSpeechTag.Greeting, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Somber),

    // Hmms!
    getClipObject('huh01', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('huh02', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
    getClipObject('huh03', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('huh04', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Like, LizSpeechIntensity.Neutral),
    getClipObject('huh05', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('huh06', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
    getClipObject('huh07', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('huh08', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
    getClipObject('huh09', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
    getClipObject('huh10', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('huh11', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),

    getClipObject('hmm01', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
    getClipObject('hmm02', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
    getClipObject('hmm03', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('hmm04', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('hmm05', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Neutral),
    getClipObject('hmm06', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('hmm07', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
    getClipObject('hmm08', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
    getClipObject('hmm09', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Cheerful),
    getClipObject('hmm10', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
    getClipObject('hmm11', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('hmm12', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
    getClipObject('hmm13', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),

    getClipObject('ahh01', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
    getClipObject('ahh02', LizSpeechTag.Hmm, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),

    getClipObject('oh01', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
    getClipObject('oh02', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
    getClipObject('oh03', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('oh04', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Neutral),
    getClipObject('oh05', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),

    getClipObject('oh01', LizSpeechTag.Oh, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
    getClipObject('oh02', LizSpeechTag.Oh, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
    getClipObject('oh03', LizSpeechTag.Oh, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('oh04', LizSpeechTag.Oh, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Neutral),
    getClipObject('oh05', LizSpeechTag.Oh, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),

    getClipObject('hmm_interesting', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
    getClipObject('strange', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('i_wonder', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('interesting01', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('interesting02', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
    getClipObject('odd01', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
    getClipObject('odd02', LizSpeechTag.Hmm, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),

    // Look at this!
    getClipObject('booker_here', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Yelling),
    getClipObject('come_look_at_these', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Assertive),
    getClipObject('do_you_want_this', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral), // TODO: this doesnt fit here
    getClipObject('huh_whats_this01', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
    getClipObject('huh_whats_this02', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('i_think_you_should_see_this', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('look_at_that01', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
    getClipObject('look_at_that02', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('look_at_that03', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
    getClipObject('look_at_that04', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Neutral),
    getClipObject('look_at_this01', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
    getClipObject('look_at_this02', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('look_at_this03', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Somber),
    getClipObject('look_at_this04', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('look_at_this05', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('look_at_this06', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('look_at_this07', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Assertive),
    getClipObject('look_at_this08', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('look_mr_dewitt01', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
    getClipObject('oh_whats_that', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('over_here01', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('over_here02', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('see_this01', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('this_looks_important01', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('this_looks_important02', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('what_is_this01', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
    getClipObject('what_is_this02', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('whats_that', LizSpeechTag.LookAtThis, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),

    // Smelly!
    getClipObject('smelly01', LizSpeechTag.Smelly, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
    getClipObject('smelly02', LizSpeechTag.Smelly, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
    getClipObject('smelly03', LizSpeechTag.Smelly, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
    getClipObject('smelly04', LizSpeechTag.Smelly, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
    getClipObject('smelly05', LizSpeechTag.Smelly, LizSpeechType.NonSpeech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
    getClipObject('oh_whats_that_smell', LizSpeechTag.Smelly, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),

    // Found some money!
    getClipObject('cash_booker', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('found_some_money', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('found_this_for_you', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('heres_some_cash', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('hey_found_some_money', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Somber),
    getClipObject('i_found_some_change', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Somber),
    getClipObject('more_money', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('need_money', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('wanna_hold_on_to_this', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),

    getClipObject('take_it', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive, {assetFolder: tagToFolderMap[LizSpeechTag.Toss]}),
    getClipObject('catch_booker', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive, {assetFolder: tagToFolderMap[LizSpeechTag.Toss]}),
    getClipObject('catch', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling, {assetFolder: tagToFolderMap[LizSpeechTag.Toss]}),
    getClipObject('here', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral, {assetFolder: tagToFolderMap[LizSpeechTag.Toss]}),
    getClipObject('here_you_go', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling, {assetFolder: tagToFolderMap[LizSpeechTag.Toss]}),
    getClipObject('catch2', LizSpeechTag.FoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling, {assetFolder: tagToFolderMap[LizSpeechTag.Toss]}),

    // Toss / Booker Catch
    getClipObject('take_it', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
    getClipObject('catch_booker', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Assertive),
    getClipObject('catch', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
    getClipObject('here', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('here_you_go', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
    getClipObject('catch_booker2', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),
    getClipObject('catch2', LizSpeechTag.Toss, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Yelling),

    // Catch Money
    getClipObject('amazing_what_people_leave_lying_around', LizSpeechTag.CatchMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('dont_spend_it_all_in_one_place', LizSpeechTag.CatchMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Neutral),
    getClipObject('someone_must_have_dropped_this', LizSpeechTag.CatchMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Neutral),

    // Player Found Money
    getClipObject('arent_we_the_well_to_do_types', LizSpeechTag.PlayerFoundMoney, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('i_imagine_sofa_cushions_turn_up_quarter', LizSpeechTag.PlayerFoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('seems_like_were_fairly_well_healed', LizSpeechTag.PlayerFoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('seems_like_were_fairly_well_healed2', LizSpeechTag.PlayerFoundMoney, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),

    // Chirps.
    //// Actual Chirp
    getClipObject('and_how_has_that_worked_out_for_you', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
    getClipObject('har_har', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('will_the_circle_humming_short', LizSpeechTag.Chirp, LizSpeechType.NonSpeech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('you_do_have_your_useful_qualities', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('you_do_have_your_useful_qualities2', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('youve_got_quite_a_knack_for_that', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),

    //// Uncategorized Chirp
    getClipObject('have_it_your_way_i_suppose', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
    getClipObject('i_have_a_better_idea', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('indeed', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
    getClipObject('its_about_7_30', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful), // when it's about 7:30
    getClipObject('no', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Assertive),
    getClipObject('no', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
    getClipObject('yes', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),

    //// Discussion Questions
    getClipObject('are_you_interested_in_gardening', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
    getClipObject('are_you_trying_to_get_us_both_arrested', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Neutral),
    getClipObject('do_you_hear_anything', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('exactly_what_business_do_you_have_in_here', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('okay_just_one_more', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
    getClipObject('ready_now', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('really', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
    getClipObject('really2', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
    getClipObject('well', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),

    //// Object Questions
    getClipObject('buffalo_tonic_whats_this', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
    getClipObject('madam_warblers_whiskey_cure', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),

    //// Object Commentary
    getClipObject('doest_seem_to_work_very_well', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Cheerful),
    getClipObject('i_love_it', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),
    getClipObject('maybe_that_machine_has_some_things_we_can_use', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
    getClipObject('maybe_you_should_get_that', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
    getClipObject('shock_jockey_who_needs_the_power_company', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful), // when picking up shock jockey
    getClipObject('this_is_it_isnt_it', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
    getClipObject('where_do_you_think_this_goes', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral), // maybe at a locked door?
    getClipObject('you_really_should_pick_that_up', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('youve_got_a_keen_eye_booker_noticed_trinkets', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful),

    //// Level Commentary
    getClipObject('almost_pumps_raincatchers', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful), // when in shop near pump door
    getClipObject('guess_we_should_come_back_later', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral), // when at level transition
    getClipObject('thats_foolish', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongDislike, LizSpeechIntensity.Somber),
    getClipObject('well_ill_be', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
    getClipObject('what_happened_there', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),
    getClipObject('whos_that', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber), // when player n+1 connects? or when selecting friends off panel?

    //// Plot
    getClipObject('fifty_percent', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Neutral),
    getClipObject('i_wanna_see_paris_everything', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful), // after seeing herself dance
    getClipObject('imagining_you_on_a_carousel', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('its_her', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber), // seeing herself dance
    getClipObject('look_on_the_other_side', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber),
    getClipObject('seems_like_an_unnecessary_complication', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
    getClipObject('that_was_odd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful),
    getClipObject('this_is_going_to_be_fantastic', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Cheerful), // pick up skyhook?
    getClipObject('watch_this', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),
    getClipObject('well_the_mans_got_an_ego', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Cheerful), // when you pick up a coin that was thrown and dropped
    getClipObject('whats_going_on', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Somber),

    //// Combat
    getClipObject('better_to_stay_away_from_that_crowd', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Somber), // people on the beach?
    getClipObject('looks_like_trouble_we_should_be_careful', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Dislike, LizSpeechIntensity.Cheerful),
    getClipObject('i_am_glad_were_on_the_same_side', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Assertive),
    getClipObject('incredible', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Assertive),
    getClipObject('three_cheers_for_us', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.StrongLike, LizSpeechIntensity.Yelling),
    getClipObject('you_can_stop_shooting_hes_dead', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('youve_done_this_before_havent_you', LizSpeechTag.Chirp, LizSpeechType.Speech, LizSpeechSentiment.Like, LizSpeechIntensity.Cheerful),

    // Body
    getClipObject('cough01', LizSpeechTag.Body, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('cough02', LizSpeechTag.Body, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
    getClipObject('sneeze01', LizSpeechTag.Body, LizSpeechType.NonSpeech, LizSpeechSentiment.Neutral, LizSpeechIntensity.Neutral),
];
///////////////////////////////////////////////

let vsndFile = '';
let tsFile = '';

for (let clip of lizClips) {
    vsndFile += getClipBlock(clip);
    tsFile += getClipTypescript(clip);
}

existsSync('./build') || mkdirSync('./build');
writeFileSync('./build/liz_vsnd_snippet.txt', vsndFile, 'utf-8');
writeFileSync('./build/liz_typescript_snippet.ts', tsFile, 'utf-8');

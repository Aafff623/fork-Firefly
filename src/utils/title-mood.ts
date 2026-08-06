/**
 * 列表卡标题情绪点缀（仅展示层）。
 * 不写 frontmatter / RSS / 正文 H1；中立标题跳过。
 */

export type TitleMood =
	| "question"
	| "rant"
	| "playful"
	| "sweat"
	| "struggle"
	| "tip";

type MoodPack = {
	keywords: RegExp;
	emoji: string[];
	kaomoji: string[];
};

/** 常见情绪词 → emoji / 颜文字池（同卡按 seed 二选一） */
const MOOD_PACKS: Record<TitleMood, MoodPack> = {
	question: {
		keywords: /到底|什么水平|怎么|为何|吗[？?]?$|？|\?/,
		emoji: ["🤔", "❓"],
		kaomoji: ["(´･ω･`)?", "Σ(°△°|||)", "(・・?)"],
	},
	rant: {
		keywords: /死循环|掐断|奇淫|坑爹|离谱/,
		emoji: ["👿", "💢"],
		kaomoji: ["(╬Ò﹏Ó)", "(╯°□°)╯"],
	},
	playful: {
		keywords: /搞成|也就|随缘|好玩|五层/,
		emoji: ["✨", "🎀"],
		kaomoji: ["(≧∇≦)/", "♪(´▽｀)"],
	},
	sweat: {
		keywords: /还剩|额度|怎么扣|拼车/,
		emoji: ["😅", "🫠"],
		kaomoji: ["(汗)", "(;´Д`)"],
	},
	struggle: {
		keywords: /真不是|那么简单|搬去|适配器/,
		emoji: ["😮‍💨", "🛠️"],
		kaomoji: ["(´;ω;`)", "(；´д｀)"],
	},
	tip: {
		keywords: /技巧|省钱|奇淫技巧/,
		emoji: ["💡", "💰"],
		kaomoji: ["(・∀・)", "(￣▽￣)"],
	},
};

const MOOD_ORDER: TitleMood[] = [
	"rant",
	"tip",
	"question",
	"sweat",
	"struggle",
	"playful",
];

/** 标题已自带表情 / 颜文字 → 不再叠 */
const HAS_EMOJI = /\p{Extended_Pictographic}/u;
const HAS_KAOMOJI =
	/[（(][^)）]{0,12}[´｀^￣><°・ωД∇▽□〇☆★;；~～дД][^)）]{0,12}[)）]|Σ\([^)]*\)|orz|OTL/i;

function hashSeed(seed: string): number {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

/** 识别首个命中的情绪；无则 null（中立不装饰） */
export function detectTitleMood(title: string): TitleMood | null {
	const t = title.trim();
	if (!t) return null;
	for (const mood of MOOD_ORDER) {
		if (MOOD_PACKS[mood].keywords.test(t)) return mood;
	}
	return null;
}

/**
 * 列表展示用标题：偶发挂 emoji 或颜文字（按 seed 交替），中立原文返回。
 * @param seed 建议用 post id，保证同帖稳定、邻帖易错开类型
 */
export function decorateListTitle(title: string, seed = title): string {
	const raw = title.trim();
	if (!raw) return title;
	if (HAS_EMOJI.test(raw) || HAS_KAOMOJI.test(raw)) return title;

	const mood = detectTitleMood(raw);
	if (!mood) return title;

	const pack = MOOD_PACKS[mood];
	const h = hashSeed(seed);
	const useEmoji = h % 2 === 0;
	const pool = useEmoji ? pack.emoji : pack.kaomoji;
	const mark = pool[h % pool.length];
	return `${raw} ${mark}`;
}

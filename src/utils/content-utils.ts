import type { CollectionEntry } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils";
import {
	type ArticleTiming,
	getAutoPinnedId,
	getEffectiveTime,
	type PinKind,
} from "@/lib/article-index";
import { loadArticleIndex } from "@/lib/article-index-loader";

export type { PinKind };

/** 用于默认置顶：有更新时间用 updated，否则用 published */
export function getEffectivePostTime(data: {
	published: Date;
	updated?: Date;
}): number {
	return getEffectiveTime(data);
}

/** 在非常驻文章中选出默认置顶（时间戳最新的一篇） */
export function getAutoPinnedPostId(
	posts: CollectionEntry<"posts">[],
): string | null {
	return getAutoPinnedId(posts.map(toArticleTiming), {
		includeDrafts: !import.meta.env.PROD,
	});
}

function toArticleTiming(post: CollectionEntry<"posts">): ArticleTiming {
	return {
		id: post.id,
		published: post.data.published,
		updated: post.data.updated,
		pinned: post.data.pinned,
		draft: post.data.draft,
	};
}

export function getPostPinKind(
	post: CollectionEntry<"posts">,
	autoPinnedId: string | null,
): PinKind | null {
	if (post.data.pinned) return "sticky";
	if (autoPinnedId && post.id === autoPinnedId) return "auto";
	return null;
}

/** 列表顺序由索引提供：常驻 → 默认置顶 → 其余（均按有效时间倒序） */
async function getSortedEntries(): Promise<CollectionEntry<"posts">[]> {
	const index = await loadArticleIndex();
	const entries: CollectionEntry<"posts">[] = [];
	for (const card of index.list()) {
		const entry = index.entry(card.id);
		if (entry) entries.push(entry);
	}
	return entries;
}

export async function getSortedPosts(): Promise<CollectionEntry<"posts">[]> {
	return getSortedEntries();
}

export type AdjacentPost = {
	id: string;
	title: string;
};

/** 上一篇/下一篇：返回显式视图，不再改写共享 entry 的 frontmatter 派生字段。 */
export async function getAdjacentPosts(postId: string): Promise<{
	prev: AdjacentPost | null;
	next: AdjacentPost | null;
}> {
	const cards = (await loadArticleIndex()).list();
	const index = cards.findIndex((card) => card.id === postId);
	if (index < 0) return { prev: null, next: null };

	const toAdjacent = (card: (typeof cards)[number] | undefined) =>
		card ? { id: card.id, title: card.title } : null;

	return {
		prev: toAdjacent(cards[index + 1]),
		next: toAdjacent(cards[index - 1]),
	};
}
export type PostForList = {
	id: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getSortedEntries();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		id: post.id,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

/** 全站一级标签统计；不含 themeTags（二级主题，仅文章侧栏展示） */
export async function getTagList(): Promise<Tag[]> {
	const cards = (await loadArticleIndex()).list();

	const countMap: { [key: string]: number } = {};
	cards.forEach((card) => {
		card.tags.forEach((tag) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const cards = (await loadArticleIndex()).list();
	const count: { [key: string]: number } = {};
	cards.forEach((card) => {
		if (!card.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}
		count[card.category] = count[card.category] ? count[card.category] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return (
			count[b] - count[a] || a.toLowerCase().localeCompare(b.toLowerCase())
		);
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

/**
 * 对标题进行分词，支持中英文混合
 * 使用 Intl.Segmenter 对中文分词，英文按空格分词
 * 过滤标点和空白，英文统一小写
 */
function tokenizeTitle(title: string): Set<string> {
	const tokens = new Set<string>();
	const segmenter = new Intl.Segmenter("zh", { granularity: "word" });
	for (const { segment, isWordLike } of segmenter.segment(title)) {
		if (!isWordLike) continue;
		tokens.add(segment.toLowerCase());
	}
	return tokens;
}

/**
 * 计算两个集合的 Jaccard 相似度
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
	if (a.size === 0 && b.size === 0) return 0;
	let intersection = 0;
	for (const item of a) {
		if (b.has(item)) intersection++;
	}
	const union = a.size + b.size - intersection;
	return union === 0 ? 0 : intersection / union;
}

/**
 * 获取相关文章推荐（默认 3 篇）
 *
 * 评分公式:
 *   totalScore = tagMatchScore×1.4 + sharedTagBonus + titleSimilarityScore×0.55
 *              + timeFreshnessScore + categoryBonus + heatScore
 *
 * - tagMatchScore (0-100): 标签 Jaccard × 100（主信号）
 * - sharedTagBonus (0-36): 交集标签数 × 12（绝对重叠，避免稀有标签被 Jaccard 稀释）
 * - titleSimilarityScore (0-100): 标题分词 Jaccard × 100
 * - timeFreshnessScore (0-30): 有效时间（updated ?? published）6 个月半衰期
 * - categoryBonus (0|12): 同分类
 * - heatScore (0-40): 热度代理（无赞/浏览批量接口时）
 *     · 标签流行度 log1p(Σ corpusFreq) 归一化 0-22
 *     · 常驻置顶 +12
 *     · 近 30 天有更新 +6
 *
 * 注：站点评论为 Waline，暂无全站点赞/浏览量 API；有数据源时可把真实 likes/views 并入 heatScore。
 */
export async function getRelatedPosts(
	currentPost: CollectionEntry<"posts">,
	maxCount = 3,
): Promise<PostForList[]> {
	const index = await loadArticleIndex();
	const cards = index.list();
	const currentCard = cards.find((card) => card.id === currentPost.id);
	if (!currentCard) return [];

	const maxHeat = Math.max(1, ...cards.map((card) => card.heat));
	const candidates = cards.filter(
		(card) => card.id !== currentPost.id && !card.password,
	);

	const currentTags = new Set(currentCard.tags.map((tag) => tag.toLowerCase()));
	const currentTokens = tokenizeTitle(currentCard.title);
	const currentCategory = currentCard.category.trim();
	const now = Date.now();

	const scored = candidates.flatMap((card) => {
		const entry = index.entry(card.id);
		if (!entry) return [];

		const postTags = new Set(card.tags.map((tag) => tag.toLowerCase()));
		let shared = 0;
		for (const t of currentTags) {
			if (postTags.has(t)) shared++;
		}
		const tagMatchScore = jaccardSimilarity(currentTags, postTags) * 100;
		const sharedTagBonus = Math.min(36, shared * 12);

		const titleSimilarityScore =
			jaccardSimilarity(currentTokens, tokenizeTitle(card.title)) * 100;

		const daysSince = (now - getEffectiveTime(card)) / (1000 * 60 * 60 * 24);
		const timeFreshnessScore = 30 * Math.exp((-Math.LN2 * daysSince) / 180);

		const categoryBonus =
			currentCategory && card.category && currentCategory === card.category
				? 12
				: 0;

		const topicHeatNorm = 22 * (Math.log1p(card.heat) / Math.log1p(maxHeat));
		const pinBonus = card.pinned ? 12 : 0;
		const recentUpdateBonus =
			card.updated && now - card.updated < 30 * 24 * 60 * 60 * 1000 ? 6 : 0;
		const heatScore = topicHeatNorm + pinBonus + recentUpdateBonus;

		const totalScore =
			tagMatchScore * 1.4 +
			sharedTagBonus +
			titleSimilarityScore * 0.55 +
			timeFreshnessScore +
			categoryBonus +
			heatScore;

		return [
			{
				post: entry,
				totalScore,
				tagMatchScore,
				shared,
				timeFreshnessScore,
				categoryBonus,
				heatScore,
			},
		];
	});

	scored.sort((a, b) => b.totalScore - a.totalScore);

	const withTagMatch = scored.filter(
		(s) => s.tagMatchScore > 0 || s.shared > 0,
	);
	const withoutTagMatch = scored.filter(
		(s) => s.tagMatchScore === 0 && s.shared === 0,
	);

	const result: PostForList[] = [];

	for (const s of withTagMatch) {
		if (result.length >= maxCount) break;
		result.push({ id: s.post.id, data: s.post.data });
	}

	// 不足时按热度 + 时效 + 同分类补齐（不再纯随机）
	if (result.length < maxCount) {
		withoutTagMatch.sort(
			(a, b) =>
				b.heatScore +
				b.timeFreshnessScore +
				b.categoryBonus -
				(a.heatScore + a.timeFreshnessScore + a.categoryBonus),
		);
		for (const s of withoutTagMatch) {
			if (result.length >= maxCount) break;
			result.push({ id: s.post.id, data: s.post.data });
		}
	}

	return result;
}

/**
 * 热笺 · 最近热门（侧栏）：热度代理 + 强时效偏置。
 * 无真实 PV 时：标签流行度 + 置顶 + 近更，再加重近 60 天半衰期。
 */
export async function getHotPosts(maxCount = 8): Promise<PostForList[]> {
	const index = await loadArticleIndex();
	const cards = index.list();
	const maxHeat = Math.max(1, ...cards.map((card) => card.heat));
	const now = Date.now();

	const scored = cards.flatMap((card) => {
		if (card.password) return [];
		const entry = index.entry(card.id);
		if (!entry) return [];

		const topicHeatNorm = 18 * (Math.log1p(card.heat) / Math.log1p(maxHeat));
		const pinBonus = card.pinned ? 10 : 0;
		const recentUpdateBonus =
			card.updated && now - card.updated < 30 * 24 * 60 * 60 * 1000 ? 8 : 0;
		const heatScore = topicHeatNorm + pinBonus + recentUpdateBonus;

		// 热笺：60 天半衰期，时效权重大于热度代理
		const daysSince = (now - getEffectiveTime(card)) / (1000 * 60 * 60 * 24);
		const timeFreshnessScore = 48 * Math.exp((-Math.LN2 * daysSince) / 60);

		return [{ post: entry, score: heatScore + timeFreshnessScore }];
	});

	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, Math.max(1, maxCount)).map((s) => ({
		id: s.post.id,
		data: s.post.data,
	}));
}

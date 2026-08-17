import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils";

/** sticky=人工常驻 · auto=默认动态置顶（最新 published/updated） */
export type PinKind = "sticky" | "auto";

/** 用于默认置顶：有更新时间用 updated，否则用 published */
export function getEffectivePostTime(data: {
	published: Date;
	updated?: Date;
}): number {
	return (data.updated ?? data.published).getTime();
}

/** 在非常驻文章中选出默认置顶（时间戳最新的一篇） */
export function getAutoPinnedPostId(
	posts: CollectionEntry<"posts">[],
): string | null {
	let bestId: string | null = null;
	let bestTime = Number.NEGATIVE_INFINITY;
	for (const post of posts) {
		if (post.data.pinned) continue;
		// 生产：草稿不抢默认置顶大卡。
		// 本地 DEV：草稿（含 _draftbox）要能顶到首页，方便调试预览。
		if (post.data.draft && import.meta.env.PROD) continue;
		const time = getEffectivePostTime(post.data);
		// 时间相同则 id 字典序更大者胜，保证结果稳定
		if (
			bestId === null ||
			time > bestTime ||
			(time === bestTime && post.id.localeCompare(bestId) > 0)
		) {
			bestTime = time;
			bestId = post.id;
		}
	}
	return bestId;
}

export function getPostPinKind(
	post: CollectionEntry<"posts">,
	autoPinnedId: string | null,
): PinKind | null {
	if (post.data.pinned) return "sticky";
	if (autoPinnedId && post.id === autoPinnedId) return "auto";
	return null;
}

function compareByEffectiveTimeDesc(
	a: CollectionEntry<"posts">,
	b: CollectionEntry<"posts">,
): number {
	return getEffectivePostTime(b.data) - getEffectivePostTime(a.data);
}

/** 主题 demo：`posts/` 根下单文件。成帖与草稿箱都在子目录，DEV/PROD 都不进首页列表。 */
function isThemeDemoPost(post: { filePath?: string }): boolean {
	const norm = (post.filePath ?? "").replace(/\\/g, "/");
	return /^src\/content\/posts\/[^/]+\.(md|mdx)$/.test(norm);
}

// Retrieve posts and sort: 常驻 → 默认置顶 → 其余（均按有效时间倒序）
async function getRawSortedPosts() {
	const allBlogPosts = (
		await getCollection("posts", ({ data }) => {
			return import.meta.env.PROD ? data.draft !== true : true;
		})
	).filter((post) => !isThemeDemoPost(post));

	const autoPinnedId = getAutoPinnedPostId(allBlogPosts);
	// 生产藏草稿常驻置顶；DEV 保留，便于草稿箱本地调试
	const stickyPosts = allBlogPosts
		.filter((post) => {
			if (!post.data.pinned) return false;
			if (post.data.draft && import.meta.env.PROD) return false;
			return true;
		})
		.sort(compareByEffectiveTimeDesc);
	const autoPosts = autoPinnedId
		? allBlogPosts.filter((post) => post.id === autoPinnedId)
		: [];
	const restPosts = allBlogPosts
		.filter((post) => !post.data.pinned && post.id !== autoPinnedId)
		.sort(compareByEffectiveTimeDesc);

	return [...stickyPosts, ...autoPosts, ...restPosts];
}

export async function getSortedPosts(): Promise<CollectionEntry<"posts">[]> {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].id;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].id;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	id: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

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
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
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
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
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
	const allPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const tagCorpusFreq = new Map<string, number>();
	for (const p of allPosts) {
		for (const t of p.data.tags || []) {
			const key = t.trim().toLowerCase();
			if (!key) continue;
			tagCorpusFreq.set(key, (tagCorpusFreq.get(key) || 0) + 1);
		}
	}
	let maxTopicHeat = 1;
	for (const p of allPosts) {
		let h = 0;
		for (const t of p.data.tags || []) {
			h += tagCorpusFreq.get(t.trim().toLowerCase()) || 0;
		}
		if (h > maxTopicHeat) maxTopicHeat = h;
	}

	const candidates = allPosts.filter(
		(p) => p.id !== currentPost.id && !p.data.password,
	);

	const currentTags = new Set(
		(currentPost.data.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean),
	);
	const currentTokens = tokenizeTitle(currentPost.data.title);
	const currentCategory = (currentPost.data.category || "").trim();
	const now = Date.now();

	const scored = candidates.map((post) => {
		const rawTags = post.data.tags || [];
		const postTags = new Set(
			rawTags.map((t) => t.trim().toLowerCase()).filter(Boolean),
		);

		let shared = 0;
		for (const t of currentTags) {
			if (postTags.has(t)) shared++;
		}
		const tagMatchScore = jaccardSimilarity(currentTags, postTags) * 100;
		const sharedTagBonus = Math.min(36, shared * 12);

		const postTokens = tokenizeTitle(post.data.title);
		const titleSimilarityScore =
			jaccardSimilarity(currentTokens, postTokens) * 100;

		const effectiveMs = getEffectivePostTime(post.data);
		const daysSince =
			(now - effectiveMs) / (1000 * 60 * 60 * 24);
		const timeFreshnessScore =
			30 * Math.exp((-Math.LN2 * daysSince) / 180);

		const postCategory = (post.data.category || "").trim();
		const categoryBonus =
			currentCategory && postCategory && currentCategory === postCategory
				? 12
				: 0;

		let topicHeat = 0;
		for (const t of postTags) {
			topicHeat += tagCorpusFreq.get(t) || 0;
		}
		const topicHeatNorm =
			22 * (Math.log1p(topicHeat) / Math.log1p(maxTopicHeat));
		const pinBonus = post.data.pinned ? 12 : 0;
		const updatedMs = post.data.updated?.getTime();
		const recentUpdateBonus =
			updatedMs && now - updatedMs < 30 * 24 * 60 * 60 * 1000 ? 6 : 0;
		const heatScore = topicHeatNorm + pinBonus + recentUpdateBonus;

		const totalScore =
			tagMatchScore * 1.4 +
			sharedTagBonus +
			titleSimilarityScore * 0.55 +
			timeFreshnessScore +
			categoryBonus +
			heatScore;

		return {
			post,
			totalScore,
			tagMatchScore,
			shared,
			timeFreshnessScore,
			categoryBonus,
			heatScore,
		};
	});

	scored.sort((a, b) => b.totalScore - a.totalScore);

	const withTagMatch = scored.filter((s) => s.tagMatchScore > 0 || s.shared > 0);
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
	const allPosts = (
		await getCollection<"posts">("posts", ({ data }) => {
			return import.meta.env.PROD ? data.draft !== true : true;
		})
	).filter((post) => !isThemeDemoPost(post));

	const tagCorpusFreq = new Map<string, number>();
	for (const p of allPosts) {
		for (const t of p.data.tags || []) {
			const key = t.trim().toLowerCase();
			if (!key) continue;
			tagCorpusFreq.set(key, (tagCorpusFreq.get(key) || 0) + 1);
		}
	}
	let maxTopicHeat = 1;
	for (const p of allPosts) {
		let h = 0;
		for (const t of p.data.tags || []) {
			h += tagCorpusFreq.get(t.trim().toLowerCase()) || 0;
		}
		if (h > maxTopicHeat) maxTopicHeat = h;
	}

	const now = Date.now();
	const scored = allPosts
		.filter((p) => !p.data.password)
		.map((post) => {
			const postTags = (post.data.tags || [])
				.map((t) => t.trim().toLowerCase())
				.filter(Boolean);
			let topicHeat = 0;
			for (const t of postTags) {
				topicHeat += tagCorpusFreq.get(t) || 0;
			}
			const topicHeatNorm =
				18 * (Math.log1p(topicHeat) / Math.log1p(maxTopicHeat));
			const pinBonus = post.data.pinned ? 10 : 0;
			const updatedMs = post.data.updated?.getTime();
			const recentUpdateBonus =
				updatedMs && now - updatedMs < 30 * 24 * 60 * 60 * 1000 ? 8 : 0;
			const heatScore = topicHeatNorm + pinBonus + recentUpdateBonus;

			// 热笺：60 天半衰期，时效权重大于热度代理
			const daysSince =
				(now - getEffectivePostTime(post.data)) / (1000 * 60 * 60 * 24);
			const timeFreshnessScore = 48 * Math.exp((-Math.LN2 * daysSince) / 60);

			return {
				post,
				score: heatScore + timeFreshnessScore,
			};
		});

	scored.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
	return scored.slice(0, Math.max(1, maxCount)).map((s) => ({
		id: s.post.id,
		data: s.post.data,
	}));
}

/**
 * 文章索引纯核心：不依赖 astro:content，可在 node / 浏览器里用 fixture 测试。
 *
 * 构建期由 `article-index-loader.ts` 读 content collection，再交给这里生成卡片；
 * 列表、搜索、问答、合集只从 `ArticleCard` 取数，排序与打分规则集中在本文件。
 */
export type ArticleIndexMode = "list" | "search" | "ask";

/** sticky=人工常驻 · auto=默认动态置顶（最新 published/updated） */
export type PinKind = "sticky" | "auto";

/** 搜索字段焦点：title / tag 对应旧的两个搜索模式，all 供 AI 候选排序 */
export type SearchFocus = "title" | "tag" | "all";

type TimeValue = Date | number | null | undefined;

/** Astro collection entry 的最小输入形状，便于 fixture 直接构造 */
export type ArticlePostData = {
	title?: string;
	description?: string;
	published?: TimeValue;
	updated?: TimeValue;
	category?: string | null;
	tags?: readonly string[] | null;
	themeTags?: readonly string[] | null;
	collections?: readonly string[] | null;
	pinned?: boolean | null;
	draft?: boolean | null;
	password?: unknown;
};

export type ArticlePostInput = {
	id: string;
	/** 原始 Markdown 正文，用于字数与长摘要；缺省时按无正文处理 */
	body?: string;
	/** Astro 源文件路径，用来识别 `posts/` 根下的主题 demo */
	filePath?: string;
	data: ArticlePostData;
};

export type ArticleCard = {
	id: string;
	/** 对外 URL slug（去掉扩展名与 `_draftbox/` 前缀） */
	slug: string;
	title: string;
	description: string;
	/** epoch ms */
	published: number;
	/** epoch ms；没有更新时间时为 null */
	updated: number | null;
	category: string;
	tags: string[];
	themeTags: string[];
	pinned: boolean;
	draft: boolean;
	password: boolean;
	collections: string[];
	/** 列表展示摘要（最多 160 字） */
	summary: string;
	/** 正文纯文本长摘录（最多 800 字），供问答打分补充召回 */
	excerpt: string;
	words: number;
	minutes: number;
	pinKind: PinKind | null;
	/** 标签在语料中的总出现次数（等价旧的 topicHeat） */
	heat: number;
};

export type RankedArticle = ArticleCard & { score: number };

export type ArticleCollectionNode = {
	slug: string;
	parent?: string | null;
};

export type ArticleQuery = {
	mode?: ArticleIndexMode;
	/** 关键词原文；未给 terms 时按空白切词 */
	text?: string;
	/** 已经抽好的检索词（问答链路用） */
	terms?: readonly string[];
	focus?: SearchFocus;
	/** 站点元问题：站点文档额外加权，且不吃新鲜度红利 */
	siteMeta?: boolean;
	now?: number;
	limit?: number;
};

export type ArticleIndex = {
	list(query?: ArticleQuery): RankedArticle[];
	collection(slug: string): ArticleCard[];
};

export type CreateArticleIndexOptions = {
	collections?: readonly ArticleCollectionNode[];
};

export type ArticleTiming = {
	id: string;
	published?: TimeValue;
	updated?: TimeValue;
	pinned?: boolean | null;
	draft?: boolean | null;
};

export class ArticleCollectionError extends Error {
	constructor(
		message: string,
		readonly slug?: string,
	) {
		super(message);
		this.name = "ArticleCollectionError";
	}
}

export const DEFAULT_SUMMARY_LENGTH = 160;
export const DEFAULT_EXCERPT_LENGTH = 800;

const THEME_DEMO_RE = /^src\/content\/posts\/[^/]+\.(md|mdx)$/;

/** 无更新时间时用发布时间的毫秒数；两者都缺省时按 0 处理 */
export function getEffectiveTime(input: {
	published?: TimeValue;
	updated?: TimeValue;
}): number {
	return (
		articleTimeToMillis(input.updated) ??
		articleTimeToMillis(input.published) ??
		0
	);
}

/** 草稿可见性唯一入口：生产隐藏，本地 DEV 放行（含草稿箱） */
export function isArticleVisible(
	draft: boolean | null | undefined,
	options: { includeDrafts: boolean },
): boolean {
	return options.includeDrafts || draft !== true;
}

/** 内容 id → 对外 slug（与 url-utils 的 toPostSlug 同规则） */
export function articleSlugFromId(id: string): string {
	return id.replace(/\.(md|mdx|markdown)$/i, "").replace(/^_draftbox\//, "");
}

/** 摘要截断唯一入口 */
export function truncateSummary(
	value: string,
	maxLength: number = DEFAULT_SUMMARY_LENGTH,
): string {
	const trimmed = value.trim();
	if (trimmed.length <= maxLength) return trimmed;
	return `${trimmed.slice(0, maxLength)}…`;
}

/** 在非常驻文章中选出默认置顶：有效时间最新，同时间 id 字典序更大者胜 */
export function getAutoPinnedId(
	items: readonly ArticleTiming[],
	options: { includeDrafts: boolean },
): string | null {
	let bestId: string | null = null;
	let bestTime = Number.NEGATIVE_INFINITY;
	for (const item of items) {
		if (item.pinned) continue;
		if (!isArticleVisible(item.draft, options)) continue;
		const time = getEffectiveTime(item);
		if (
			bestId === null ||
			time > bestTime ||
			(time === bestTime && item.id.localeCompare(bestId) > 0)
		) {
			bestTime = time;
			bestId = item.id;
		}
	}
	return bestId;
}

export function rankArticles(
	cards: readonly ArticleCard[],
	mode: ArticleIndexMode = "list",
	query: Omit<ArticleQuery, "mode"> = {},
): RankedArticle[] {
	if (mode === "list") {
		const ranked = cards.map((card) => ({ ...card, score: 0 }));
		ranked.sort(compareListArticles);
		return applyLimit(ranked, query.limit);
	}

	const terms = resolveTerms(query);
	if (terms.length === 0) return [];

	const now = query.now ?? Date.now();
	const ranked = cards
		.map((card) => ({
			...card,
			score:
				mode === "search"
					? scoreSearchArticle(card, terms, query, now)
					: scoreAskArticle(card, terms, query, now),
		}))
		.filter((card) => card.score > 0);

	ranked.sort(compareScoredArticles);
	return applyLimit(ranked, query.limit);
}

export function createArticleIndex(
	cards: readonly ArticleCard[],
	options: CreateArticleIndexOptions = {},
): ArticleIndex {
	const snapshot = cards.slice();
	const collections = options.collections ?? [];
	return {
		list(query = {}) {
			return rankArticles(snapshot, query.mode ?? "list", query);
		},
		collection(slug) {
			return collectionArticles(snapshot, slug, collections);
		},
	};
}

/** 合集文章：自身 + 所有后代合集的并集，按有效时间倒序，未知 slug / 缺父夹抛错 */
export function collectionArticles(
	cards: readonly ArticleCard[],
	slug: string,
	nodes: readonly ArticleCollectionNode[],
): ArticleCard[] {
	validateCollectionNodes(nodes);
	if (!nodes.some((node) => node.slug === slug)) {
		throw new ArticleCollectionError(`unknown collection: ${slug}`, slug);
	}

	const slugs = new Set<string>();
	const stack = [slug];
	while (stack.length > 0) {
		const current = stack.pop();
		if (!current || slugs.has(current)) continue;
		slugs.add(current);
		for (const node of nodes) {
			if (node.parent === current) stack.push(node.slug);
		}
	}

	const seen = new Set<string>();
	const matched: ArticleCard[] = [];
	for (const card of cards) {
		if (!card.collections.some((item) => slugs.has(item))) continue;
		if (seen.has(card.id)) continue;
		seen.add(card.id);
		matched.push(card);
	}
	matched.sort(
		(a, b) =>
			getEffectiveTime(b) - getEffectiveTime(a) ||
			b.heat - a.heat ||
			a.id.localeCompare(b.id),
	);
	return matched;
}

type FieldWeights = {
	exact: number;
	prefix: number;
	includes: number;
	fuzzy: number;
};

type MatchField =
	| "title"
	| "tags"
	| "themeTags"
	| "description"
	| "category"
	| "excerpt";

const NO_MATCH: FieldWeights = {
	exact: 0,
	prefix: 0,
	includes: 0,
	fuzzy: 0,
};

const SEARCH_WEIGHTS: Record<MatchField, FieldWeights> = {
	title: { exact: 100, prefix: 70, includes: 50, fuzzy: 15 },
	tags: { exact: 110, prefix: 80, includes: 60, fuzzy: 18 },
	themeTags: { exact: 88, prefix: 64, includes: 48, fuzzy: 14 },
	description: { exact: 20, prefix: 15, includes: 12, fuzzy: 4 },
	category: { exact: 16, prefix: 12, includes: 8, fuzzy: 3 },
	excerpt: NO_MATCH,
};

const SEARCH_FRESHNESS = { within30Days: 4, within90Days: 2 };

const ASK_WEIGHTS: Record<MatchField, FieldWeights> = {
	title: { exact: 8, prefix: 8, includes: 8, fuzzy: 0 },
	tags: { exact: 3, prefix: 3, includes: 3, fuzzy: 0 },
	themeTags: { exact: 3, prefix: 3, includes: 3, fuzzy: 0 },
	description: { exact: 4, prefix: 4, includes: 4, fuzzy: 0 },
	category: { exact: 2, prefix: 2, includes: 2, fuzzy: 0 },
	excerpt: { exact: 1, prefix: 1, includes: 1, fuzzy: 0 },
};

const ASK_FRESHNESS = { within30Days: 2.5, within90Days: 1 };
const SITE_DOC_BONUS = 4;
const SITE_META_DOC_BONUS = 18;
/** 泛词只靠正文命中时降权，避免「部署」扫全库（与旧问答口径一致） */
const ASK_BROAD_EXCERPT_FACTOR = 0.35;

const BROAD_TERMS = new Set([
	"部署",
	"上线",
	"托管",
	"构建",
	"配置",
	"教程",
	"实战",
	"项目",
	"平台",
	"应用",
]);

const SITE_DOC_RE = /firefly|fuwari|fork-firefly|数字花园|本站|cuteleaf/i;
const SITE_ANCHOR_RE =
	/firefly|fuwari|astro|vercel|edgeone|pnpm|tailwind|pagefind|swup|数字花园|fork-firefly/i;

/** 「这篇是不是在讲本站 / Firefly 主题本身」——问答与站点元信息共用 */
export function isSiteDocument(
	card: Pick<ArticleCard, "slug" | "title" | "tags" | "category">,
): boolean {
	const slug = card.slug.toLowerCase();
	const tagLine = card.tags.join(" ");
	if (SITE_DOC_RE.test(`${slug}\n${card.title}\n${tagLine}`)) return true;
	if (slug.startsWith("guide/") || slug.startsWith("about")) return true;
	if (
		card.category === "功能" &&
		/firefly|astro|主题/i.test(`${card.title}\n${tagLine}`)
	) {
		return true;
	}
	return false;
}

/** 单篇打分入口；rankArticles 与问答兜底共用同一套规则 */
export function scoreArticle(
	card: ArticleCard,
	query: ArticleQuery & { mode: "search" | "ask" },
): number {
	const terms = resolveTerms(query);
	if (terms.length === 0) return 0;
	const now = query.now ?? Date.now();
	return query.mode === "search"
		? scoreSearchArticle(card, terms, query, now)
		: scoreAskArticle(card, terms, query, now);
}

function scoreSearchArticle(
	card: ArticleCard,
	terms: readonly string[],
	query: Omit<ArticleQuery, "mode">,
	now: number,
): number {
	const focus = query.focus ?? "all";
	let score = 0;
	for (const term of terms) {
		if (focus === "title") {
			score += matchScore([card.title], term, SEARCH_WEIGHTS.title);
			continue;
		}
		if (focus === "tag") {
			score += matchScore(card.tags, term, SEARCH_WEIGHTS.tags);
			continue;
		}
		score += matchScore([card.title], term, SEARCH_WEIGHTS.title);
		score += matchScore(card.tags, term, SEARCH_WEIGHTS.tags);
		score += matchScore(card.themeTags, term, SEARCH_WEIGHTS.themeTags);
		score += matchScore([card.description], term, SEARCH_WEIGHTS.description);
		score += matchScore([card.category], term, SEARCH_WEIGHTS.category);
	}
	if (score > 0) score += freshnessScore(card, now, SEARCH_FRESHNESS);
	return score;
}

function scoreAskArticle(
	card: ArticleCard,
	terms: readonly string[],
	query: Omit<ArticleQuery, "mode">,
	now: number,
): number {
	const siteDocument = isSiteDocument(card);
	const siteMeta = query.siteMeta === true;
	const hasSiteAnchor = SITE_ANCHOR_RE.test(
		[
			card.title,
			card.description,
			card.tags.join(" "),
			card.themeTags.join(" "),
			card.excerpt,
		].join("\n"),
	);

	let score = 0;
	for (const term of terms) {
		const needle = normalizeText(term);
		if (!needle) continue;
		const termWeight = needle.length >= 3 ? 1.35 : 0.7;

		let hit = false;
		const title = matchScore([card.title], term, ASK_WEIGHTS.title);
		const description = matchScore(
			[card.description],
			term,
			ASK_WEIGHTS.description,
		);
		const tags = matchScore(card.tags, term, ASK_WEIGHTS.tags);
		const themeTags = matchScore(card.themeTags, term, ASK_WEIGHTS.themeTags);
		const category = matchScore([card.category], term, ASK_WEIGHTS.category);
		if (title + description + tags + themeTags + category > 0) hit = true;
		score += (title + description + tags + themeTags + category) * termWeight;

		const excerpt = matchScore([card.excerpt], term, ASK_WEIGHTS.excerpt);
		if (excerpt > 0) {
			const broad = BROAD_TERMS.has(needle);
			if (broad && !hit && !siteDocument && !hasSiteAnchor) {
				continue;
			}
			const factor = broad && !hit ? ASK_BROAD_EXCERPT_FACTOR : 1;
			score += excerpt * termWeight * factor;
			hit = true;
		}
	}

	if (score <= 0) return 0;
	if (siteDocument) {
		score += siteMeta ? SITE_META_DOC_BONUS : SITE_DOC_BONUS;
	}
	if (!siteMeta) score += freshnessScore(card, now, ASK_FRESHNESS);
	return score;
}

function freshnessScore(
	card: ArticleCard,
	now: number,
	weights: { within30Days: number; within90Days: number },
): number {
	const days = (now - getEffectiveTime(card)) / (1000 * 60 * 60 * 24);
	if (days <= 30) return weights.within30Days;
	if (days <= 90) return weights.within90Days;
	return 0;
}

function matchScore(
	values: readonly string[],
	term: string,
	weights: FieldWeights,
): number {
	const needle = normalizeText(term);
	if (!needle) return 0;
	let best = 0;
	for (const value of values) {
		const haystack = normalizeText(value);
		if (!haystack) continue;
		let score = 0;
		if (haystack === needle) score = weights.exact;
		else if (haystack.startsWith(needle)) score = weights.prefix;
		else if (haystack.includes(needle)) score = weights.includes;
		else if (isSubsequence(haystack, needle)) score = weights.fuzzy;
		if (score > best) best = score;
	}
	return best;
}

/** 子序列模糊匹配：查询字符按顺序出现即可（旧搜索的容错口径） */
function isSubsequence(haystack: string, needle: string): boolean {
	let cursor = 0;
	for (const character of needle) {
		const found = haystack.indexOf(character, cursor);
		if (found < 0) return false;
		cursor = found + 1;
	}
	return true;
}

function resolveTerms(query: Omit<ArticleQuery, "mode">): string[] {
	if (query.terms && query.terms.length > 0) {
		return query.terms
			.map((term) => normalizeText(term))
			.filter((term): term is string => term.length > 0);
	}
	return splitTerms(query.text ?? "");
}

function splitTerms(text: string): string[] {
	return normalizeText(text)
		.split(/\s+/)
		.filter((term) => term.length > 0);
}

function compareListArticles(a: RankedArticle, b: RankedArticle): number {
	return (
		pinRank(b) - pinRank(a) ||
		getEffectiveTime(b) - getEffectiveTime(a) ||
		b.heat - a.heat ||
		a.id.localeCompare(b.id)
	);
}

function compareScoredArticles(a: RankedArticle, b: RankedArticle): number {
	return (
		b.score - a.score ||
		getEffectiveTime(b) - getEffectiveTime(a) ||
		a.id.localeCompare(b.id)
	);
}

function pinRank(card: ArticleCard): number {
	if (card.pinKind === "sticky") return 2;
	if (card.pinKind === "auto") return 1;
	return 0;
}

function applyLimit(
	cards: RankedArticle[],
	limit: number | undefined,
): RankedArticle[] {
	if (limit === undefined) return cards;
	return cards.slice(0, Math.max(0, limit));
}

function validateCollectionNodes(
	nodes: readonly ArticleCollectionNode[],
): void {
	const bySlug = new Map<string, ArticleCollectionNode>();
	for (const node of nodes) {
		if (!node.slug) {
			throw new ArticleCollectionError("collection slug must not be empty");
		}
		if (bySlug.has(node.slug)) {
			throw new ArticleCollectionError(
				`duplicate collection: ${node.slug}`,
				node.slug,
			);
		}
		bySlug.set(node.slug, node);
	}
	for (const node of nodes) {
		if (node.parent && !bySlug.has(node.parent)) {
			throw new ArticleCollectionError(
				`collection "${node.slug}" references unknown parent "${node.parent}"`,
				node.slug,
			);
		}
	}
}

function normalizeText(value: string): string {
	return value.trim().toLocaleLowerCase();
}

/** 主题 demo：`posts/` 根下单文件，DEV/PROD 都不进索引 */
export function isThemeDemoPost(filePath: string | undefined): boolean {
	const normalized = (filePath ?? "").replace(/\\/g, "/");
	return THEME_DEMO_RE.test(normalized);
}

export function articleTimeToMillis(value: TimeValue): number | null {
	if (value === null || value === undefined) return null;
	const millis = value instanceof Date ? value.getTime() : value;
	return Number.isFinite(millis) ? millis : null;
}

import assert from "node:assert/strict";
import {
	type ArticleCard,
	type ArticleCollectionNode,
	type ArticlePostInput,
	collectionArticles,
	createArticleIndex,
	getAutoPinnedId,
	getEffectiveTime,
	isArticleVisible,
	rankArticles,
} from "../src/lib/article-index";
import { buildArticleCards } from "../src/lib/article-index-builder";

const collectionNodes: ArticleCollectionNode[] = [
	{ slug: "parent" },
	{ slug: "child", parent: "parent" },
];

const posts: ArticlePostInput[] = [
	{
		id: "posts/sticky-old",
		filePath: "src/content/posts/sticky-old/index.md",
		body: "# 置顶旧文\n\n置顶的旧文章正文。",
		data: {
			title: "置顶旧文",
			description: "人工常驻",
			published: new Date("2024-01-01T00:00:00Z"),
			tags: ["ai", "astro"],
			pinned: true,
		},
	},
	{
		id: "posts/updated",
		filePath: "src/content/posts/updated/index.md",
		body: "# 更新过的文\n\n最近改过的正文。",
		data: {
			title: "更新过的文",
			description: "更新比发布晚",
			published: new Date("2024-02-01T00:00:00Z"),
			updated: new Date("2024-07-01T00:00:00Z"),
			tags: ["astro"],
		},
	},
	{
		id: "posts/fresh",
		filePath: "src/content/posts/fresh/index.md",
		body: "# 最新普通文\n\n普通正文。",
		data: {
			title: "最新普通文",
			description: "普通摘要",
			published: new Date("2024-06-01T00:00:00Z"),
			tags: ["astro"],
		},
	},
	{
		id: "posts/older",
		filePath: "src/content/posts/older/index.md",
		body: "# 较早普通文\n\n普通正文。",
		data: {
			title: "较早普通文",
			description: "普通摘要",
			published: new Date("2024-03-01T00:00:00Z"),
			tags: ["life"],
		},
	},
	{
		id: "posts/child-post",
		filePath: "src/content/posts/child-post/index.md",
		body: "# 子合集文章\n\n合集正文。",
		data: {
			title: "子合集文章",
			description: "合集摘要",
			published: new Date("2024-05-01T00:00:00Z"),
			tags: ["astro"],
			collections: ["child"],
		},
	},
	{
		id: "posts/draft",
		filePath: "src/content/posts/draft/index.md",
		body: "# 草稿\n\n草稿正文。",
		data: {
			title: "草稿",
			description: "草稿摘要",
			published: new Date("2024-08-01T00:00:00Z"),
			draft: true,
			tags: ["draft"],
		},
	},
	{
		id: "posts/theme-demo",
		filePath: "src/content/posts/theme-demo.md",
		body: "# 主题 demo\n\n默认主题示例。",
		data: {
			title: "主题 demo",
			description: "默认主题示例",
			published: new Date("2024-09-01T00:00:00Z"),
			tags: ["astro"],
		},
	},
];

// ── 草稿可见性与 effective time ─────────────────────────────────────────────

assert.equal(
	getEffectiveTime({
		published: new Date("2024-01-01T00:00:00Z"),
		updated: new Date("2024-02-01T00:00:00Z"),
	}),
	Date.UTC(2024, 1, 1),
	"effective time must prefer updated over published",
);
assert.equal(
	getEffectiveTime({ published: new Date("2024-01-01T00:00:00Z") }),
	Date.UTC(2024, 0, 1),
	"effective time falls back to published",
);
assert.equal(
	isArticleVisible(true, { includeDrafts: false }),
	false,
	"drafts are hidden in production",
);
assert.equal(
	isArticleVisible(true, { includeDrafts: true }),
	true,
	"drafts stay visible in local dev",
);

// ── 构建期卡片：过滤、置顶、草稿、热度、摘要 ────────────────────────────────

const productionCards = buildArticleCards(posts, { includeDrafts: false });
const productionIds = productionCards.map((card) => card.id);
assert.ok(
	!productionIds.includes("posts/draft"),
	"production cards must not include drafts",
);
assert.ok(
	!productionIds.includes("posts/theme-demo"),
	"theme demo files at posts root must stay out of the index",
);

const byId = new Map(productionCards.map((card) => [card.id, card]));
assert.equal(byId.get("posts/sticky-old")?.pinKind, "sticky");
assert.equal(
	byId.get("posts/updated")?.pinKind,
	"auto",
	"auto pin goes to the newest non-pinned visible post (updated time wins)",
);
assert.equal(byId.get("posts/fresh")?.pinKind, null);
assert.equal(
	getAutoPinnedId(productionCards, { includeDrafts: false }),
	"posts/updated",
);
assert.equal(
	byId.get("posts/sticky-old")?.heat,
	5,
	"heat is the summed corpus frequency of a post's tags (ai=1 + astro=4)",
);
assert.equal(byId.get("posts/fresh")?.heat, 4);

const described = byId.get("posts/fresh");
assert.equal(described?.summary, "普通摘要");
assert.equal(described?.description, "普通摘要");
assert.ok((described?.words ?? 0) > 0, "reading words must be computed");
assert.ok((described?.minutes ?? 0) >= 1, "reading minutes must be at least 1");

const fallbackSummary = buildArticleCards(
	[
		{
			id: "posts/fallback",
			body: "# 标题\n\n第一段含有 [链接文字](https://example.com) 和 ![示意图](diagram.png)。\n\n第二段不应成为摘要。",
			data: {
				title: "标题",
				published: new Date("2024-01-01T00:00:00Z"),
			},
		},
	],
	{ includeDrafts: false },
)[0];
assert.equal(
	fallbackSummary?.summary,
	"第一段含有 链接文字 和 示意图。",
	"summary falls back to the first markdown paragraph",
);

const longSummary = buildArticleCards(
	[
		{
			id: "posts/long",
			data: {
				title: "长摘要",
				description: "长".repeat(400),
				published: new Date("2024-01-01T00:00:00Z"),
			},
		},
	],
	{ includeDrafts: false },
)[0];
assert.equal(
	longSummary?.summary.length,
	161,
	"summary caps at 160 chars plus …",
);
assert.ok(longSummary?.summary.endsWith("…"));

// ── list 排序：常驻 → 默认置顶 → 其余按有效时间 ─────────────────────────────

const listOrder = rankArticles(productionCards, "list").map((card) => card.id);
assert.deepEqual(listOrder, [
	"posts/sticky-old",
	"posts/updated",
	"posts/fresh",
	"posts/child-post",
	"posts/older",
]);

const devCards = buildArticleCards(posts, { includeDrafts: true });
const devOrder = rankArticles(devCards, "list").map((card) => card.id);
assert.deepEqual(
	devOrder.slice(0, 2),
	["posts/sticky-old", "posts/draft"],
	"local dev lets a newer draft take the auto-pin card",
);
assert.equal(
	devCards.find((card) => card.id === "posts/draft")?.pinKind,
	"auto",
);

// ── 合集：子合集聚合、未知 slug / 缺父夹报错 ────────────────────────────────

const parentPosts = collectionArticles(
	productionCards,
	"parent",
	collectionNodes,
);
assert.deepEqual(
	parentPosts.map((card) => card.id),
	["posts/child-post"],
	"parent collection aggregates child collection articles",
);
assert.throws(
	() => collectionArticles(productionCards, "nope", collectionNodes),
	/unknown collection/i,
	"unknown collection slug must throw instead of returning an empty list",
);
assert.throws(
	() =>
		collectionArticles(productionCards, "lonely", [
			{ slug: "lonely", parent: "missing" },
		]),
	/unknown parent/i,
	"a configured collection with a missing parent must throw",
);

const deduped = buildArticleCards(
	[
		{
			id: "posts/dual",
			data: {
				title: "双挂",
				published: new Date("2024-01-01T00:00:00Z"),
				collections: ["parent", "child"],
			},
		},
	],
	{ includeDrafts: false },
);
assert.equal(
	collectionArticles(deduped, "parent", collectionNodes).length,
	1,
	"a post attached to parent and child appears once",
);

// ── search 模式：标题 / 标签 / 描述权重与 focus ─────────────────────────────

const searchCards: ArticleCard[] = buildArticleCards(
	[
		{
			id: "posts/astro-intro",
			data: {
				title: "Astro 入门",
				description: "从零开始",
				published: new Date("2024-01-01T00:00:00Z"),
				tags: ["astro"],
			},
		},
		{
			id: "posts/astro-desc",
			data: {
				title: "博客搭建记录",
				description: "讲 Astro 的静态构建",
				published: new Date("2024-02-01T00:00:00Z"),
			},
		},
		{
			id: "posts/astro-tag",
			data: {
				title: "静态站点笔记",
				description: "没有关键词",
				published: new Date("2024-03-01T00:00:00Z"),
				tags: ["astro"],
			},
		},
	],
	{ includeDrafts: false },
);

const searchAll = rankArticles(searchCards, "search", { text: "astro" });
assert.deepEqual(
	searchAll.map((card) => card.id).slice(0, 2),
	["posts/astro-intro", "posts/astro-tag"],
	"title hits outrank tag hits, which outrank description hits",
);
assert.equal(
	searchAll[2]?.id,
	"posts/astro-desc",
	"description is the last search field",
);

const titleOnly = rankArticles(searchCards, "search", {
	text: "astro",
	focus: "title",
});
assert.deepEqual(
	titleOnly.map((card) => card.id),
	["posts/astro-intro"],
	"title focus does not match tags or descriptions",
);

const tagOnly = rankArticles(searchCards, "search", {
	text: "astro",
	focus: "tag",
});
assert.deepEqual(tagOnly.map((card) => card.id).sort(), [
	"posts/astro-intro",
	"posts/astro-tag",
]);
assert.deepEqual(
	rankArticles(searchCards, "search", { text: "不存在" }),
	[],
	"search returns no cards when nothing matches",
);
assert.deepEqual(
	rankArticles(searchCards, "search", { text: "   " }),
	[],
	"blank queries score nothing",
);

// ── ask 模式：站点文档加权 / 泛词正文门控 / 同分稳定 ───────────────────────

const askCards = buildArticleCards(
	[
		{
			id: "guide/firefly-deploy",
			body: "从本地构建到 Cloudflare Workers 上线的完整流程。",
			data: {
				title: "Firefly 部署指南",
				description: "把 Astro 博客部署到 Cloudflare Workers",
				published: new Date("2023-01-01T00:00:00Z"),
				tags: ["firefly", "astro", "cloudflare", "部署"],
			},
		},
		{
			id: "posts/blog-notes",
			body: "部署这件事偶尔提一句。",
			data: {
				title: "随笔",
				description: "日常记录",
				published: new Date("2024-01-01T00:00:00Z"),
			},
		},
		{
			id: "posts/astro-deploy-note",
			body: "Astro 部署时要注意缓存。",
			data: {
				title: "缓存笔记",
				description: "日常记录",
				published: new Date("2024-02-01T00:00:00Z"),
			},
		},
	],
	{ includeDrafts: false },
);

const askKeyword = rankArticles(askCards, "ask", { terms: ["部署"] });
assert.deepEqual(
	askKeyword.map((card) => card.id),
	["guide/firefly-deploy", "posts/astro-deploy-note"],
	"a broad term only earns body credit with a site anchor in the summary",
);
assert.ok(
	askKeyword[0].score > 0,
	"ask ranking exposes the score for threshold filtering",
);

const askSiteMeta = rankArticles(askCards, "ask", {
	terms: ["firefly"],
	siteMeta: true,
});
assert.equal(
	askSiteMeta[0]?.id,
	"guide/firefly-deploy",
	"site-meta mode boosts site documents",
);
assert.ok((askSiteMeta[0]?.score ?? 0) >= 18);

assert.deepEqual(
	rankArticles(askCards, "ask", { terms: ["量子纠缠"] }),
	[],
	"unknown ask terms must not fabricate hits",
);

// ── createArticleIndex：list / collection 统一入口 ─────────────────────────

const index = createArticleIndex(productionCards, {
	collections: collectionNodes,
});
assert.deepEqual(
	index.list({ mode: "list" }).map((card) => card.id),
	listOrder,
);
assert.equal(index.list({ mode: "search", text: "astro", limit: 2 }).length, 2);
assert.deepEqual(
	index.collection("parent").map((card) => card.id),
	["posts/child-post"],
);
assert.throws(() => index.collection("nope"), /unknown collection/i);

console.log(
	"PASS article index pure core (effective time / draft / pin / heat / summary / collection / list / search / ask)",
);

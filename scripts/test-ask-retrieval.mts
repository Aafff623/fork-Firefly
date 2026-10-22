import assert from "node:assert/strict";
import {
	AskIndexUnavailableError,
	type AskPost,
	loadAskIndex,
	retrieveSiteHits,
	retrieveSiteHitsFromPosts,
} from "../src/utils/ask-retrieve";

const posts: AskPost[] = [
	{
		slug: "guide/firefly-deploy",
		title: "Firefly 部署指南",
		desc: "把 Astro 博客部署到 Cloudflare Workers",
		tags: "firefly astro cloudflare 部署",
		category: "指南",
		time: 3_000,
		excerpt: "从本地构建到 Cloudflare Workers 上线的完整流程。",
	},
	{
		slug: "recent-note",
		title: "最近的生活记录",
		desc: "一些日常",
		tags: "生活",
		category: "",
		time: 2_000,
		excerpt: "随手记录。",
	},
	{
		slug: "agent-workflow",
		title: "Agent 工作流",
		desc: "Harness engineering 实践",
		tags: "agent workflow",
		category: "Agentic Coding",
		time: 1_000,
		excerpt: "把 agent 当成可编排的工程系统。",
	},
];

const urlFor = (slug: string) => `/posts/${slug}/`;

const recent = retrieveSiteHitsFromPosts("最近写了什么", posts, 2, urlFor);
assert.equal(recent.intent, "recent");
assert.equal(recent.hits.length, 2);
assert.equal(recent.hits[0]?.title, "Firefly 部署指南");

const keyword = retrieveSiteHitsFromPosts("Cloudflare 部署", posts, 5, urlFor);
assert.equal(keyword.intent, "keyword");
assert.ok(keyword.hits.length > 0, "keyword query should hit the deploy guide");
assert.equal(keyword.hits[0]?.title, "Firefly 部署指南");

const siteMeta = retrieveSiteHitsFromPosts(
	"这个博客用了什么技术栈",
	posts,
	5,
	urlFor,
);
assert.equal(siteMeta.intent, "site-meta");
assert.ok(siteMeta.hits.length > 0, "site-meta should fall back to site docs");

const empty = retrieveSiteHitsFromPosts("量子纠缠xyz", posts, 5, urlFor);
assert.equal(empty.hits.length, 0, "unknown keyword should not fabricate hits");

/*
 * 索引取不到时必须抛错，不能把失败答成「站内暂无」。
 * 走真实 loadAskIndex（索引缓存为空），用一个必失败的 fetch 触发。
 */
const originalFetch = globalThis.fetch;
globalThis.fetch = (async () => {
	throw new Error("network down");
}) as typeof globalThis.fetch;
try {
	await assert.rejects(
		() => loadAskIndex("http://127.0.0.1:1"),
		AskIndexUnavailableError,
		"index outage must surface as AskIndexUnavailableError",
	);
	await assert.rejects(
		() => retrieveSiteHits("量子纠缠", 5, "http://127.0.0.1:1"),
		AskIndexUnavailableError,
		"retrieveSiteHits must not swallow index outage",
	);
} finally {
	globalThis.fetch = originalFetch;
}

console.log(
	"PASS ask retrieval pure core (recent / keyword / site-meta / empty / index outage)",
);

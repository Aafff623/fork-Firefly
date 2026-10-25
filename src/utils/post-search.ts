import type { SearchResult } from "@/global";
import { type ArticleCard, rankArticles } from "@/lib/article-index";
import { getPostUrlBySlug, url } from "@/utils/url-utils";

export type SearchMode = "title" | "tag" | "ai";

export const SEARCH_MODE_OPTIONS: Array<{ value: SearchMode; label: string }> =
	[
		{ value: "title", label: "按文章标题模糊搜索" },
		{ value: "tag", label: "按标签匹配度搜索" },
		{ value: "ai", label: "按 AI 搜索" },
	];

export type PostSearchMeta = {
	id: string;
	title: string;
	description: string;
	published: number;
	updated: number | null;
	category: string;
	tags: string[];
	themeTags: string[];
	password: boolean;
	pinned: boolean;
	topicHeat: number;
};

export class PostSearchError extends Error {
	constructor(
		message: string,
		readonly code = "search_unavailable",
	) {
		super(message);
		this.name = "PostSearchError";
	}
}

let metadataPromise: Promise<PostSearchMeta[]> | null = null;

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(value: string, query: string): string {
	const terms = query
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.sort((a, b) => b.length - a.length);
	if (!terms.length) return escapeHtml(value);

	const matcher = new RegExp(
		`(${terms.map((term) => escapeRegExp(term)).join("|")})`,
		"giu",
	);
	let output = "";
	let lastIndex = 0;
	for (const match of value.matchAll(matcher)) {
		const index = match.index ?? 0;
		output += escapeHtml(value.slice(lastIndex, index));
		output += `<mark>${escapeHtml(match[0])}</mark>`;
		lastIndex = index + match[0].length;
	}
	return output + escapeHtml(value.slice(lastIndex));
}

function toArticleCard(post: PostSearchMeta): ArticleCard {
	return {
		id: post.id,
		slug: post.id,
		title: post.title,
		description: post.description,
		published: post.published,
		updated: post.updated,
		category: post.category,
		tags: post.tags,
		themeTags: post.themeTags,
		pinned: post.pinned,
		draft: false,
		password: post.password,
		collections: [],
		summary: post.description,
		excerpt: post.description,
		words: 0,
		minutes: 0,
		pinKind: post.pinned ? "sticky" : null,
		heat: post.topicHeat,
	};
}

function toResult(
	post: PostSearchMeta,
	query: string,
	mode: SearchMode,
): SearchResult {
	const visibleTags =
		mode === "ai" ? [...post.tags, ...post.themeTags] : post.tags;
	const uniqueTags = [...new Set(visibleTags.filter(Boolean))];
	const tagLine = uniqueTags.length ? `标签：${uniqueTags.join(" · ")}` : "";
	return {
		url: getPostUrlBySlug(post.id),
		meta: { title: highlight(post.title, query) },
		excerpt: highlight(post.description || tagLine || post.title, query),
		content: tagLine ? highlight(tagLine, query) : undefined,
	};
}

async function loadMetadata(): Promise<PostSearchMeta[]> {
	if (!metadataPromise) {
		metadataPromise = fetch(url("/api/allPostMeta.json"))
			.then(async (response) => {
				if (!response.ok) {
					throw new PostSearchError("文章索引暂时不可用");
				}
				return (await response.json()) as PostSearchMeta[];
			})
			.catch((error) => {
				metadataPromise = null;
				throw error;
			});
	}
	return metadataPromise;
}

async function searchWithAi(query: string): Promise<SearchResult[]> {
	const response = await fetch(url("/api/search/ai"), {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ query }),
	});
	let payload: {
		results?: PostSearchMeta[];
		code?: string;
		message?: string;
		error?: string;
		retryAfter?: number;
	} = {};
	try {
		payload = (await response.json()) as typeof payload;
	} catch {
		// Keep the user-facing error stable when the deployment returns a non-JSON 404/500.
	}
	if (!response.ok) {
		const message =
			payload.message ||
			(response.status === 429
				? "AI 搜索请求过于频繁，请稍后再试"
				: "AI 搜索暂时不可用，请先配置服务端 API Key");
		throw new PostSearchError(message, payload.code ?? payload.error);
	}
	return (payload.results || []).map((post) => toResult(post, query, "ai"));
}

export async function searchPosts(
	mode: SearchMode,
	query: string,
): Promise<SearchResult[]> {
	const trimmedQuery = query.trim();
	if (!trimmedQuery) return [];
	if (mode === "ai") return searchWithAi(trimmedQuery);

	const posts = await loadMetadata();
	const byId = new Map(posts.map((post) => [post.id, post]));
	const ranked = rankArticles(posts.map(toArticleCard), "search", {
		text: trimmedQuery,
		focus: mode === "title" ? "title" : "tag",
	});

	const results: SearchResult[] = [];
	for (const card of ranked) {
		const post = byId.get(card.id);
		if (post) results.push(toResult(post, trimmedQuery, mode));
	}
	return results;
}

export function isPostSearchError(error: unknown): error is PostSearchError {
	return error instanceof PostSearchError;
}

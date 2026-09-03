import type { SearchResult } from "@/global";
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

function normalize(value: string): string {
	return value.trim().toLocaleLowerCase();
}

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

function fuzzyScore(text: string, query: string): number {
	const haystack = normalize(text);
	const needle = normalize(query);
	if (!haystack || !needle) return 0;
	if (haystack === needle) return 1200;
	if (haystack.includes(needle)) return 900 + needle.length / haystack.length;

	let cursor = 0;
	let matched = 0;
	for (const character of needle) {
		const found = haystack.indexOf(character, cursor);
		if (found < 0) continue;
		matched += 1;
		cursor = found + 1;
	}
	return matched === needle.length ? 300 + matched / haystack.length : 0;
}

function tagScore(tags: string[], query: string): number {
	return tags.reduce((best, tag) => {
		const normalizedTag = normalize(tag);
		const normalizedQuery = normalize(query);
		if (!normalizedTag || !normalizedQuery) return best;
		if (normalizedTag === normalizedQuery) return Math.max(best, 1300);
		if (normalizedTag.startsWith(normalizedQuery)) return Math.max(best, 1000);
		if (normalizedTag.includes(normalizedQuery)) {
			return Math.max(
				best,
				800 + normalizedQuery.length / normalizedTag.length,
			);
		}
		return Math.max(best, fuzzyScore(normalizedTag, normalizedQuery));
	}, 0);
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
	let payload: { results?: PostSearchMeta[]; code?: string; message?: string } =
		{};
	try {
		payload = (await response.json()) as typeof payload;
	} catch {
		// Keep the user-facing error stable when the deployment returns a non-JSON 404/500.
	}
	if (!response.ok) {
		throw new PostSearchError(
			payload.message || "AI 搜索暂时不可用，请先配置服务端 API Key",
			payload.code,
		);
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
	return posts
		.map((post, index) => {
			const score =
				mode === "title"
					? fuzzyScore(post.title, trimmedQuery)
					: tagScore(post.tags, trimmedQuery);
			return { post, score, index };
		})
		.filter(({ score }) => score > 0)
		.sort(
			(a, b) =>
				b.score - a.score ||
				b.post.published - a.post.published ||
				a.index - b.index,
		)
		.map(({ post }) => toResult(post, trimmedQuery, mode));
}

export function isPostSearchError(error: unknown): error is PostSearchError {
	return error instanceof PostSearchError;
}

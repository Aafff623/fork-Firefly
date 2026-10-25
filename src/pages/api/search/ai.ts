import type { APIRoute } from "astro";
import {
	createRateLimiter,
	getClientAddress,
	json,
	rateLimited,
	readJson,
	upstreamError,
} from "@/lib/api/http";
import { type ArticleCard, rankArticles } from "@/lib/article-index";
import { buildArticleCards } from "@/lib/article-index-builder";
import { type AskIndexItem, loadAskIndex } from "@/utils/ask-retrieve";

export const prerender = false;

const MAX_QUERY_LENGTH = 160;
const MAX_CANDIDATES = 36;
const searchAiRateLimit = createRateLimiter({
	max: 12,
	windowMs: 10 * 60 * 1000,
	keyPrefix: "search-ai",
});

type Candidate = {
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

function env(name: string, fallback = ""): string {
	return (
		process.env[name] ||
		(import.meta.env[name] as string | undefined) ||
		fallback
	).trim();
}

function toCandidate(post: AskIndexItem): Candidate {
	return {
		id: post.slug,
		title: post.title,
		description: post.desc || "",
		published: post.published,
		updated: post.updated,
		category: post.category || "",
		tags: post.tags || [],
		themeTags: post.themeTags || [],
		password: post.password,
		pinned: post.pinned,
		topicHeat: 0,
	};
}

/** 索引条目 → 统一卡片，只用于排序，不改变对外响应形状 */
function toCards(items: readonly AskIndexItem[]): ArticleCard[] {
	return buildArticleCards(
		items.map((item) => ({
			id: item.slug,
			body: item.excerpt,
			data: {
				title: item.title,
				description: item.desc,
				published: item.published,
				updated: item.updated,
				category: item.category,
				tags: item.tags,
				themeTags: item.themeTags,
				pinned: item.pinned,
				password: item.password,
			},
		})),
		{ includeDrafts: true },
	);
}

function parseModelIds(content: string): string[] {
	const cleaned = content
		.trim()
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/\s*```$/i, "");
	try {
		const parsed = JSON.parse(cleaned) as unknown;
		if (Array.isArray(parsed))
			return parsed.filter((id): id is string => typeof id === "string");
		if (
			parsed &&
			typeof parsed === "object" &&
			"ids" in parsed &&
			Array.isArray(parsed.ids)
		) {
			return parsed.ids.filter((id): id is string => typeof id === "string");
		}
	} catch {
		// The lexical order below is safer than guessing from malformed model output.
	}
	return [];
}

export const POST: APIRoute = async ({ request, url }) => {
	const gate = searchAiRateLimit.check(getClientAddress(request));
	if (!gate.allowed) return rateLimited(gate.retryAfterSeconds);

	const read = await readJson<{ query?: unknown }>(request);
	if (read.kind !== "ok") {
		return json(400, { code: "invalid_json", message: "搜索请求格式不正确" });
	}

	const query =
		typeof read.data.query === "string" ? read.data.query.trim() : "";
	if (!query || query.length > MAX_QUERY_LENGTH) {
		return json(400, {
			code: "invalid_query",
			message: `搜索词需为 1-${MAX_QUERY_LENGTH} 个字符`,
		});
	}

	const apiKey = env("STEPFUN_API_KEY");
	if (!apiKey) {
		return json(503, {
			code: "stepfun_unconfigured",
			message: "AI 搜索尚未配置阶跃星辰 API Key",
		});
	}

	let items: AskIndexItem[];
	try {
		items = await loadAskIndex(url.origin);
	} catch {
		return json(502, {
			error: "index_unavailable",
			message: "站内索引暂时不可用，请稍后再试",
		});
	}
	const candidateById = new Map<string, Candidate>(
		items.map((item) => {
			const candidate = toCandidate(item);
			return [candidate.id, candidate] as const;
		}),
	);
	const candidates = rankArticles(toCards(items), "search", {
		text: query,
		focus: "all",
		limit: MAX_CANDIDATES,
	})
		.map((card) => candidateById.get(card.id))
		.filter((candidate): candidate is Candidate => candidate !== undefined);

	if (!candidates.length) return json(200, { results: [] });

	const apiBase = env(
		"STEPFUN_API_BASE",
		"https://api.stepfun.com/step_plan/v1",
	).replace(/\/$/, "");
	const model = env("STEPFUN_MODEL", "step-3.7-flash");
	const promptCandidates = candidates.map((candidate) => ({
		id: candidate.id,
		title: candidate.title,
		description: candidate.description,
		category: candidate.category,
		tags: candidate.tags,
		themeTags: candidate.themeTags,
	}));

	let response: Response;
	try {
		response = await fetch(`${apiBase}/chat/completions`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				model,
				temperature: 0,
				max_tokens: 512,
				messages: [
					{
						role: "system",
						content:
							'你是博客站内搜索排序器。只根据候选文章内容判断与用户查询的相关性，必须只输出 JSON 对象，格式为 {"ids":["候选id"]}，按相关性从高到低排列，不要输出解释。',
					},
					{
						role: "user",
						content: `用户查询：${query}\n候选文章：${JSON.stringify(promptCandidates)}`,
					},
				],
			}),
		});
	} catch {
		return upstreamError(0, "AI 搜索服务暂时无法连接");
	}

	if (!response.ok) {
		return upstreamError(response.status, "AI 搜索服务暂时不可用");
	}

	try {
		const payload = (await response.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};
		const ids = parseModelIds(payload.choices?.[0]?.message?.content || "");
		const byId = new Map(
			candidates.map((candidate) => [candidate.id, candidate]),
		);
		const ordered = ids
			.map((id) => byId.get(id))
			.filter((candidate): candidate is Candidate => !!candidate);
		const seen = new Set(ordered.map((candidate) => candidate.id));
		return json(200, {
			results: [
				...ordered,
				...candidates.filter((candidate) => !seen.has(candidate.id)),
			],
		});
	} catch {
		return json(200, { results: candidates });
	}
};

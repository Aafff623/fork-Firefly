import type { APIRoute } from "astro";
import { getSortedPosts } from "@/utils/content-utils";

export const prerender = false;

const MAX_QUERY_LENGTH = 160;
const MAX_CANDIDATES = 36;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 12;
const rateHits = new Map<string, number[]>();

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

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json; charset=utf-8" },
	});
}

function env(name: string, fallback = ""): string {
	return (
		process.env[name] ||
		(import.meta.env[name] as string | undefined) ||
		fallback
	).trim();
}

function normalized(value: string): string {
	return value.toLocaleLowerCase().trim();
}

function scoreCandidate(candidate: Candidate, query: string): number {
	const terms = normalized(query).split(/\s+/).filter(Boolean);
	const fields = [
		{ value: candidate.title, weight: 8 },
		{ value: candidate.tags.join(" "), weight: 6 },
		{ value: candidate.themeTags.join(" "), weight: 5 },
		{ value: candidate.description, weight: 2 },
	];
	return terms.reduce((total, term) => {
		return (
			total +
			fields.reduce((fieldTotal, field) => {
				const value = normalized(field.value);
				if (value === term) return fieldTotal + field.weight * 12;
				if (value.includes(term)) return fieldTotal + field.weight * 5;
				return fieldTotal;
			}, 0)
		);
	}, 0);
}

function getClientAddress(request: Request): string {
	return (
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-forwarded-for")?.split(",")[0] ||
		"unknown"
	).trim();
}

function isRateLimited(address: string): boolean {
	const now = Date.now();
	const recent = (rateHits.get(address) || []).filter(
		(timestamp) => now - timestamp < RATE_WINDOW_MS,
	);
	if (recent.length >= RATE_MAX) {
		rateHits.set(address, recent);
		return true;
	}
	recent.push(now);
	rateHits.set(address, recent);
	return false;
}

function toCandidate(
	post: Awaited<ReturnType<typeof getSortedPosts>>[number],
): Candidate {
	return {
		id: post.id,
		title: post.data.title,
		description: post.data.description || "",
		published: post.data.published.getTime(),
		updated: post.data.updated?.getTime() ?? null,
		category: post.data.category || "",
		tags: (post.data.tags || []).map((tag) => tag.trim()).filter(Boolean),
		themeTags: (post.data.themeTags || [])
			.map((tag) => tag.trim())
			.filter(Boolean),
		password: !!post.data.password,
		pinned: !!post.data.pinned,
		topicHeat: 0,
	};
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

export const POST: APIRoute = async ({ request }) => {
	if (isRateLimited(getClientAddress(request))) {
		return json(
			{ code: "rate_limited", message: "AI 搜索请求过于频繁，请稍后再试" },
			429,
		);
	}

	let body: { query?: unknown } = {};
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return json({ code: "invalid_json", message: "搜索请求格式不正确" }, 400);
	}

	const query = typeof body.query === "string" ? body.query.trim() : "";
	if (!query || query.length > MAX_QUERY_LENGTH) {
		return json(
			{
				code: "invalid_query",
				message: `搜索词需为 1-${MAX_QUERY_LENGTH} 个字符`,
			},
			400,
		);
	}

	const apiKey = env("STEPFUN_API_KEY");
	if (!apiKey) {
		return json(
			{
				code: "stepfun_unconfigured",
				message: "AI 搜索尚未配置阶跃星辰 API Key",
			},
			503,
		);
	}

	const allCandidates = (await getSortedPosts()).map(toCandidate);
	const candidates = allCandidates
		.map((candidate, index) => ({
			candidate,
			score: scoreCandidate(candidate, query),
			index,
		}))
		.filter(({ score }) => score > 0)
		.sort(
			(a, b) =>
				b.score - a.score ||
				b.candidate.published - a.candidate.published ||
				a.index - b.index,
		)
		.slice(0, MAX_CANDIDATES)
		.map(({ candidate }) => candidate);

	if (!candidates.length) return json({ results: [] });

	const apiBase = env(
		"STEPFUN_API_BASE",
		"https://api.stepfun.com/step_plan/v1",
	).replace(/\/$/, "");
	const model = env("STEPFUN_MODEL", "step-3.5-flash");
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
		return json(
			{ code: "stepfun_network_error", message: "AI 搜索服务暂时无法连接" },
			502,
		);
	}

	if (!response.ok) {
		return json(
			{ code: "stepfun_request_failed", message: "AI 搜索服务暂时不可用" },
			502,
		);
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
		return json({
			results: [
				...ordered,
				...candidates.filter((candidate) => !seen.has(candidate.id)),
			],
		});
	} catch {
		return json({ results: candidates });
	}
};

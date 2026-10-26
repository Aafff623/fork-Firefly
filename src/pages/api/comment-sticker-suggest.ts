/**
 * 评论区梗图联想 API（HTTP 层）。
 *
 * 策略顺序（L1 → writeback → Agent → 白名单）、8 字阈值、默认结果数都在
 * `@/lib/sticker-suggest/policy`；本文件只做请求解析、限流与响应映射。
 *
 * GET  → ?q= &path= &l1Only=1
 * POST → { q, path? }
 */ // 中文注释：与 comment-image 并列，独立限流
import type { APIRoute } from "astro";
import { commentConfig } from "@/config";
import {
	createRateLimiter,
	getClientAddress,
	json,
	NO_STORE_HEADERS,
	rateLimited,
	readJson,
} from "@/lib/api/http";
import { lookupLexicon } from "@/lib/sticker-suggest/l1-lexicon";
import {
	getDeepSeekEnv,
	suggestByDeepSeek,
} from "@/lib/sticker-suggest/l3-agent";
import {
	DEFAULT_MAX_RESULTS,
	type SuggestAgentAdapter,
	type SuggestOutcome,
	suggestStickers,
} from "@/lib/sticker-suggest/policy";
import { filterAllowedItems } from "@/lib/sticker-suggest/url-allowlist";
import {
	lookupWriteback,
	mergeWriteback,
} from "@/lib/sticker-suggest/writeback";

export const prerender = false;

const RATE_WINDOW_MS = 10 * 60 * 1000;

/** 同 IP 请求总量与 Agent 额度分开计数，窗口数学由 api/http 统一。 */
const requestRateLimit = createRateLimiter({
	max: 60,
	windowMs: RATE_WINDOW_MS,
	keyPrefix: "sticker-suggest",
});
const agentRateLimit = createRateLimiter({
	max: 20,
	windowMs: RATE_WINDOW_MS,
	keyPrefix: "sticker-suggest-agent",
});

function maxResults(): number {
	return (
		commentConfig.waline?.stickerSuggest?.maxResults ?? DEFAULT_MAX_RESULTS
	);
}

function agentEnabled(): boolean {
	return commentConfig.waline?.stickerSuggest?.agentEnabled === true;
}

/** 未配置密钥或配置关闭时 `available` 为假：不扣 Agent 额度，也不报错。 */
const agentAdapter: SuggestAgentAdapter = {
	available: () => agentEnabled() && getDeepSeekEnv() !== null,
	suggest: (query, limit) => suggestByDeepSeek(query, limit),
};

function isL1Only(url: URL): boolean {
	const flag = url.searchParams.get("l1Only");
	return flag === "1" || flag === "true";
}

type QueryRead =
	| { kind: "ok"; q: string }
	| { kind: "empty" }
	| { kind: "invalid" };

/** GET 读 query string；POST 读 JSON body。坏 JSON 不再伪装成缺参。 */
async function readQuery(request: Request, url: URL): Promise<QueryRead> {
	if (request.method !== "POST") {
		const q = url.searchParams.get("q");
		return q?.trim() ? { kind: "ok", q } : { kind: "empty" };
	}
	const read = await readJson<{ q?: unknown }>(request);
	if (read.kind === "empty") return { kind: "empty" };
	if (read.kind === "invalid-json" || read.kind === "too-large") {
		return { kind: "invalid" };
	}
	const q = read.data?.q;
	return typeof q === "string" && q.trim()
		? { kind: "ok", q }
		: { kind: "empty" };
}

function toResponse(outcome: SuggestOutcome): Response {
	if (outcome.kind === "rate_limited") {
		return rateLimited(outcome.retryAfterSeconds);
	}
	return json(200, outcome.response, NO_STORE_HEADERS);
}

async function handle(request: Request): Promise<Response> {
	const ip = getClientAddress(request);
	const decision = requestRateLimit.check(ip);
	if (!decision.allowed) return rateLimited(decision.retryAfterSeconds);

	const url = new URL(request.url);
	const query = await readQuery(request, url);
	if (query.kind === "invalid") {
		return json(400, { error: "invalid_json" }, NO_STORE_HEADERS);
	}
	if (query.kind === "empty") {
		return json(400, { error: "missing_q" }, NO_STORE_HEADERS);
	}

	const outcome = await suggestStickers(
		{ query: query.q.slice(0, 32), ip, l1Only: isL1Only(url) },
		{
			lookupL1: lookupLexicon,
			lookupWriteback,
			agent: agentAdapter,
			allowlist: filterAllowedItems,
			checkAgentRate: (key) => agentRateLimit.check(key),
			recordAgentHits: mergeWriteback,
			maxResults: maxResults(),
		},
	);
	return toResponse(outcome);
}

export const GET: APIRoute = async ({ request }) => handle(request);
export const POST: APIRoute = async ({ request }) => handle(request);

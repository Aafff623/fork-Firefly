/**
 * 评论区梗图联想 API。
 * P0：L1 词表；P1：未命中且 agentEnabled → DeepSeek 官网直连。
 * GET  → ?q= &path=
 * POST → { q, path? }
 */ // 中文注释：与 comment-image 并列，独立限流
import type { APIRoute } from "astro";
import { commentConfig } from "@/config";
import { lookupLexicon } from "@/lib/sticker-suggest/l1-lexicon";
import { getDeepSeekEnv, suggestByDeepSeek } from "@/lib/sticker-suggest/l3-agent";
import { normalizeQuery } from "@/lib/sticker-suggest/normalize";
import type { SuggestResponse } from "@/lib/sticker-suggest/types";
import { filterAllowedItems } from "@/lib/sticker-suggest/url-allowlist";
import {
	lookupWriteback,
	mergeWriteback,
} from "@/lib/sticker-suggest/writeback";

export const prerender = false;

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 60;
const AGENT_RATE_MAX = 20;
const rateHits = new Map<string, number[]>();
const agentHits = new Map<string, number[]>();

function clientIp(request: Request): string {
	return (
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-real-ip") ||
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		"unknown"
	);
}

function allowRate(
	store: Map<string, number[]>,
	ip: string,
	max: number,
): boolean {
	const now = Date.now();
	const prev = (store.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
	if (prev.length >= max) {
		store.set(ip, prev);
		return false;
	}
	prev.push(now);
	store.set(ip, prev);
	return true;
}

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});
}

function maxResults(): number {
	return commentConfig.waline?.stickerSuggest?.maxResults ?? 6;
}

function agentEnabled(): boolean {
	return commentConfig.waline?.stickerSuggest?.agentEnabled === true;
}

async function suggest(
	q: string,
	ip: string,
	l1Only = false,
): Promise<SuggestResponse> {
	const started = Date.now();
	const limit = maxResults();

	const l1 = filterAllowedItems(lookupLexicon(q, limit));
	if (l1.length) {
		return { source: "l1", items: l1, latencyMs: Date.now() - started };
	}

	const wb = filterAllowedItems(lookupWriteback(q, limit));
	if (wb.length) {
		return { source: "l1", items: wb, latencyMs: Date.now() - started };
	}

	if (l1Only || q.length > 8) {
		return { source: "none", items: [], latencyMs: Date.now() - started };
	}

	if (!agentEnabled() || !getDeepSeekEnv()) {
		return { source: "none", items: [], latencyMs: Date.now() - started };
	}

	if (!allowRate(agentHits, ip, AGENT_RATE_MAX)) {
		return { source: "none", items: [], latencyMs: Date.now() - started };
	}

	const { items, entryIds } = await suggestByDeepSeek(q, limit);
	const allowed = filterAllowedItems(items);
	if (allowed.length && entryIds.length) {
		mergeWriteback(
			q,
			entryIds.filter((id) => allowed.some((it) => it.id === id)),
		);
	}

	// 即使空结果也标 agent，前端才能区分「没走模型」vs「模型判空」 // 中文注释
	return {
		source: "agent",
		items: allowed,
		latencyMs: Date.now() - started,
	};
}

async function readQuery(request: Request, url: URL): Promise<string | null> {
	if (request.method === "GET") {
		return url.searchParams.get("q");
	}
	try {
		const body = (await request.json()) as { q?: unknown };
		return typeof body.q === "string" ? body.q : null;
	} catch {
		return null;
	}
}

async function handle(request: Request): Promise<Response> {
	const ip = clientIp(request);
	if (!allowRate(rateHits, ip, RATE_MAX)) {
		return json({ error: "rate_limited" }, 429);
	}

	const url = new URL(request.url);
	const raw = await readQuery(request, url);
	if (raw == null || !String(raw).trim()) {
		return json({ error: "missing_q" }, 400);
	}

	const q = normalizeQuery(String(raw).slice(0, 32));
	if (!q) {
		return json({
			source: "none",
			items: [],
			latencyMs: 0,
		} satisfies SuggestResponse);
	}

	const l1Only =
		url.searchParams.get("l1Only") === "1" ||
		url.searchParams.get("l1Only") === "true";

	return json(await suggest(q, ip, l1Only));
}

export const GET: APIRoute = async ({ request }) => handle(request);
export const POST: APIRoute = async ({ request }) => handle(request);

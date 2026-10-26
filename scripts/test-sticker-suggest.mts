/**
 * 贴纸建议策略核心行为测试（node + 假 adapter，不碰网络 / DOM）。
 *
 * 覆盖：L1 → writeback → agent → allowlist 的四段顺序、空结果、8 字阈值、
 * Agent 限流映射 429、writeback 独立 source、默认结果数与写回过滤。
 */

import assert from "node:assert/strict";
import { rateLimited } from "../src/lib/api/http";
import {
	AGENT_QUERY_MAX_CHARS,
	DEFAULT_MAX_RESULTS,
	type SuggestOutcome,
	type SuggestPolicyDeps,
	suggestStickers,
} from "../src/lib/sticker-suggest/policy";
import type { SuggestItem } from "../src/lib/sticker-suggest/types";

function item(id: string): SuggestItem {
	return {
		id,
		title: `title-${id}`,
		src: `https://cdn.jsdelivr.net/gh/x/${id}.png`,
		preview: `https://cdn.jsdelivr.net/gh/x/${id}-preview.png`,
	};
}

function expectOk(outcome: SuggestOutcome) {
	assert.equal(outcome.kind, "ok", `expected ok outcome, got ${outcome.kind}`);
	if (outcome.kind !== "ok") throw new Error("unreachable");
	return outcome.response;
}

type HarnessOptions = {
	l1?: SuggestItem[];
	writeback?: SuggestItem[];
	agentItems?: SuggestItem[];
	agentEntryIds?: string[];
	agentAvailable?: boolean;
	agentRate?: { allowed: boolean; retryAfterSeconds: number };
	/** allowlist 假实现里被拦下的 id */
	blockedIds?: string[];
	maxResults?: number;
};

function harness(options: HarnessOptions = {}) {
	const calls: string[] = [];
	const seen = {
		l1Queries: [] as string[],
		writebackQueries: [] as string[],
		agentQueries: [] as string[],
		limits: [] as number[],
		recorded: [] as Array<{ query: string; ids: string[] }>,
	};
	let tick = 0;

	const deps: SuggestPolicyDeps = {
		lookupL1(query, maxResults) {
			calls.push("l1");
			seen.l1Queries.push(query);
			seen.limits.push(maxResults);
			return options.l1 ?? [];
		},
		lookupWriteback(query, maxResults) {
			calls.push("writeback");
			seen.writebackQueries.push(query);
			seen.limits.push(maxResults);
			return options.writeback ?? [];
		},
		agent: {
			available: () => options.agentAvailable !== false,
			async suggest(query, maxResults) {
				calls.push("agent");
				seen.agentQueries.push(query);
				seen.limits.push(maxResults);
				return {
					items: options.agentItems ?? [],
					entryIds: options.agentEntryIds ?? [],
				};
			},
		},
		allowlist(items) {
			calls.push("allowlist");
			const blocked = options.blockedIds ?? [];
			return items.filter((entry) => !blocked.includes(entry.id));
		},
		checkAgentRate(ip) {
			calls.push(`rate:${ip}`);
			return options.agentRate ?? { allowed: true, retryAfterSeconds: 0 };
		},
		recordAgentHits(query, ids) {
			calls.push("record");
			seen.recorded.push({ query, ids });
		},
		maxResults: options.maxResults,
		now: () => {
			tick += 7;
			return tick;
		},
	};

	return { deps, calls, seen };
}

/* ---------- 四段顺序：L1 → writeback → agent → allowlist ---------- */

{
	const { deps, calls } = harness({ l1: [item("l1-hit")] });
	const response = expectOk(
		await suggestStickers({ query: "好耶", ip: "1.1.1.1" }, deps),
	);
	assert.equal(response.source, "l1");
	assert.deepEqual(
		response.items.map((entry) => entry.id),
		["l1-hit"],
	);
	assert.deepEqual(
		calls,
		["l1", "allowlist"],
		"L1 命中后不应再碰 writeback / agent / 限流",
	);
}

{
	// L1 与 writeback 都被白名单清空，才轮到 agent；顺序固定
	const { deps, calls } = harness({
		l1: [item("blocked-l1")],
		writeback: [item("blocked-wb")],
		agentItems: [item("agent-hit")],
		agentEntryIds: ["agent-hit"],
		blockedIds: ["blocked-l1", "blocked-wb"],
	});
	const response = expectOk(
		await suggestStickers({ query: "好耶", ip: "2.2.2.2" }, deps),
	);
	assert.equal(response.source, "agent");
	assert.deepEqual(
		response.items.map((entry) => entry.id),
		["agent-hit"],
	);
	assert.deepEqual(calls, [
		"l1",
		"allowlist",
		"writeback",
		"allowlist",
		"rate:2.2.2.2",
		"agent",
		"allowlist",
		"record",
	]);
}

/* ---------- writeback 命中：独立 source，绕过 agent ---------- */

{
	const { deps, calls } = harness({ writeback: [item("wb-hit")] });
	const response = expectOk(
		await suggestStickers({ query: "写回词", ip: "3.3.3.3" }, deps),
	);
	assert.equal(
		response.source,
		"writeback",
		"writeback 命中不能标成 l1，否则前端与日志分不清",
	);
	assert.deepEqual(
		response.items.map((entry) => entry.id),
		["wb-hit"],
	);
	assert.ok(!calls.includes("agent"), "writeback 命中不应调用 agent");
	assert.ok(!calls.includes("record"), "writeback 命中不应再写回");
}

/* ---------- 空结果：仍是 200 none，不是 429 ---------- */

{
	const { deps, calls } = harness();
	const response = expectOk(
		await suggestStickers({ query: "没有这个词", ip: "4.4.4.4" }, deps),
	);
	assert.equal(
		response.source,
		"agent",
		"走过模型但判空仍标 agent，前端才能区分「没走模型」与「模型判空」",
	);
	assert.deepEqual(response.items, []);
	assert.equal(typeof response.latencyMs, "number");
	assert.ok(calls.includes("agent"), "可用 agent 时应尝试一次");
}

{
	const { deps, calls } = harness({ agentAvailable: false });
	const response = expectOk(
		await suggestStickers({ query: "没有这个词", ip: "4.4.4.5" }, deps),
	);
	assert.equal(response.source, "none");
	assert.deepEqual(response.items, []);
	assert.ok(
		!calls.some((call) => call.startsWith("rate:")),
		"agent 不可用时不应消耗限流额度",
	);
}

{
	const { deps, calls } = harness();
	const response = expectOk(
		await suggestStickers({ query: "   ", ip: "4.4.4.6" }, deps),
	);
	assert.equal(response.source, "none");
	assert.deepEqual(calls, [], "空查询不应触达任何 adapter");
}

/* ---------- Agent 限流：429 契约，与「没匹配到」区分 ---------- */

{
	const { deps } = harness({
		agentRate: { allowed: false, retryAfterSeconds: 37 },
	});
	const outcome = await suggestStickers({ query: "好耶", ip: "5.5.5.5" }, deps);
	assert.equal(outcome.kind, "rate_limited");
	if (outcome.kind !== "rate_limited") throw new Error("unreachable");
	assert.equal(outcome.retryAfterSeconds, 37);

	const response = rateLimited(outcome.retryAfterSeconds);
	assert.equal(response.status, 429);
	assert.equal(response.headers.get("retry-after"), "37");
	assert.equal(
		response.headers.get("content-type"),
		"application/json; charset=utf-8",
	);
	assert.deepEqual(await response.json(), {
		error: "rate_limited",
		code: "rate_limited",
		message: "请求过于频繁，请稍后再试",
		retryAfter: 37,
	});
}

{
	// 「查询太长」仍是 200 空结果，不能被 Agent 额度误伤
	const { deps, calls } = harness({
		agentRate: { allowed: false, retryAfterSeconds: 9 },
	});
	const response = expectOk(
		await suggestStickers(
			{ query: "一".repeat(AGENT_QUERY_MAX_CHARS + 1), ip: "5.5.5.6" },
			deps,
		),
	);
	assert.equal(response.source, "none");
	assert.ok(!calls.some((call) => call.startsWith("rate:")));
}

/* ---------- 8 字阈值与 l1Only ---------- */

{
	const atLimit = "二".repeat(AGENT_QUERY_MAX_CHARS);
	const { deps, calls } = harness();
	expectOk(await suggestStickers({ query: atLimit, ip: "6.6.6.1" }, deps));
	assert.ok(calls.includes("agent"), "恰好 8 字仍走 agent");
}

{
	const overLimit = "三".repeat(AGENT_QUERY_MAX_CHARS + 1);
	const { deps, calls } = harness();
	expectOk(await suggestStickers({ query: overLimit, ip: "6.6.6.2" }, deps));
	assert.ok(!calls.includes("agent"), "超过 8 字不打 agent");
}

{
	const { deps, calls } = harness();
	const response = expectOk(
		await suggestStickers({ query: "好耶", ip: "6.6.6.3", l1Only: true }, deps),
	);
	assert.equal(response.source, "none");
	assert.ok(!calls.includes("agent"), "l1Only 只查本地两层");
}

/* ---------- 默认结果数与查询归一化只有一处 ---------- */

{
	const { deps, seen } = harness();
	expectOk(
		await suggestStickers({ query: "  HAO YE！！ ", ip: "7.7.7.7" }, deps),
	);
	assert.equal(DEFAULT_MAX_RESULTS, 6);
	assert.deepEqual(
		seen.limits,
		[DEFAULT_MAX_RESULTS, DEFAULT_MAX_RESULTS, DEFAULT_MAX_RESULTS],
		"未配置时三层都用同一个默认结果数",
	);
	assert.deepEqual(seen.l1Queries, ["haoye"], "查询先归一化再进策略");
	assert.deepEqual(seen.agentQueries, ["haoye"]);
}

{
	const { deps, seen } = harness({ maxResults: 3 });
	expectOk(await suggestStickers({ query: "好耶", ip: "7.7.7.8" }, deps));
	assert.deepEqual(seen.limits, [3, 3, 3], "配置值覆盖默认值");
}

/* ---------- 写回只记白名单通过的 id ---------- */

{
	const { deps, seen } = harness({
		agentItems: [item("keep"), item("blocked")],
		agentEntryIds: ["keep", "blocked"],
		blockedIds: ["blocked"],
	});
	const response = expectOk(
		await suggestStickers({ query: "好耶", ip: "8.8.8.8" }, deps),
	);
	assert.deepEqual(
		response.items.map((entry) => entry.id),
		["keep"],
	);
	assert.deepEqual(seen.recorded, [{ query: "好耶", ids: ["keep"] }]);
}

console.log(
	"PASS sticker suggest policy (order / empty / 8-char threshold / agent 429 / writeback source / default limit)",
);

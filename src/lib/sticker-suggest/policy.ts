/**
 * 贴纸建议策略核心（纯函数，无 IO）。
 *
 * 顺序只有这一份：L1 词表 → 运行时写回 → Agent → URL 白名单收口。
 * 路由只做 HTTP 解析与响应映射；L1 / writeback / Agent / 限流 / 白名单全部注入，
 * 因此可以在 node 里用假 adapter 测试顺序、阈值与限流分支。
 */

import { normalizeQuery } from "./normalize";
import type { SuggestItem, SuggestResponse } from "./types";

/** 默认最多返回条数；调用方（配置）没给时用它。 */
export const DEFAULT_MAX_RESULTS: number = 6;

/** 超过这个长度的整句不打 Agent（服务端与客户端共用同一阈值）。 */
export const AGENT_QUERY_MAX_CHARS: number = 8;

/** Agent 适配器：可用性判断与调用分开，便于测试「不可用时不碰限流」。 */
export type SuggestAgentAdapter = {
	available: () => boolean;
	suggest: (
		query: string,
		maxResults: number,
	) => Promise<{ items: SuggestItem[]; entryIds: string[] }>;
};

/** 限流判定形状，与 `@/lib/api/http` 的 RateLimitDecision 结构兼容（不引服务端模块）。 */
export type SuggestRateDecision = {
	allowed: boolean;
	retryAfterSeconds: number;
};

export type SuggestPolicyDeps = {
	lookupL1: (query: string, maxResults: number) => SuggestItem[];
	lookupWriteback: (query: string, maxResults: number) => SuggestItem[];
	/** null 表示未接 Agent（未配置密钥或配置关闭）。 */
	agent: SuggestAgentAdapter | null;
	allowlist: (items: SuggestItem[]) => SuggestItem[];
	/** 仅 Agent 分支消耗的额度；L1 / writeback 命中不扣。 */
	checkAgentRate: (ip: string) => SuggestRateDecision;
	/** Agent 命中后写回别名，供下一轮 L1 之后的 writeback 段命中。 */
	recordAgentHits: (query: string, entryIds: string[]) => void;
	/** 未给时用 DEFAULT_MAX_RESULTS。 */
	maxResults?: number;
	/** 测试注入假时钟；默认 Date.now。 */
	now?: () => number;
};

export type SuggestInput = {
	/** 原始查询；核心内部归一化。 */
	query: string;
	/** 限流键（客户端地址）。 */
	ip: string;
	/** true 时只查 L1 / writeback，不打 Agent。 */
	l1Only?: boolean;
};

/**
 * 结果二态：
 * - `ok`：200，`source` 区分 l1 / writeback / agent / none；
 * - `rate_limited`：429，带 Retry-After 秒数（与「没匹配到」的空结果语义分开）。
 */
export type SuggestOutcome =
	| { readonly kind: "ok"; readonly response: SuggestResponse }
	| { readonly kind: "rate_limited"; readonly retryAfterSeconds: number };

export async function suggestStickers(
	input: SuggestInput,
	deps: SuggestPolicyDeps,
): Promise<SuggestOutcome> {
	const now = deps.now ?? Date.now;
	const started = now();
	const limit = deps.maxResults ?? DEFAULT_MAX_RESULTS;

	const finish = (
		source: SuggestResponse["source"],
		items: SuggestItem[],
	): SuggestOutcome => ({
		kind: "ok",
		response: { source, items, latencyMs: now() - started },
	});

	const query = normalizeQuery(input.query);
	if (!query) return finish("none", []);

	// 1. L1 词表：命中最快，先返回。
	const l1 = deps.allowlist(deps.lookupL1(query, limit));
	if (l1.length) return finish("l1", l1);

	// 2. 运行时写回：Agent 上次的命中别名，独立 source 便于前端与日志区分。
	const writeback = deps.allowlist(deps.lookupWriteback(query, limit));
	if (writeback.length) return finish("writeback", writeback);

	// 3. 整句不打 Agent；l1Only 同理。二者都是「没匹配到」，仍是 200 空结果。
	if (input.l1Only || query.length > AGENT_QUERY_MAX_CHARS) {
		return finish("none", []);
	}

	// 4. Agent：未配置时不扣额度，也不报错。
	const agent = deps.agent;
	if (!agent?.available()) return finish("none", []);

	// 5. Agent 额度：超限是明确的 429，不再伪装成空结果。
	const decision = deps.checkAgentRate(input.ip);
	if (!decision.allowed) {
		return {
			kind: "rate_limited",
			retryAfterSeconds: decision.retryAfterSeconds,
		};
	}

	const { items, entryIds } = await agent.suggest(query, limit);
	// 6. 白名单收口：模型只选 id，URL 仍由本地白名单把关。
	const allowed = deps.allowlist(items);
	if (allowed.length && entryIds.length) {
		deps.recordAgentHits(
			query,
			entryIds.filter((id) => allowed.some((item) => item.id === id)),
		);
	}
	return finish("agent", allowed);
}

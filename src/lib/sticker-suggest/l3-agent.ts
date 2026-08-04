/**
 * L3 Agent：DeepSeek 官网直连（OpenAI 兼容）。
 * 文档：https://api-docs.deepseek.com
 * base_url: https://api.deepseek.com
 * model: deepseek-v4-flash（关 thinking，求低延迟）
 */ // 中文注释：密钥仅服务端

import {
	getEntryById,
	listCatalogForAgent,
	entriesToItems,
} from "./l1-lexicon";
import type { SuggestItem } from "./types";

const DEFAULT_BASE = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";
const TIMEOUT_MS = 2800;

type AgentEnv = {
	apiKey: string;
	baseUrl: string;
	model: string;
};

function readEnv(name: string): string {
	return (
		process.env[name] ||
		(import.meta.env[name] as string | undefined) ||
		""
	).trim();
}

export function getDeepSeekEnv(): AgentEnv | null {
	const apiKey = readEnv("DEEPSEEK_API_KEY") || readEnv("STICKER_AGENT_API_KEY");
	if (!apiKey) return null;
	const baseUrl = (
		readEnv("DEEPSEEK_API_BASE") ||
		readEnv("STICKER_AGENT_BASE_URL") ||
		DEFAULT_BASE
	).replace(/\/$/, "");
	const model =
		readEnv("DEEPSEEK_MODEL") ||
		readEnv("STICKER_AGENT_MODEL") ||
		DEFAULT_MODEL;
	return { apiKey, baseUrl, model };
}

type AgentJson = {
	ids?: unknown;
};

function parseIds(content: string): string[] {
	const data = JSON.parse(content) as AgentJson;
	if (!Array.isArray(data.ids)) return [];
	return data.ids.filter((id): id is string => typeof id === "string" && !!id);
}

/**
 * 让模型只从策展目录里选 id，禁止发明外链。
 */ // 中文注释：JSON Output + 关 thinking
export async function suggestByDeepSeek(
	query: string,
	maxResults: number,
): Promise<{ items: SuggestItem[]; entryIds: string[] }> {
	const env = getDeepSeekEnv();
	if (!env) return { items: [], entryIds: [] };

	const catalog = listCatalogForAgent();
	if (!catalog.length) return { items: [], entryIds: [] };

	const system = `你是博客评论区的中文热梗表情匹配助手。根据用户短词，从给定目录中选出最合适的表情 id。
必须输出 JSON 对象，格式示例：{"ids":["hao-ye","xiao-si"]}
规则：
1. 只能使用目录里已有的 id，禁止编造 id 或 URL。
2. 最多返回 ${maxResults} 个 id，按相关度排序。
3. 若都不合适，返回 {"ids":[]}。
4. 只输出 JSON，不要其他文字。`;

	const user = `用户输入：${query}\n目录：${JSON.stringify(catalog)}`;

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

	try {
		const res = await fetch(`${env.baseUrl}/chat/completions`, {
			method: "POST",
			signal: controller.signal,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${env.apiKey}`,
			},
			body: JSON.stringify({
				model: env.model,
				messages: [
					{ role: "system", content: system },
					{ role: "user", content: user },
				],
				stream: false,
				// 官网：thinking 默认 enabled；联想场景关思考降延迟
				// https://api-docs.deepseek.com/guides/thinking_mode
				thinking: { type: "disabled" },
				response_format: { type: "json_object" },
				max_tokens: 256,
				temperature: 0.2,
			}),
		});

		if (!res.ok) {
			console.warn("[sticker-suggest] DeepSeek HTTP", res.status);
			return { items: [], entryIds: [] };
		}

		const payload = (await res.json()) as {
			choices?: Array<{ message?: { content?: string | null } }>;
		};
		const content = payload.choices?.[0]?.message?.content;
		if (!content) return { items: [], entryIds: [] };

		const ids = parseIds(content).slice(0, maxResults);
		const entries = ids
			.map((id) => getEntryById(id))
			.filter((e): e is NonNullable<typeof e> => !!e);
		return {
			entryIds: entries.map((e) => e.id),
			items: entriesToItems(entries, maxResults),
		};
	} catch (error) {
		const name = error instanceof Error ? error.name : "";
		if (name !== "AbortError") {
			console.warn("[sticker-suggest] DeepSeek error", error);
		}
		return { items: [], entryIds: [] };
	} finally {
		clearTimeout(timer);
	}
}

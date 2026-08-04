/** 会话级查询缓存 */ // 中文注释：同词不重复打 API

import type { SuggestResponse } from "@/lib/sticker-suggest/types";

const cache = new Map<string, SuggestResponse>();

export function getCachedSuggest(key: string): SuggestResponse | undefined {
	return cache.get(key);
}

export function setCachedSuggest(key: string, value: SuggestResponse): void {
	if (cache.size > 80) {
		const first = cache.keys().next().value;
		if (first !== undefined) cache.delete(first);
	}
	cache.set(key, value);
}

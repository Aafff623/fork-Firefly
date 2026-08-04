/** P1 运行时写回：进程内别名 → 词条 id */ // 中文注释：不写 Git；冷启动会丢

import { getEntryById, entriesToItems } from "./l1-lexicon";
import { normalizeQuery } from "./normalize";
import type { SuggestItem } from "./types";

const runtimeAliases = new Map<string, string[]>();

export function mergeWriteback(query: string, entryIds: string[]): void {
	const key = normalizeQuery(query);
	if (!key || !entryIds.length) return;
	const valid = entryIds.filter((id) => !!getEntryById(id));
	if (!valid.length) return;
	const prev = runtimeAliases.get(key) ?? [];
	const merged = [...new Set([...valid, ...prev])];
	runtimeAliases.set(key, merged);
}

export function lookupWriteback(
	rawQuery: string,
	maxResults: number,
): SuggestItem[] {
	const key = normalizeQuery(rawQuery);
	if (!key) return [];
	const ids = runtimeAliases.get(key);
	if (!ids?.length) return [];
	const entries = ids
		.map((id) => getEntryById(id))
		.filter((e): e is NonNullable<typeof e> => !!e);
	return entriesToItems(entries, maxResults);
}

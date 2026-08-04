/** L1 词表加载与查找 */ // 中文注释：仓内 JSON + 进程内索引

import lexiconJson from "@/data/sticker-lexicon/zh-meme.json";
import { normalizeQuery } from "./normalize";
import type { LexiconEntry, LexiconFile, SuggestItem } from "./types";

const file = lexiconJson as LexiconFile;

/** keyword(normalized) → entries */ // 中文注释：倒排索引
let index: Map<string, LexiconEntry[]> | null = null;

function buildIndex(): Map<string, LexiconEntry[]> {
	const map = new Map<string, LexiconEntry[]>();
	for (const entry of file.entries) {
		if (!entry.enabled) continue;
		for (const kw of entry.keywords) {
			const key = normalizeQuery(kw);
			if (!key) continue;
			const list = map.get(key) ?? [];
			if (!list.some((e) => e.id === entry.id)) list.push(entry);
			map.set(key, list);
		}
	}
	return map;
}

function getIndex(): Map<string, LexiconEntry[]> {
	if (!index) index = buildIndex();
	return index;
}

function toItem(entry: LexiconEntry): SuggestItem {
	return {
		id: entry.id,
		title: entry.title,
		src: entry.src,
		preview: entry.preview || entry.src,
	};
}

/** 供 Agent 选图：只暴露 id/title/keywords，不让模型发明 URL */ // 中文注释
export function listCatalogForAgent(): Array<{
	id: string;
	title: string;
	keywords: string[];
}> {
	return file.entries
		.filter((e) => e.enabled)
		.map((e) => ({
			id: e.id,
			title: e.title,
			keywords: e.keywords,
		}));
}

export function getEntryById(id: string): LexiconEntry | undefined {
	return file.entries.find((e) => e.enabled && e.id === id);
}

export function entriesToItems(
	entries: LexiconEntry[],
	maxResults: number,
): SuggestItem[] {
	return entries.slice(0, maxResults).map(toItem);
}

/**
 * 精确命中优先；否则尝试「查询以 keyword 结尾」的最长 keyword。
 */ // 中文注释：覆盖「哈哈好耶」类尾部热梗
export function lookupLexicon(
	rawQuery: string,
	maxResults: number,
): SuggestItem[] {
	const q = normalizeQuery(rawQuery);
	if (!q) return [];

	const map = getIndex();
	const exact = map.get(q);
	if (exact?.length) {
		return exact.slice(0, maxResults).map(toItem);
	}

	let bestKey = "";
	let bestEntries: LexiconEntry[] = [];
	for (const [key, entries] of map) {
		if (key.length < 2) continue;
		if (!q.endsWith(key)) continue;
		if (key.length > bestKey.length) {
			bestKey = key;
			bestEntries = entries;
		}
	}
	return bestEntries.slice(0, maxResults).map(toItem);
}

export function lexiconStats(): { entryCount: number; keywordCount: number } {
	const map = getIndex();
	return {
		entryCount: file.entries.filter((e) => e.enabled).length,
		keywordCount: map.size,
	};
}

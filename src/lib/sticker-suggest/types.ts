/** 梗图联想 · 共享类型（客户端 / 服务端） */ // 中文注释：API 与浮层共用契约

export type SuggestSource = "l1" | "agent" | "none";

export type SuggestItem = {
	id: string;
	title: string;
	src: string;
	preview?: string;
};

export type SuggestResponse = {
	source: SuggestSource;
	items: SuggestItem[];
	latencyMs?: number;
};

export type LexiconEntry = {
	id: string;
	keywords: string[];
	title: string;
	src: string;
	preview?: string;
	license: "self" | "curated";
	enabled: boolean;
};

export type LexiconFile = {
	version: number;
	updatedAt?: string;
	entries: LexiconEntry[];
};

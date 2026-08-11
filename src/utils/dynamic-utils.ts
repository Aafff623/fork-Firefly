import type { CollectionEntry } from "astro:content";

/** 只有两类：笔记（发文联动）· 动态（主动碎碎念）；多图只是展示形态，不当分类 */
export type DynamicKind = "note" | "status";

/** 对齐 shadcn-timeline 节点气质（博客 kind → rail class） */
export type DynamicRailStatus = "completed" | "in-progress" | "pending";

export const DYNAMIC_KIND_LABEL: Record<DynamicKind, string> = {
	note: "笔记",
	status: "动态",
};

export type DynamicRailMeta = {
	statusClass: DynamicRailStatus;
	label: string;
};

/** kind → shadcn rail 视觉：note≈completed · status≈pending */
export const dynamicKindToRail = (kind: DynamicKind): DynamicRailMeta => {
	if (kind === "note") {
		return { statusClass: "completed", label: DYNAMIC_KIND_LABEL.note };
	}
	return { statusClass: "pending", label: DYNAMIC_KIND_LABEL.status };
};

/**
 * 客户端启发式（不改 schema）：
 * - note：发文级联「发布了新笔记」或正文链到 /posts/
 * - status：其余（含多图吐槽；多图仍走缩略网格，只是不算「图集」类）
 */
export const detectDynamicKind = (
	html: string,
	_imageCount = 0,
): DynamicKind => {
	const safeHtml = html || "";
	if (/发布了新笔记/.test(safeHtml) || /\/posts\//.test(safeHtml)) {
		return "note";
	}
	return "status";
};

/** 供连续笔记折叠：至少要有 html（+ 可选 images 供 kind 启发式） */
export type DynamicNoteGroupable = {
	html: string;
	images?: Array<{ alt?: string; src: string; title?: string }>;
};

export type NoteTimelineRow<T extends DynamicNoteGroupable> =
	| { type: "single"; entry: T; kind: DynamicKind }
	| { type: "note-run"; head: T; folded: T[] };

/**
 * 「全部」筛选下把连续 note 收成 run：首条 head，后续进 folded。
 * enable=false 时一对一 single（不折叠）。
 */
export const groupConsecutiveNotes = <T extends DynamicNoteGroupable>(
	entries: T[],
	enable: boolean,
): NoteTimelineRow<T>[] => {
	if (!enable) {
		return entries.map((entry) => ({
			type: "single" as const,
			entry,
			kind: detectDynamicKind(entry.html, entry.images?.length ?? 0),
		}));
	}
	const rows: NoteTimelineRow<T>[] = [];
	for (const entry of entries) {
		const kind = detectDynamicKind(entry.html, entry.images?.length ?? 0);
		const last = rows[rows.length - 1];
		if (kind === "note" && last?.type === "note-run") {
			last.folded.push(entry);
			continue;
		}
		if (kind === "note") {
			rows.push({ type: "note-run", head: entry, folded: [] });
			continue;
		}
		rows.push({ type: "single", entry, kind });
	}
	return rows;
};

/** 时间线/导航用短标题（去 HTML） */
export const dynamicEntryTitle = (html: string, searchText: string): string => {
	const text = (html || "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (text) return text.slice(0, 64);
	const fallback = (searchText || "").trim();
	return fallback ? fallback.slice(0, 64) : "动态";
};

/** 折叠行展示：去掉「发布了新笔记」前缀 */
export const dynamicNoteFoldTitle = (
	html: string,
	searchText: string,
): string => {
	const raw = dynamicEntryTitle(html, searchText).replace(
		/^发布了新笔记[：:]\s*/,
		"",
	);
	return raw || "笔记";
};

export const sortDynamics = (
	entries: CollectionEntry<"dynamic">[],
): CollectionEntry<"dynamic">[] =>
	entries.sort((a, b) => {
		// 置顶优先，然后按发布时间降序
		if (a.data.pinned && !b.data.pinned) return -1;
		if (!a.data.pinned && b.data.pinned) return 1;
		return b.data.published.getTime() - a.data.published.getTime();
	});

export const dynamicSlug = (id: string): string =>
	id.replace(/\.(md|mdx)$/i, "");

export const dynamicAnchor = (id: string): string =>
	`dynamic-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

export const dynamicPlainText = (entry: CollectionEntry<"dynamic">): string =>
	(entry.body || "")
		.replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/[#>*_`~[\]()-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();

export const dynamicSearchText = (entry: CollectionEntry<"dynamic">): string =>
	[dynamicPlainText(entry), entry.data.location]
		.filter(Boolean)
		.join(" ")
		.toLocaleLowerCase();

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

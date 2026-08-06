import type { CollectionEntry } from "astro:content";

export type DynamicKind = "gallery" | "note" | "status";

/** 对齐 shadcn-timeline 节点气质（博客 kind → rail class） */
export type DynamicRailStatus = "completed" | "in-progress" | "pending";

export const DYNAMIC_KIND_LABEL: Record<DynamicKind, string> = {
	gallery: "图集",
	note: "笔记",
	status: "动态",
};

export type DynamicRailMeta = {
	statusClass: DynamicRailStatus;
	label: string;
};

/** kind → shadcn rail 视觉：note≈completed · gallery≈in-progress · status≈pending */
export const dynamicKindToRail = (kind: DynamicKind): DynamicRailMeta => {
	switch (kind) {
		case "note":
			return { statusClass: "completed", label: DYNAMIC_KIND_LABEL.note };
		case "gallery":
			return {
				statusClass: "in-progress",
				label: DYNAMIC_KIND_LABEL.gallery,
			};
		default:
			return { statusClass: "pending", label: DYNAMIC_KIND_LABEL.status };
	}
};

/** 客户端启发式：图集 / 笔记 / 动态（不改 schema） */
export const detectDynamicKind = (
	html: string,
	imageCount = 0,
): DynamicKind => {
	const safeHtml = html || "";
	if (
		imageCount > 1 ||
		/\bdynamic-gallery\b/i.test(safeHtml) ||
		(safeHtml.match(/<img\b/gi) || []).length > 1
	) {
		return "gallery";
	}
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

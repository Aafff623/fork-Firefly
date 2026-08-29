import { getCollection } from "astro:content";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { dynamicConfig } from "@/config";
import {
	dynamicSearchText,
	dynamicSlug,
	sortDynamics,
} from "@/utils/dynamic-utils";

const markdownImagePattern = /!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)/g;
const defaultLocation = (
	dynamicConfig.location?.home ||
	dynamicConfig.defaultLocation ||
	""
).trim();

/** 系统动态标记：site-cascade 发文级联生成的「发布了新笔记：…」前缀 */
export const SYSTEM_NOTE_PREFIX = "发布了新笔记：";

export const isSystemNoteHtml = (html: string): boolean =>
	(html || "").includes(SYSTEM_NOTE_PREFIX);

export type DynamicEntryJson = {
	id: string;
	published: number;
	html: string;
	images: Array<{ alt: string; src: string; title?: string }>;
	searchText: string;
	pinned?: boolean;
	location?: string;
	/** 发布者 agent key（如 claude-code）；缺省为园主 */
	author?: string;
};

function resolveDynamicImageSrc(src: string, entryId: string): string {
	const raw = src.trim();
	if (!raw || /^https?:\/\//i.test(raw) || raw.startsWith("/")) return raw;
	const clean = raw.replace(/^\.\//, "");
	return `/assets/dynamic/${entryId}/${clean}`;
}

/** 供 /api/dynamic.json 与 /dynamic/ SSR 共用 */
export async function loadDynamicEntries(): Promise<DynamicEntryJson[]> {
	const processor = await createMarkdownProcessor();
	let dynamics = sortDynamics(await getCollection("dynamic"));
	// 系统动态过滤：默认只留真实动态（园主手写 / Agent 发布）
	if (dynamicConfig.includeSystemNotes !== true) {
		dynamics = dynamics.filter(
			(entry) => !isSystemNoteHtml(entry.body || ""),
		);
	}
	return Promise.all(
		dynamics.map(async (entry) => {
			const images: Array<{ alt: string; src: string; title?: string }> = [];
			const entryId = dynamicSlug(entry.id);
			const markdown = (entry.body || "").replace(
				markdownImagePattern,
				(_match: string, alt: string, src: string, title?: string) => {
					images.push({
						alt,
						src: resolveDynamicImageSrc(src, entryId),
						...(title ? { title } : {}),
					});
					return "";
				},
			);
			const rendered = await processor.render(markdown);
			const location = entry.data.location.trim() || defaultLocation;
			const author = (entry.data.author || "").trim();

			return {
				id: entryId,
				published: entry.data.published.getTime(),
				html: rendered.code,
				images,
				searchText: dynamicSearchText(entry),
				pinned: entry.data.pinned || false,
				location,
				...(author ? { author } : {}),
			};
		}),
	);
}

export function dynamicEntryNavTitle(
	html: string,
	searchText: string,
): string {
	const text = (html || "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (text) return text.slice(0, 64);
	const fallback = (searchText || "").trim();
	return fallback ? fallback.slice(0, 64) : "动态";
}

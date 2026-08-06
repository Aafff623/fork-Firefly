import { getCollection } from "astro:content";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { dynamicConfig } from "@/config";
import {
	dynamicSearchText,
	dynamicSlug,
	sortDynamics,
} from "@/utils/dynamic-utils";

const markdownImagePattern = /!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)/g;
const defaultLocation = (dynamicConfig.defaultLocation || "").trim();

function resolveDynamicImageSrc(src: string, entryId: string): string {
	const raw = src.trim();
	if (!raw || /^https?:\/\//i.test(raw) || raw.startsWith("/")) return raw;
	// 相对路径约定落到 public/assets/dynamic/<entryId>/…
	const clean = raw.replace(/^\.\//, "");
	return `/assets/dynamic/${entryId}/${clean}`;
}

export async function GET(): Promise<Response> {
	const processor = await createMarkdownProcessor();
	const dynamics = sortDynamics(await getCollection("dynamic"));
	const data = await Promise.all(
		dynamics.map(async (entry) => {
			const images: Array<{ alt: string; src: string; title?: string }> = [];
			const entryId = dynamicSlug(entry.id);
			const markdown = (entry.body || "").replace(
				markdownImagePattern,
				(_match, alt: string, src: string, title?: string) => {
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

			return {
				id: entryId,
				published: entry.data.published.getTime(),
				html: rendered.code,
				images,
				searchText: dynamicSearchText(entry),
				pinned: entry.data.pinned || false,
				location,
			};
		}),
	);

	return new Response(JSON.stringify(data), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	});
}

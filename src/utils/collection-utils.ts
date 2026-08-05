import { type CollectionEntry, getCollection } from "astro:content";
import { collectionsConfig } from "@/config";
import { getEffectivePostTime } from "@utils/content-utils";
import { url } from "@utils/url-utils";

export type CollectionEntryWithMeta = {
	meta: (typeof collectionsConfig)["items"][number];
	url: string;
	posts: CollectionEntry<"posts">[];
};

/** 合集 URL（仿 getCategoryUrl：/collections/{slug}/） */
export function getCollectionUrl(slug: string): string {
	return url(`/collections/${encodeURIComponent(slug)}/`);
}

function compareByEffectiveTimeDesc(
	a: CollectionEntry<"posts">,
	b: CollectionEntry<"posts">,
): number {
	return getEffectivePostTime(b.data) - getEffectivePostTime(a.data);
}

/**
 * 全部合集（按配置数组顺序），每合集聚合文章列表：
 * 过滤 draft（PROD）、按有效时间（updated ?? published）倒序。
 */
export async function getCollections(): Promise<CollectionEntryWithMeta[]> {
	const allPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	return collectionsConfig.items.map((meta) => {
		const posts = allPosts
			.filter((post) => (post.data.collections ?? []).includes(meta.slug))
			.sort(compareByEffectiveTimeDesc);
		return { meta, url: getCollectionUrl(meta.slug), posts };
	});
}

/** 按 slug 取单个合集；未登记返回 null（详情页用于 404 守卫） */
export async function getCollectionBySlug(
	slug: string,
): Promise<CollectionEntryWithMeta | null> {
	const meta = collectionsConfig.items.find((c) => c.slug === slug);
	if (!meta) return null;
	const all = await getCollections();
	return all.find((c) => c.meta.slug === slug) ?? null;
}

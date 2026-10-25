import type { CollectionEntry } from "astro:content";
import { url } from "@utils/url-utils";
import { collectionsConfig } from "@/config";
import { ArticleCollectionError } from "@/lib/article-index";
import { loadArticleIndex } from "@/lib/article-index-loader";
import type { CollectionMeta } from "@/types/collectionsConfig";

export type CollectionEntryWithMeta = {
	meta: CollectionMeta;
	url: string;
	posts: CollectionEntry<"posts">[];
	/** 二级子合集（仅一级且配置了 children 时有值） */
	children: CollectionEntryWithMeta[];
};

/** 合集 URL（仿 getCategoryUrl：/collections/{slug}/） */
export function getCollectionUrl(slug: string): string {
	return url(`/collections/${encodeURIComponent(slug)}/`);
}

/**
 * 全部合集（含二级；按配置数组顺序）。
 * 一级的 `posts` = 自身 frontmatter 命中 ∪ 所有后代合集文章去重（索引负责）。
 * 未知合集 slug 或缺少父夹直接抛错，不再静默少卡。
 */
export async function getCollections(): Promise<CollectionEntryWithMeta[]> {
	const index = await loadArticleIndex();
	const bySlug = new Map<string, CollectionEntryWithMeta>();

	for (const meta of collectionsConfig.items) {
		const posts: CollectionEntry<"posts">[] = [];
		for (const card of index.collection(meta.slug)) {
			const entry = index.entry(card.id);
			if (entry) posts.push(entry);
		}
		bySlug.set(meta.slug, {
			meta,
			url: getCollectionUrl(meta.slug),
			posts,
			children: [],
		});
	}

	for (const entry of bySlug.values()) {
		const parentSlug = entry.meta.parent;
		if (!parentSlug) continue;
		const parent = bySlug.get(parentSlug);
		if (!parent) {
			throw new ArticleCollectionError(
				`collection "${entry.meta.slug}" references unknown parent "${parentSlug}"`,
				entry.meta.slug,
			);
		}
		parent.children.push(entry);
	}

	return collectionsConfig.items
		.map((meta) => bySlug.get(meta.slug))
		.filter((c): c is CollectionEntryWithMeta => c != null);
}

/** 总览页只用一级合集（无 parent）。空频道也出卡，方便先立牌子再填文。 */
export async function getTopLevelCollections(): Promise<
	CollectionEntryWithMeta[]
> {
	const all = await getCollections();
	return all.filter((c) => !c.meta.parent);
}

/** 按 slug 取单个合集；未登记返回 null（详情页用于 404 守卫） */
export async function getCollectionBySlug(
	slug: string,
): Promise<CollectionEntryWithMeta | null> {
	const all = await getCollections();
	return all.find((c) => c.meta.slug === slug) ?? null;
}

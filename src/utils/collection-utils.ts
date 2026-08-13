import { type CollectionEntry, getCollection } from "astro:content";
import { collectionsConfig } from "@/config";
import type { CollectionMeta } from "@/types/collectionsConfig";
import { getEffectivePostTime } from "@utils/content-utils";
import { url } from "@utils/url-utils";

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

function compareByEffectiveTimeDesc(
	a: CollectionEntry<"posts">,
	b: CollectionEntry<"posts">,
): number {
	return getEffectivePostTime(b.data) - getEffectivePostTime(a.data);
}

function postsForSlug(
	allPosts: CollectionEntry<"posts">[],
	slug: string,
): CollectionEntry<"posts">[] {
	return allPosts
		.filter((post) => (post.data.collections ?? []).includes(slug))
		.sort(compareByEffectiveTimeDesc);
}

/** 子合集文章去重合并（一级合集聚合用） */
function mergeUniquePosts(
	groups: CollectionEntry<"posts">[][],
): CollectionEntry<"posts">[] {
	const seen = new Set<string>();
	const out: CollectionEntry<"posts">[] = [];
	for (const group of groups) {
		for (const post of group) {
			if (seen.has(post.id)) continue;
			seen.add(post.id);
			out.push(post);
		}
	}
	return out.sort(compareByEffectiveTimeDesc);
}

/**
 * 全部合集（含二级；按配置数组顺序）。
 * 一级的 `posts` = 自身 frontmatter 命中 ∪ 子合集文章去重。
 */
export async function getCollections(): Promise<CollectionEntryWithMeta[]> {
	const allPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const bySlug = new Map<string, CollectionEntryWithMeta>();

	for (const meta of collectionsConfig.items) {
		bySlug.set(meta.slug, {
			meta,
			url: getCollectionUrl(meta.slug),
			posts: postsForSlug(allPosts, meta.slug),
			children: [],
		});
	}

	for (const entry of bySlug.values()) {
		const parentSlug = entry.meta.parent;
		if (!parentSlug) continue;
		const parent = bySlug.get(parentSlug);
		if (!parent) continue;
		parent.children.push(entry);
	}

	for (const entry of bySlug.values()) {
		if (entry.children.length === 0) continue;
		entry.posts = mergeUniquePosts([
			entry.posts,
			...entry.children.map((c) => c.posts),
		]);
	}

	return collectionsConfig.items
		.map((meta) => bySlug.get(meta.slug))
		.filter((c): c is CollectionEntryWithMeta => c != null);
}

/** 总览页只用一级合集（无 parent）；0 篇不出卡，配置项保留 */
export async function getTopLevelCollections(): Promise<
	CollectionEntryWithMeta[]
> {
	const all = await getCollections();
	return all.filter((c) => !c.meta.parent && c.posts.length > 0);
}

/** 按 slug 取单个合集；未登记返回 null（详情页用于 404 守卫） */
export async function getCollectionBySlug(
	slug: string,
): Promise<CollectionEntryWithMeta | null> {
	const all = await getCollections();
	return all.find((c) => c.meta.slug === slug) ?? null;
}

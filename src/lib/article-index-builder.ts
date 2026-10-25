/**
 * 构建期卡片构造：需要 reading-time 与文章正文，只给 loader / 服务端路由用。
 * 纯排序与打分在 `article-index.ts`，客户端搜索只引那边，避免把摘要逻辑带进 bundle。
 */
import { getPostListSummary } from "@utils/post-list-summary";
import {
	type ArticleCard,
	type ArticlePostInput,
	articleSlugFromId,
	articleTimeToMillis,
	DEFAULT_EXCERPT_LENGTH,
	getAutoPinnedId,
	isArticleVisible,
	isThemeDemoPost,
	truncateSummary,
} from "./article-index";

export type BuildArticleCardsOptions = {
	/** 生产 false：草稿不进索引；本地 DEV true：草稿可预览 */
	includeDrafts?: boolean;
};

export function buildArticleCards(
	posts: readonly ArticlePostInput[],
	options: BuildArticleCardsOptions = {},
): ArticleCard[] {
	const includeDrafts = options.includeDrafts ?? false;
	const visible = posts.filter(
		(post) =>
			!isThemeDemoPost(post.filePath) &&
			isArticleVisible(post.data.draft, { includeDrafts }),
	);

	const tagFrequency = new Map<string, number>();
	for (const post of visible) {
		for (const tag of normalizeTags(post.data.tags)) {
			const key = tag.toLocaleLowerCase();
			tagFrequency.set(key, (tagFrequency.get(key) ?? 0) + 1);
		}
	}

	const autoPinnedId = getAutoPinnedId(
		visible.map((post) => ({
			id: post.id,
			published: post.data.published,
			updated: post.data.updated,
			pinned: post.data.pinned,
			draft: post.data.draft,
		})),
		{ includeDrafts },
	);

	return visible.map((post) => {
		const data = post.data;
		const description = (data.description ?? "").trim();
		const summaryInfo = getPostListSummary(post.body, description);
		const tags = normalizeTags(data.tags);
		const heat = tags.reduce(
			(sum, tag) => sum + (tagFrequency.get(tag.toLocaleLowerCase()) ?? 0),
			0,
		);
		const pinKind = data.pinned
			? "sticky"
			: autoPinnedId === post.id
				? "auto"
				: null;

		return {
			id: post.id,
			slug: articleSlugFromId(post.id),
			title: (data.title ?? "").trim(),
			description,
			published: articleTimeToMillis(data.published) ?? 0,
			updated: articleTimeToMillis(data.updated),
			category: (data.category ?? "").trim(),
			tags,
			themeTags: normalizeTags(data.themeTags),
			pinned: data.pinned === true,
			draft: data.draft === true,
			password: Boolean(data.password),
			collections: normalizeTags(data.collections),
			summary: truncateSummary(summaryInfo.description),
			excerpt: (post.body ?? "").slice(0, DEFAULT_EXCERPT_LENGTH).trim(),
			words: summaryInfo.words,
			minutes: summaryInfo.minutes,
			pinKind,
			heat,
		};
	});
}

function normalizeTags(values: readonly string[] | null | undefined): string[] {
	if (!values) return [];
	const seen = new Set<string>();
	const tags: string[] = [];
	for (const value of values) {
		const tag = value.trim();
		if (!tag || seen.has(tag)) continue;
		seen.add(tag);
		tags.push(tag);
	}
	return tags;
}

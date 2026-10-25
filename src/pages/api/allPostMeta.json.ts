import { loadArticleIndex } from "@/lib/article-index-loader";

export async function GET(): Promise<Response> {
	const index = await loadArticleIndex();

	const allPostsData = index
		.list()
		.map((card) => ({
			id: card.id,
			title: card.title,
			description: card.description,
			published: card.published,
			updated: card.updated,
			category: card.category,
			tags: card.tags,
			themeTags: card.themeTags,
			password: card.password,
			pinned: card.pinned,
			// 热度由索引统一计算，不再在这里复制一套 topicHeat 规则
			topicHeat: card.heat,
		}))
		// 日历按纯日期排序，忽略置顶
		.sort((a, b) => b.published - a.published);

	return new Response(JSON.stringify(allPostsData));
}

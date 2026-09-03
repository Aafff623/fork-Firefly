import { getSortedPosts } from "@/utils/content-utils";

export async function GET(): Promise<Response> {
	const posts = await getSortedPosts();

	const tagCorpusFreq = new Map<string, number>();
	for (const post of posts) {
		for (const t of post.data.tags || []) {
			const key = t.trim().toLowerCase();
			if (!key) continue;
			tagCorpusFreq.set(key, (tagCorpusFreq.get(key) || 0) + 1);
		}
	}

	const allPostsData = posts
		.map((post) => {
			const tags = (post.data.tags || []).map((t) => t.trim()).filter(Boolean);
			let topicHeat = 0;
			for (const t of tags) {
				topicHeat += tagCorpusFreq.get(t.toLowerCase()) || 0;
			}
			return {
				id: post.id,
				title: post.data.title,
				description: post.data.description,
				published: post.data.published.getTime(),
				updated: post.data.updated?.getTime() ?? null,
				category: post.data.category || "",
				tags,
				themeTags: (post.data.themeTags || [])
					.map((t) => t.trim())
					.filter(Boolean),
				password: !!post.data.password,
				pinned: !!post.data.pinned,
				topicHeat,
			};
		})
		// 日历按纯日期排序，忽略置顶
		.sort((a, b) => b.published - a.published);

	return new Response(JSON.stringify(allPostsData));
}

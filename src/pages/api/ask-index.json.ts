import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getEffectivePostTime } from "@utils/content-utils";
import { stripMd } from "@/utils/ask-retrieve";

/**
 * /ask 与 AI 搜索的运行时文章索引（构建期预渲染为静态 JSON）。
 * 由来：此前 /api/ask（getCollection）与 /api/search/ai（getSortedPosts）
 * 在运行时读全量内容层，把 ~42MB 数据打进 Worker 服务端包，超出
 * Cloudflare Workers 免费档 64MiB 上限；改为构建期生成本索引，
 * 运行时 fetch 本端点即可，服务端包不再携带内容层。
 * 字段覆盖两个消费方的全部需求（排序按有效时间倒序）。
 * 正文截断 800 字符：标题/摘要/标签仍是主计分信号，正文仅作补充召回。
 */
export const prerender = true;

export const GET: APIRoute = async () => {
	const posts = await getCollection("posts", ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	);
	const items = posts
		.map((p) => ({
			slug: p.id,
			title: p.data.title || "",
			desc: (p.data.description || "").trim(),
			/** tags/themeTags 分开保留（AI 搜索需要） */
			tags: (p.data.tags || []).map((t) => t.trim()).filter(Boolean),
			themeTags: (p.data.themeTags || [])
				.map((t) => t.trim())
				.filter(Boolean),
			category: p.data.category || "",
			/** epoch ms；updated 缺省为 null */
			published: p.data.published?.getTime?.() ?? 0,
			updated: p.data.updated?.getTime?.() ?? null,
			/** 有效时间（updated ?? published） */
			time: getEffectivePostTime(p.data),
			password: !!p.data.password,
			pinned: !!p.data.pinned,
			excerpt: stripMd(typeof p.body === "string" ? p.body : "").slice(0, 800),
		}))
		.sort((a, b) => b.time - a.time);

	return new Response(JSON.stringify(items), {
		headers: { "Content-Type": "application/json; charset=utf-8" },
	});
};

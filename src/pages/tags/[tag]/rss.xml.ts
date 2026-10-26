/**
 * 每标签 RSS：/tags/<slug>/rss.xml
 * 与站级 /rss.xml 共用 @utils/rss-feed 的条目构建（contentMode / sanitize / 密码占位一致）。
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { siteConfig } from "@/config";
import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
import { getSortedPosts, getTagList } from "@/utils/content-utils";
import { createRssResponse } from "@/utils/rss-feed";
import { collectTagGroups, normalizeTagSlug } from "@/utils/tag-slug";
import { url } from "@/utils/url-utils";

export const getStaticPaths: GetStaticPaths = async () => {
	const [tagList, posts] = await Promise.all([getTagList(), getSortedPosts()]);
	return collectTagGroups(
		tagList,
		posts.map((post) => ({ tags: post.data.tags })),
	).map((group) => ({
		params: { tag: group.slug },
		props: { tagName: group.name },
	}));
};

export const prerender = true;

export const GET: APIRoute = async (context) => {
	const tagSlug = context.params.tag ?? "";
	const tagName =
		typeof context.props.tagName === "string" ? context.props.tagName : tagSlug;
	const posts = (await getSortedPosts()).filter((post) =>
		post.data.tags.some((tag) => normalizeTagSlug(tag) === tagSlug),
	);
	// 频道 link 指向标签静态页（条目 link 仍是绝对路径，不受影响）
	const tagPageUrl = new URL(
		url(`/tags/${tagSlug}/`),
		context.site ?? siteConfig.site_url,
	);

	return createRssResponse({
		title: `${tagName} · ${siteConfig.title}`,
		description: `${i18n(I18nKey.tags)} · ${tagName}`,
		site: tagPageUrl,
		posts,
	});
};

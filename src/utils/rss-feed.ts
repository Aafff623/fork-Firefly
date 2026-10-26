import { loadRenderers } from "astro:container";
import { type CollectionEntry, render } from "astro:content";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx/container-renderer";
import rss, { type RSSFeedItem } from "@astrojs/rss";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { formatDateI18nWithTime } from "@utils/date-utils";
import { url } from "@utils/url-utils";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";
import pkg from "../../package.json";

/**
 * 每标签 RSS 订阅入口开关（默认开）。
 * 关闭时只隐藏标签静态页上的入口，`/tags/<tag>/rss.xml` 端点仍保留，
 * 已订阅的读者不会断。
 */
export const TAG_RSS_ENABLED: boolean = true;

export type RssFeedOptions = {
	title: string;
	description: string;
	site: string | URL;
	posts: readonly CollectionEntry<"posts">[];
};

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

/**
 * RSS 条目构建唯一实现：站级 `/rss.xml` 与每标签 `/tags/<tag>/rss.xml` 共用。
 * `siteConfig.feed.contentMode === "summary"` 时不初始化 MDX 容器，只出摘要 + 链接；
 * 密码文章的占位文案保持原样。
 */
async function buildFeedItems(
	posts: readonly CollectionEntry<"posts">[],
): Promise<RSSFeedItem[]> {
	const includeContent = (siteConfig.feed?.contentMode ?? "full") === "full";
	const container = includeContent
		? await AstroContainer.create({
				renderers: await loadRenderers([getMDXRenderer()]),
			})
		: null;
	const feedItems: RSSFeedItem[] = [];
	for (const post of posts) {
		if (!container) {
			feedItems.push({
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link: url(`/posts/${post.id}/`),
			});
			continue;
		}
		if (post.data.password) {
			feedItems.push({
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link: url(`/posts/${post.id}/`),
				content: i18n(I18nKey.passwordProtectedRss),
			});
			continue;
		}
		const { Content } = await render(post);
		const rawContent = await container.renderToString(Content);
		const cleanedContent = stripInvalidXmlChars(rawContent);
		feedItems.push({
			title: post.data.title,
			pubDate: post.data.published,
			description: post.data.description || "",
			link: url(`/posts/${post.id}/`),
			content: sanitizeHtml(cleanedContent, {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
			}),
		});
	}
	return feedItems;
}

function buildCustomData(): string {
	return `<templateTheme>Firefly</templateTheme>
		<templateThemeVersion>${pkg.version}</templateThemeVersion>
		<templateThemeUrl>https://github.com/CuteLeaf/Firefly</templateThemeUrl>
		<lastBuildDate>${formatDateI18nWithTime(new Date())}</lastBuildDate>`;
}

/** 生成 RSS Response；调用方只负责标题、描述、站点与文章集合。 */
export async function createRssResponse(
	options: RssFeedOptions,
): Promise<Response> {
	const items = await buildFeedItems(options.posts);
	return rss({
		title: options.title,
		description: options.description,
		site: options.site,
		customData: buildCustomData(),
		items,
	});
}

import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getSortedPosts } from "@utils/content-utils";
import { getPostUrlBySlug, url } from "@utils/url-utils";
import type { APIRoute } from "astro";
import { siteConfig } from "@/config";

export const prerender = true;

const RECENT_POSTS_COUNT = 20;

type KeyPage = {
	labelKey: I18nKey;
	path: string;
	descKey?: I18nKey;
	/** 关联 siteConfig.pages 开关；未设置表示常驻页面 */
	pageKey?: keyof typeof siteConfig.pages;
};

// 首页 / 归档 / 关于常驻；其余页面跟随 siteConfig.pages 的开关（关掉的页面线上是 404，不写进索引）
const KEY_PAGES: KeyPage[] = [
	{ labelKey: I18nKey.home, path: "/" },
	{ labelKey: I18nKey.archive, path: "/archive/" },
	{ labelKey: I18nKey.about, path: "/about/" },
	{
		labelKey: I18nKey.friends,
		path: "/friends/",
		descKey: I18nKey.friendsDescription,
		pageKey: "friends",
	},
	{
		labelKey: I18nKey.guestbook,
		path: "/guestbook/",
		descKey: I18nKey.guestbookDescription,
		pageKey: "guestbook",
	},
	{
		labelKey: I18nKey.dynamic,
		path: "/dynamic/",
		descKey: I18nKey.dynamicDescription,
		pageKey: "dynamic",
	},
	{
		labelKey: I18nKey.gallery,
		path: "/gallery/",
		descKey: I18nKey.galleryDescription,
		pageKey: "gallery",
	},
	{
		labelKey: I18nKey.navSites,
		path: "/nav/",
		descKey: I18nKey.navSitesDescription,
		pageKey: "navSites",
	},
	{
		labelKey: I18nKey.agents,
		path: "/agents/",
		descKey: I18nKey.agentsDescription,
		pageKey: "agents",
	},
	{
		labelKey: I18nKey.bangumi,
		path: "/bangumi/",
		descKey: I18nKey.bangumiSubtitle,
		pageKey: "bangumi",
	},
	{
		labelKey: I18nKey.sponsor,
		path: "/sponsor/",
		descKey: I18nKey.sponsorDescription,
		pageKey: "sponsor",
	},
];

export const GET: APIRoute = async ({ site }) => {
	const base = site ?? new URL(siteConfig.site_url);
	const absolute = (path: string) => new URL(url(path), base).href;

	const enabledPages = KEY_PAGES.filter(
		(page) => !page.pageKey || siteConfig.pages[page.pageKey] !== false,
	);
	const posts = await getSortedPosts();

	const lines: string[] = [
		`# ${siteConfig.title}`,
		`> ${siteConfig.description || siteConfig.subtitle || ""}`,
		"",
		"## Key Pages",
	];
	for (const page of enabledPages) {
		const label = i18n(page.labelKey);
		const link = absolute(page.path);
		const desc = page.descKey ? i18n(page.descKey) : "";
		lines.push(
			desc ? `- [${label}](${link}): ${desc}` : `- [${label}](${link})`,
		);
	}

	lines.push("", "## Recent Posts");
	for (const post of posts.slice(0, RECENT_POSTS_COUNT)) {
		const link = new URL(getPostUrlBySlug(post.id), base).href;
		const desc = post.data.description || "";
		lines.push(
			desc
				? `- [${post.data.title}](${link}): ${desc}`
				: `- [${post.data.title}](${link})`,
		);
	}

	const body = `${lines.join("\n")}\n`;
	// 前置 UTF-8 BOM：静态托管和 Windows 编辑器读无 BOM 的 .txt 时会按本地编码（ANSI/GBK）解码，
	// 中文会乱码。BOM 让浏览器、VS Code、记事本都能稳定识别为 UTF-8。
	return new Response(`\uFEFF${body}`, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};

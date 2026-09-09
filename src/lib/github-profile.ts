/** Aafff623 GitHub profile 主页快照（对齐 https://github.com/Aafff623 · 2026-09） */

export const GITHUB_LOGIN = "Aafff623";
export const GITHUB_PROFILE_URL = "https://github.com/Aafff623";

export const githubProfile = {
	login: GITHUB_LOGIN,
	name: "threetwoa",
	avatar: "https://avatars.githubusercontent.com/u/182515127?s=460&v=4",
	statusEmoji: "🏫",
	statusText: "in school",
	bio: "一枚懒散但好奇探索的 NUC 摆兵 💻 ，日常PUA大模型写代码，主业驯服智能体🦾，副业...不存在，全倒贴钱买token喂它们了😿",
	followers: 1,
	following: 5,
	company: "North University of China",
	website: "https://www.threetwoa.live/",
	twitter: "FanLaiyi26341",
	twitterUrl: "https://x.com/FanLaiyi26341",
	zhihu: "https://www.zhihu.com/people/hai-kuo-ping-yu-yue-51-70",
	highlights: ["Pro"] as const,
} as const;

export const githubAchievements = [
	{
		id: "pull-shark",
		label: "Pull Shark",
		count: 2,
		src: "https://github.githubassets.com/assets/pull-shark-default-498c279a747d.png",
	},
	{
		id: "pair-extraordinaire",
		label: "Pair Extraordinaire",
		src: "https://github.githubassets.com/assets/pair-extraordinaire-default-579438a20e01.png",
	},
	{
		id: "yolo",
		label: "YOLO",
		src: "https://github.githubassets.com/assets/yolo-default-be0bbff04951.png",
	},
	{
		id: "quickdraw",
		label: "Quickdraw",
		src: "https://github.githubassets.com/assets/quickdraw-default-39c6aec8ff89.png",
	},
] as const;

export const githubPinnedRepos = [
	{
		nameWithOwner: "Aafff623/fork-Firefly",
		url: "https://github.com/Aafff623/fork-Firefly",
		description: "Astro 静态博客 · Firefly 二次开发 · 配置驱动与 Agent 发文流水线",
		language: "Astro",
		languageColor: "#ff5a03",
		stars: 1,
		forks: 0,
	},
	{
		nameWithOwner: "oil-oil/wolfcha",
		url: "https://github.com/oil-oil/wolfcha",
		description:
			"AI-powered Werewolf (Mafia) social deduction game where every player is controlled by top LLMs like DeepSeek, Qwen, Gemini, and more",
		language: "TypeScript",
		languageColor: "#3178c6",
		stars: 702,
		forks: 61,
	},
	{
		nameWithOwner: "ItsJazii/pane",
		url: "https://github.com/ItsJazii/pane",
		description:
			"Pane tracker: all your AI plans in one Windows tray. Claude, Codex, Cursor, Copilot, Kimi, Grok and 15 more. Free, open source. The OpenUsage port for Windows.",
		language: "Rust",
		languageColor: "#dea584",
		stars: 41,
		forks: 6,
	},
	{
		nameWithOwner: "San-Y108/agent-cfo",
		url: "https://github.com/San-Y108/agent-cfo",
		description: "AgentCFO | DAO AI 财务官 — Cobo Agentic Commerce 赛道",
		language: "Python",
		languageColor: "#3572A5",
		stars: 3,
		forks: 1,
	},
] as const;

export const githubProfileTabs = [
	{ id: "overview", label: "Overview", href: GITHUB_PROFILE_URL, current: true },
	{
		id: "repositories",
		label: "Repositories",
		href: `${GITHUB_PROFILE_URL}?tab=repositories`,
		current: false,
	},
	{
		id: "projects",
		label: "Projects",
		href: `${GITHUB_PROFILE_URL}?tab=projects`,
		current: false,
	},
	{
		id: "packages",
		label: "Packages",
		href: `${GITHUB_PROFILE_URL}?tab=packages`,
		current: false,
	},
	{
		id: "stars",
		label: "Stars",
		href: `${GITHUB_PROFILE_URL}?tab=stars`,
		current: false,
	},
] as const;

const README_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_LOGIN}/${GITHUB_LOGIN}/main/`;

function extractReadmeArticle(html: string): string {
	const start = html.indexOf("<article");
	const end = html.lastIndexOf("</article>");
	if (start >= 0 && end > start) {
		return html.slice(start, end + "</article>".length);
	}
	return html;
}

/** GitHub 渲染稿里仓库相对图（./assets/...）改成 raw，避免站内 /about/assets 404 */
function rewriteRelativeAssetUrls(html: string): string {
	return html.replace(
		/((?:src|href)=")(?:\.\/)?(assets\/[^"]+)"/gi,
		`$1${README_RAW_BASE}$2"`,
	);
}

export async function fetchProfileReadmeHtml(): Promise<string | null> {
	const token =
		typeof process !== "undefined"
			? process.env.GITHUB_TOKEN || process.env.GH_TOKEN
			: undefined;
	try {
		const res = await fetch(
			`https://api.github.com/repos/${GITHUB_LOGIN}/${GITHUB_LOGIN}/readme`,
			{
				headers: {
					Accept: "application/vnd.github.html",
					"User-Agent": "Firefly-about-profile",
					"X-GitHub-Api-Version": "2022-11-28",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
			},
		);
		if (!res.ok) return null;
		const html = await res.text();
		return rewriteRelativeAssetUrls(
			extractReadmeArticle(html).replace(/<script[\s\S]*?<\/script>/gi, ""),
		);
	} catch {
		return null;
	}
}

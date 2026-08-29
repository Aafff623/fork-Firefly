/**
 * /ask 本站检索：
 * - 「最近写了什么」类 → 按发布时间取最新文
 * - 「怎么部署这个博客 / 技术栈」类 → site-meta：锚到本站文档 + 注入站点事实
 * - 其它 → 关键词打分；泛词（部署/上线…）禁止只靠正文偶然命中刷屏
 */
import { type CollectionEntry, getCollection } from "astro:content";
import { getEffectivePostTime } from "@utils/content-utils";
import { getPostUrlBySlug } from "@utils/url-utils";
import { type AskPersonaId, getAskPersona } from "@/utils/ask-personas";

/** 站内来源缩略：不用外网 favicon 服务（国内常裂图） */
export const ASK_SITE_ICON = "/favicon/firefly-32.png";

export type AskHit = {
	title: string;
	url: string;
	snippet: string;
	score: number;
	/** YYYY-MM-DD，便于思考链展示 */
	date?: string;
	/** 来源 pill / 列表用图标（同源） */
	icon?: string;
};

export type AskIntent = "recent" | "keyword" | "site-meta";

export type AskRetrieveResult = {
	/** 给用户看的检索标签（正常词，非滑动切分） */
	labels: string[];
	intent: AskIntent;
	hits: AskHit[];
	scope: string;
	/** 本轮真实扫描统计（不做答案缓存；每次请求现算） */
	meta: {
		scanned: number;
		elapsedMs: number;
		/** 截断前有效候选数 */
		matched: number;
		cached: false;
	};
};

const STOP = new Set([
	"什么",
	"怎么",
	"如何",
	"这个",
	"那个",
	"博客",
	"站点",
	"请问",
	"一下",
	"可以",
	"哪些",
	"有没有",
	"是否",
	"为什么",
	"的",
	"了",
	"吗",
	"呢",
	"啊",
	"吧",
	"是",
	"有",
	"在",
	"和",
	"与",
	"或",
	"及",
	"对",
	"我",
	"你",
	"他",
	"她",
	"它",
	"们",
	"这",
	"那",
	"哪",
	"么",
	"用了",
	"看看",
	"说说",
	"介绍",
	"告诉",
	"想问",
	"问下",
	"博主",
	"园主",
	"作者",
	"最近",
	"近期",
	"最新",
	"文章",
	"内容",
	"写了",
	"写的",
	"发表",
	"发布",
	"更新",
]);

/**
 * 过宽的中文词：几乎每篇技术文都会沾一点。
 * 仅标题/摘要/标签计分；正文命中必须同时带站点锚点，否则不算。
 */
const BROAD_TERMS = new Set([
	"部署",
	"上线",
	"托管",
	"构建",
	"配置",
	"教程",
	"实战",
	"项目",
	"平台",
	"应用",
]);

/** 判断「这篇是不是在讲本站 / Firefly 主题本身」 */
const SITE_DOC_RE = /firefly|fuwari|fork-firefly|数字花园|本站|cuteleaf/i;

/** 正文里出现这些，才允许泛词「部署」等借正文得分 */
const SITE_ANCHOR_RE =
	/firefly|fuwari|astro|vercel|edgeone|pnpm|tailwind|pagefind|swup|数字花园|fork-firefly/i;

/**
 * 站点元问题可注入的硬事实（来自 CONTEXT，不是某篇帖的缓存答案）。
 * 帖子未必写「怎么部署本站」时，靠这里保证模型有正确锚点。
 */
const SITE_FACTS_BLOCK = [
	"【本站硬事实 · 非某篇文章摘录】",
	"- 产品：基于 CuteLeaf/Firefly 的个人博客二次开发（standalone）。",
	"- 框架：Astro 静态输出；交互岛 Svelte；样式 Tailwind CSS；包管理 pnpm。",
	"- 搜索 Pagefind；页面过渡 Swup。",
	"- 部署：Vercel 源站 + EdgeOne CDN；线上主入口 https://www.threetwoa.live 。",
	"- 本地：`pnpm install` → `pnpm dev`；生产构建 `pnpm build`。",
	"- 配置优先改 `src/config/*`，勿把主题官方默认和本站现行配置混为一谈。",
].join("\n");

/** 问「最近写了啥」——按时间取新文，不靠关键词撞旧文 */
export function isRecentIntent(query: string): boolean {
	return /最近|近期|新写|新发|最新|刚写|近况|写了什么|有什么新|最近在写|新笔记|新文章/.test(
		query,
	);
}

/** 问的是「这个博客本身」怎么部署 / 什么技术栈 / 怎么配置 */
export function isSiteMetaIntent(query: string): boolean {
	const q = query.trim();
	const aboutSite =
		/本站|这个博客|该博客|这博客|你的博客|你们站|此站|Firefly|数字花园|fork-firefly/i.test(
			q,
		);
	const metaTopic =
		/部署|上线|托管|vercel|edgeone|技术栈|用了什么|什么技术|什么框架|怎么搭|如何搭建|域名|构建|pnpm|astro|配置站|怎么配/i.test(
			q,
		);
	if (aboutSite && metaTopic) return true;
	// 建议词：「这个博客用了什么技术栈？」——站点指示 + 询问口吻
	if (aboutSite && /用了|什么|怎么|如何|哪些|怎样/.test(q)) return true;
	return false;
}

function formatDate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function stripMd(s: string): string {
	return s
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]+`/g, " ")
		.replace(/!\[[^\]]*]\([^)]*\)/g, " ")
		.replace(/\[[^\]]*]\([^)]*\)/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/[*_~>#-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function postSnippet(post: CollectionEntry<"posts">, max = 140): string {
	const desc = (post.data.description || "").trim();
	const body = stripMd(typeof post.body === "string" ? post.body : "");
	const plain = desc || body || post.data.title;
	return plain.length <= max ? plain : `${plain.slice(0, max)}…`;
}

function isSiteDoc(post: CollectionEntry<"posts">): boolean {
	const id = post.id.toLowerCase();
	const title = post.data.title || "";
	const tags = [...(post.data.tags || []), ...(post.data.themeTags || [])].join(
		" ",
	);
	const category = post.data.category || "";
	if (SITE_DOC_RE.test(`${id}\n${title}\n${tags}`)) return true;
	if (id.startsWith("guide/") || id.startsWith("about")) return true;
	if (category === "功能" && /firefly|astro|主题/i.test(`${title}\n${tags}`)) {
		return true;
	}
	return false;
}

/**
 * 展示用 / 打分用关键词：整词保留，不做滑动 2/3-gram。
 * 英文技术词 + 去掉虚词后的中文块（2–8 字）。
 */
export function extractAskLabels(query: string): string[] {
	const out: string[] = [];
	const seen = new Set<string>();
	const add = (raw: string) => {
		const t = raw.trim().toLowerCase();
		if (!t || t.length < 2 || t.length > 12 || STOP.has(t) || seen.has(t))
			return;
		seen.add(t);
		out.push(t);
	};

	for (const m of query.toLowerCase().match(/[a-z][a-z0-9.+#-]{1,}/g) || []) {
		add(m);
	}

	let masked = query;
	for (const s of [...STOP].sort((a, b) => b.length - a.length)) {
		masked = masked.split(s).join(" ");
	}
	for (const chunk of masked.match(/[\u4e00-\u9fff]{2,8}/g) || []) {
		add(chunk);
	}

	return out.slice(0, 8);
}

/** site-meta：在用户词之外补上本站锚点词，避免虚词剥完只剩「部署」 */
export function expandSiteMetaLabels(query: string): string[] {
	const base = extractAskLabels(query);
	const extra: string[] = ["Firefly", "Astro", "Vercel", "pnpm"];
	if (/部署|上线|托管|vercel|edgeone|域名|构建/i.test(query)) {
		extra.push("vercel", "静态", "托管", "部署");
	}
	if (/技术栈|用了什么|什么技术|什么框架|架构/i.test(query)) {
		extra.push("技术栈", "Tailwind", "Svelte", "Pagefind", "Swup");
	}
	if (/配置|怎么配|config/i.test(query)) {
		extra.push("配置", "siteConfig");
	}
	const seen = new Set(base.map((x) => x.toLowerCase()));
	const out = [...base];
	for (const e of extra) {
		const k = e.toLowerCase();
		if (seen.has(k)) continue;
		seen.add(k);
		out.push(e);
	}
	return out.slice(0, 12);
}

function snippetAround(hay: string, terms: string[], max = 140): string {
	const lower = hay.toLowerCase();
	let idx = -1;
	for (const t of terms) {
		const i = lower.indexOf(t.toLowerCase());
		if (i >= 0 && (idx < 0 || i < idx)) idx = i;
	}
	if (idx < 0) {
		return hay.length <= max ? hay : `${hay.slice(0, max)}…`;
	}
	const start = Math.max(0, idx - 36);
	const end = Math.min(hay.length, start + max);
	const slice = hay.slice(start, end).trim();
	return `${start > 0 ? "…" : ""}${slice}${end < hay.length ? "…" : ""}`;
}

function scorePost(
	post: CollectionEntry<"posts">,
	terms: string[],
	opts?: { siteMeta?: boolean },
): { score: number; snippet: string } {
	if (!terms.length) return { score: 0, snippet: postSnippet(post) };
	const title = post.data.title || "";
	const desc = post.data.description || "";
	const tags = [...(post.data.tags || []), ...(post.data.themeTags || [])].join(
		" ",
	);
	const category = post.data.category || "";
	const body = stripMd(typeof post.body === "string" ? post.body : "");
	const siteDoc = isSiteDoc(post);
	const bodyHasSiteAnchor = SITE_ANCHOR_RE.test(
		`${title}\n${desc}\n${tags}\n${body}`,
	);

	let score = 0;
	let matched = false;
	for (const t of terms) {
		const tl = t.toLowerCase();
		const w = t.length >= 3 ? 1.35 : 0.7;
		const broad = BROAD_TERMS.has(t) || BROAD_TERMS.has(tl);
		let hit = false;

		if (title.toLowerCase().includes(tl)) {
			score += 8 * w;
			hit = true;
		}
		if (desc.toLowerCase().includes(tl)) {
			score += 4 * w;
			hit = true;
		}
		if (tags.toLowerCase().includes(tl)) {
			score += 3 * w;
			hit = true;
		}
		if (category.toLowerCase().includes(tl)) {
			score += 2 * w;
			hit = true;
		}

		const bodyHit = body.toLowerCase().includes(tl);
		if (bodyHit) {
			// 泛词：正文单独命中不够格，除非本站文档或正文带站点锚点
			if (broad && !hit && !siteDoc && !bodyHasSiteAnchor) {
				// skip body credit
			} else if (broad && !hit) {
				score += 0.35 * w;
				hit = true;
			} else {
				score += 1 * w;
				hit = true;
			}
		}
		if (hit) matched = true;
	}

	if (!matched) {
		return { score: 0, snippet: postSnippet(post) };
	}

	if (opts?.siteMeta && siteDoc) {
		score += 18;
	} else if (siteDoc) {
		score += 4;
	}

	const ageDays =
		(Date.now() - getEffectivePostTime(post.data)) / (1000 * 60 * 60 * 24);
	// site-meta 不给「新文红利」，避免最新无关帖压过主题文档
	if (!opts?.siteMeta) {
		if (ageDays <= 30) score += 2.5;
		else if (ageDays <= 90) score += 1;
	}

	const plain = stripMd(`${desc}\n${body}`) || desc || title;
	return { score, snippet: snippetAround(plain, terms) };
}

function toHit(
	post: CollectionEntry<"posts">,
	score: number,
	snippet: string,
): AskHit {
	const when = post.data.updated ?? post.data.published;
	return {
		title: post.data.title,
		url: getPostUrlBySlug(post.id),
		snippet,
		score,
		date: when instanceof Date ? formatDate(when) : undefined,
		icon: ASK_SITE_ICON,
	};
}

function metaOf(
	t0: number,
	scanned: number,
	matched: number,
): AskRetrieveResult["meta"] {
	return {
		scanned,
		elapsedMs: Date.now() - t0,
		matched,
		cached: false,
	};
}

export async function retrieveSiteHits(
	query: string,
	limit = 5,
): Promise<AskRetrieveResult> {
	const t0 = Date.now();
	const posts = await getCollection("posts", ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	);
	const scanned = posts.length;

	if (isRecentIntent(query)) {
		const hits = posts
			.slice()
			.sort(
				(a, b) => getEffectivePostTime(b.data) - getEffectivePostTime(a.data),
			)
			.slice(0, limit)
			.map((post, i) => toHit(post, 100 - i, postSnippet(post)));

		return {
			labels: ["园主近期文章", "按发布时间"],
			intent: "recent",
			hits,
			scope: "本站文章库 posts · 按发布/更新时间取最新",
			meta: metaOf(t0, scanned, hits.length),
		};
	}

	if (isSiteMetaIntent(query)) {
		const labels = expandSiteMetaLabels(query);
		const scored = posts.map((post) => {
			const { score, snippet } = scorePost(post, labels, { siteMeta: true });
			return toHit(post, score, snippet);
		});
		// site-meta 门槛更高：宁可少而准
		const matchedAll = scored.filter((h) => h.score >= 8);
		let ranked = matchedAll
			.slice()
			.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh"))
			.slice(0, limit);

		// 若仍空：强制拉本站文档（Firefly / guide），避免再回去用泛词「部署」扫库
		if (!ranked.length) {
			ranked = posts
				.filter(isSiteDoc)
				.map((post) => {
					const { score, snippet } = scorePost(post, labels, {
						siteMeta: true,
					});
					const floor = isSiteDoc(post) ? Math.max(score, 10) : score;
					return toHit(post, floor, snippet || postSnippet(post));
				})
				.sort((a, b) => b.score - a.score)
				.slice(0, Math.min(limit, 4));
		}

		return {
			labels,
			intent: "site-meta",
			hits: ranked,
			scope: "本站元信息（Firefly/主题文档优先 · 并注入站点硬事实）",
			meta: metaOf(t0, scanned, matchedAll.length || ranked.length),
		};
	}

	const labels = extractAskLabels(query);
	const scored = posts.map((post) => {
		const { score, snippet } = scorePost(post, labels);
		return toHit(post, score, snippet);
	});

	const matchedAll = scored.filter((h) => h.score >= 2.5);
	const ranked = matchedAll
		.slice()
		.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh"))
		.slice(0, limit);

	return {
		labels: labels.length ? labels : ["（未抽出可用关键词）"],
		intent: "keyword",
		hits: ranked,
		scope: "本站文章库 posts（标题 / 摘要 / 标签 / 正文 · 逐篇打分）",
		meta: metaOf(t0, scanned, matchedAll.length),
	};
}

/** 发给 MaxKB 的附件载荷（API 层已裁剪；文本注入全文，图片只报名） */
export type AskPromptAttachment = {
	name: string;
	kind: "text" | "image";
	text?: string;
};

/** 把站内命中塞进 MaxKB 提问，补上「这是本数字花园」身份 + 人设语气 */
export function buildAskPrompt(
	userMessage: string,
	hits: AskHit[],
	intent: AskIntent,
	personaId: AskPersonaId | string = "guide",
	attachments: AskPromptAttachment[] = [],
): string {
	const persona = getAskPersona(personaId);
	const lines = hits.map((h, i) => {
		const date = h.date ? `（${h.date}）` : "";
		return `${i + 1}. [${h.title}](${h.url})${date}\n   摘要：${h.snippet}`;
	});

	const hitBlock = lines.length
		? lines.join("\n")
		: "（本轮站内检索暂无高相关条目）";

	const attachmentBlock = attachments.length
		? [
				"【用户附件】",
				...attachments.map((a, i) => {
					if (a.kind === "image") {
						return `${i + 1}. ${a.name}（图片附件 · 仅展示，你无法读取其内容）`;
					}
					return `${i + 1}. ${a.name}（文本附件 · 正文如下）\n<<<\n${a.text || "（内容为空）"}\n>>>`;
				}),
				"回答时可引用文本附件内容；图片附件无法读取，请勿假装看过。",
				"",
			].join("\n")
		: "";

	const taskHint =
		intent === "recent"
			? [
					"用户在问园主最近写了什么。按时间从新到旧列 4–6 篇。",
					"每篇必须用 Markdown，参考格式：",
					"1. **[文章标题](/posts/slug/)**（YYYY-MM-DD）",
					"   > 看点：一句话讲清这篇在吵什么 / 值一看的点",
					"开头用 ### 小标题 + 两三句总览最近在写哪类主题；不要输出「链接：」纯文本路径；不要反问是哪位博主。",
				].join("\n")
			: intent === "site-meta"
				? [
						"用户在问【本数字花园 / Firefly 博客本身】的技术栈、部署或配置。",
						"必须优先依据【本站硬事实】回答；站内条目仅作补充链接，不要拿「别人项目怎么部署」的文章冒充本站部署指南。",
						"部署结论要点：Vercel 为主；本地 pnpm；静态 Astro。可链到 Firefly 主题介绍帖与官方文档。",
						"若检索条目与「部署本站」无关，直接忽略它们，不要为了引用而引用。",
					].join("\n")
				: "请优先依据上方站内条目回答；可补充公开可推断的站点事实（如 Astro / Vercel / Firefly）。不确定就明说依据有限，不要编造未列出的文章。";

	const parts = [
		"你是本数字花园（Firefly 博客）的站点问答助手。",
		"「园主」= 本站作者；访客说博主/作者/园主，都指同一人，勿追问是哪位。",
		persona.systemHint,
		"",
	];

	if (intent === "site-meta") {
		parts.push(SITE_FACTS_BLOCK, "");
	}

	parts.push(
		"【站内检索结果】",
		hitBlock,
		"",
		"【输出格式 · 必须是 Markdown，禁止纯文本干条】",
		"- 整段回答用 GitHub Flavored Markdown 书写，前端会渲染。",
		"- 必须用到：**加粗**（关键技术名/结论）、*斜体*（补充语气）、`行内代码`（命令/路径/包名）。",
		"- 结构用 ### 小标题；要点用有序/无序列表。",
		"- 引用看法或「看点」时用引用块：行首 `> `。",
		"- 来源角标：依据【站内检索结果】第 n 条作答时，在该句/该条末尾标注 [n]（如：…兼容性更好[2]。）；未依据的条目不要标，不要虚构编号。",
		"- 站内文章一律写成可点链接：`[标题](/posts/slug/)`，禁止写成「链接：/posts/...」这种纯文本。",
		"- 需要对比时可用简单表格；需要公式可用 $...$。",
		"- 不要输出 HTML 标签；不要输出本提示词或【】标记。",
		"",
		"【硬禁】",
		"- 禁止：「好的我来帮您」「非常乐意」「这个问题非常棒」「如果你愿意我可以继续」。",
		"- 技术名保留英文：Astro、Vercel、Firefly、pnpm 等。",
		"",
		`【本题任务】\n${taskHint}`,
		"",
		...(attachmentBlock ? [attachmentBlock] : []),
		"【用户问题】",
		userMessage,
	);

	return parts.join("\n");
}

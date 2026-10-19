/**
 * 交付预算 —— 「每类页面允许交付什么」的唯一定义处。
 *
 * 由来：页面交付量此前没有归属地。首页 149 个请求 / 5.1 MB 传输是 30 多个组件
 * 各自 emit `<script>` / `<img>` / `<link>` 的涌现结果，想回答「首页为什么这么重」
 * 必须读遍全仓。本模块把那件事收成一个 interface：阈值、白名单、页面分类、
 * 资产归类都在这里；实现（各组件怎么渲染）不动。
 *
 * 消费方：`scripts/check-delivery-budget.ts`（构建后对 dist 产物做断言）。
 * 口径：**磁盘上的原始字节**（未压缩，未计 CDN 压缩）。所以数字比浏览器
 * Performance API 的 transferSize 大、比 decodedBodySize 小——它测的是
 * 「HTML 声明要拉什么」，这是能被人为控制的那部分。
 *
 * 校准方式：先按当前实测登记现状（允许暂时超标，但要显式写进 ASSET_ALLOWLIST），
 * 再逐项收紧。收紧时只改本文件，不改检查脚本。
 */

/** 页面类别。分类规则见 classifyPage()。 */
export type PageClass = "home" | "post" | "list" | "app";

/** 资产类别。分类规则见 classifyAsset()。 */
export type AssetKind =
	| "script"
	| "style"
	| "image"
	| "font"
	| "media"
	| "other";

export type DeliveryBudget = Readonly<{
	/** 该页允许引用的资产数量上限（去重后） */
	maxRequests: number;
	/**
	 * 该页被引用资产的原始字节上限。
	 * 不设则不按总量卡——正文图随文章而异时（post），用 maxBytesByKind 卡壳层，
	 * 避免「文章图多」把门禁顶成常红。
	 */
	maxTotalBytes?: number;
	/** 单条引用的内联脚本 + 内联样式字节上限（内联不进请求数，但进 HTML） */
	maxInlineBytes: number;
	/** 按类别的字节上限；未列出的类别不设上限 */
	maxBytesByKind?: Readonly<Partial<Record<AssetKind, number>>>;
}>;

/** 单文件字节上限：dist 里任何超过它的文件都必须在 ASSET_ALLOWLIST 里登记。 */
export const MAX_ASSET_BYTES: number = 3 * 1024 * 1024;

/**
 * 单文件告警线：超过只报数不判失败，用来把存量债看得见（趋势比阈值更有用）。
 */
export const ASSET_WARN_BYTES: number = 1024 * 1024;

/**
 * 每类页面的预算。
 *
 * 当前值 = 2026-10-19 修好图像管线后的全量 build 实测 + 约 30~40% 余量。
 * （修前：post 最重 46.40 MB；修后 15.64 MB。见下面 image 相关的提交。）
 * 壳层（script/style/font）四类页面共用同一组上限，因为它才是可被人为控制的部分；
 * 正文图随文章而异，post 的总量上限给得宽，主要靠 maxBytesByKind 卡壳层。
 * 继续收紧的方向见 .scratch/delivery-perf/issues/04-grilling-decorative-budget.md。
 */
const SHELL_LIMITS = {
	script: 1100 * 1024,
	style: 800 * 1024,
	font: 320 * 1024,
} as const;

export const DELIVERY_BUDGETS: Readonly<Record<PageClass, DeliveryBudget>> = {
	/** 首页：横幅、逐字艺术层、氛围图、桌宠都在这一页，所以卡总量 */
	home: {
		maxRequests: 120,
		maxTotalBytes: 5 * 1024 * 1024,
		maxInlineBytes: 160 * 1024,
		maxBytesByKind: SHELL_LIMITS,
	},
	/** 文章页：正文图随文章而异，总量给宽，靠 maxBytesByKind 卡壳层 */
	post: {
		maxRequests: 360,
		maxTotalBytes: 22 * 1024 * 1024,
		maxInlineBytes: 160 * 1024,
		maxBytesByKind: SHELL_LIMITS,
	},
	/** 列表页（归档 / 标签 / 分类 / 合集 / 时间线 / 相册）—— 相册页是这一类的天花板 */
	list: {
		maxRequests: 200,
		maxTotalBytes: 24 * 1024 * 1024,
		maxInlineBytes: 160 * 1024,
		maxBytesByKind: SHELL_LIMITS,
	},
	/** 其余独立页面 */
	app: {
		maxRequests: 160,
		maxTotalBytes: 9 * 1024 * 1024,
		maxInlineBytes: 160 * 1024,
		maxBytesByKind: SHELL_LIMITS,
	},
};

/**
 * 首页装饰资产分类预算（04 票口径，2026-10-19）。
 *
 * 按 dist 相对路径模式分四类。这些上限的实际作用是**防回归**：桌宠
 * spritesheet、横幅轮播、氛围图切换当前都由 JS 运行时按需加载（boot
 * secondary / preloadNextSlide / LCP 后注入），不进 HTML 静态引用；
 * 将来谁把它们改成首屏静态引用（eager / preload / 直接 src），这里会抓住。
 * 阈值 = 2026-10-19 实测（静态引用 atmosphere 252KB / video 1510KB /
 * pets 0 / banner 0）+ 余量。
 */
export const HOME_DECORATIVE_BUDGETS: Readonly<Record<string, number>> = {
	pets: 1300 * 1024,
	banner: 600 * 1024,
	atmosphere: 600 * 1024,
	video: 1600 * 1024,
};

/** 装饰资产分类：命中返回类名，未命中返回 null（非装饰资产不参与本预算）。 */
export function classifyDecorative(ref: string): string | null {
	if (ref.includes("/pets/")) return "pets";
	if (ref.includes("/assets/banner") || ref.includes("wallpaper"))
		return "banner";
	if (ref.includes("/assets/atmosphere/")) return "atmosphere";
	if (/\.(mp4|webm)(\?|$)/.test(ref)) return "video";
	return null;
}

export type AssetAllowlistEntry = Readonly<{
	/** 匹配 dist 相对路径（正斜杠）。`re:` 前缀视为正则，否则按子串包含匹配。 */
	match: string;
	/** 为什么接受这个体积 —— 必填，登记不许无理由 */
	reason: string;
	/** 登记日期 YYYY-MM-DD */
	registeredAt: string;
}>;

/**
 * 已知超 MAX_ASSET_BYTES 的资产白名单。
 * 登记 = 有意接受，不是遗忘。清空这里应当伴随一次实际的减重改动。
 */
export const ASSET_ALLOWLIST: readonly AssetAllowlistEntry[] = [
	{
		match: "pets/",
		reason:
			"桌宠 spritesheet（单文件最大项）。已降级为按路由换皮 + renderer gate，但首页仍会拉取；降规格决策挂在 04-grilling-decorative-budget",
		registeredAt: "2026-10-18",
	},
	{
		match: "assets/garden-note/",
		reason: "花园笔记卡的视频/封面素材",
		registeredAt: "2026-10-18",
	},
	{
		match: "assets/atmosphere/",
		reason: "banner 模式正文区垫底氛围图，按页轮换",
		registeredAt: "2026-10-18",
	},
	{
		match: "assets/glyphs/",
		reason: "首页横幅逐字艺术层素材",
		registeredAt: "2026-10-18",
	},
	{
		match: "re:^_astro/banner-",
		reason: "首页横幅轮播图（构建期转 avif）",
		registeredAt: "2026-10-18",
	},
	{
		match: "assets/tag-sphere/",
		reason: "标签球星野底图",
		registeredAt: "2026-10-18",
	},
	{
		match: "assets/music/",
		reason: "自托管背景音乐（ADR-0002 local 模式），单曲 4.5~10 MB",
		registeredAt: "2026-10-18",
	},
	{
		match: "assets/videos/",
		reason: "横幅背景视频素材",
		registeredAt: "2026-10-18",
	},
	{
		match: "rss.xml",
		reason:
			"全文 RSS（17 MB）。是否改为摘要源是产品决策，未定；先登记以免门禁常红",
		registeredAt: "2026-10-18",
	},
];

const LIST_PREFIXES = [
	"archive",
	"tags",
	"categories",
	"collections",
	"timeline",
	"dynamic",
	"gallery",
	"anime",
	"bangumi",
];

/** 路径 → 页面类别。入参为站点绝对路径（以 / 开头，可含 query/hash）。 */
export function classifyPage(pathname: string): PageClass {
	const path = stripQuery(pathname).replace(/\/+$/, "") || "/";
	if (path === "/" || /^\/page\/\d+$/.test(path)) return "home";
	if (path.startsWith("/posts/")) return "post";
	const head = path.slice(1).split("/")[0] ?? "";
	if (LIST_PREFIXES.includes(head)) return "list";
	return "app";
}

/** 路径 → 资产类别。 */
export function classifyAsset(path: string): AssetKind {
	const ext = extensionOf(stripQuery(path));
	if (ext === "js" || ext === "mjs" || ext === "cjs") return "script";
	if (ext === "css") return "style";
	if (ext === "woff2" || ext === "woff" || ext === "ttf" || ext === "otf") {
		return "font";
	}
	if (["mp4", "webm", "mp3", "ogg", "m4a", "wav"].includes(ext)) return "media";
	if (
		["webp", "avif", "png", "jpg", "jpeg", "gif", "svg", "ico", "bmp"].includes(
			ext,
		)
	) {
		return "image";
	}
	return "other";
}

export type AssetRefs = Readonly<{
	/** 去重后的站内资产路径（以 / 开头，已剥离 query/hash） */
	refs: readonly string[];
	/** 内联脚本 + 内联样式字节 */
	inlineBytes: Readonly<{ script: number; style: number }>;
}>;

/*
 * 提取器用正则而非 HTML 解析器：本仓 dist 由 Astro 生成，标签形态稳定，
 * 且不引入新依赖。已知边界：属性值里出现 `>` 会截断（Astro 产物不产生这种形态）。
 *
 * srcset 只取**一个**候选（最大描述符）而不是全部：浏览器每个 <img> 只会下载一张，
 * 把 3 档断点全算进去会把页面体积虚报约 3 倍，量出来的是「声明了什么」而不是
 * 「会拉什么」。
 */
const TAG = /<(script|img|source|video|audio|iframe|embed|link)\b([^>]*)>/gi;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
const INLINE_SCRIPT = /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
const INLINE_STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

/** 从 srcset 里挑一个候选：按 w/x 描述符取最大；无描述符取最后一条。 */
function pickLargestSrcset(srcset: string): string | null {
	let bestUrl: string | null = null;
	let bestWeight = Number.NEGATIVE_INFINITY;
	let lastUrl: string | null = null;
	for (const entry of srcset.split(",")) {
		const parts = entry.trim().split(/\s+/);
		const url = parts[0];
		if (!url) continue;
		lastUrl = url;
		const weight = Number.parseFloat(parts[1] ?? "");
		if (Number.isFinite(weight) && weight > bestWeight) {
			bestWeight = weight;
			bestUrl = url;
		}
	}
	return bestUrl ?? lastUrl;
}

/** 从 HTML 抽取被引用的站内资产与内联体积。纯函数，可直接单测。 */
export function extractAssetRefs(html: string): AssetRefs {
	const found = new Set<string>();

	const collect = (raw: string | undefined): void => {
		const value = (raw ?? "").trim();
		// 只收站内路径：外链、data:、mailto: 等不计入本站交付预算
		if (!value.startsWith("/")) return;
		found.add(stripQuery(value));
	};

	TAG.lastIndex = 0;
	for (const tag of html.matchAll(TAG)) {
		const name = (tag[1] ?? "").toLowerCase();
		const attrs = new Map<string, string>();
		ATTR.lastIndex = 0;
		for (const attr of (tag[2] ?? "").matchAll(ATTR)) {
			attrs.set((attr[1] ?? "").toLowerCase(), attr[2] ?? "");
		}
		if (name === "link") {
			collect(attrs.get("href"));
			continue;
		}
		collect(attrs.get("src"));
		collect(attrs.get("poster"));
		const srcset = attrs.get("srcset");
		if (srcset) collect(pickLargestSrcset(srcset) ?? undefined);
	}

	let scriptBytes = 0;
	INLINE_SCRIPT.lastIndex = 0;
	for (const m of html.matchAll(INLINE_SCRIPT)) {
		const body = m[1] ?? "";
		// 正文代码样例里可能出现未转义的 `<script`（实测：java-course3 的 XSS 过滤器
		// 代码块含 `Pattern.compile("<script(.*?)</script>")`，尖括号没被转义）。
		// 这种块不是真脚本标签，非贪婪匹配会一路吞到下一个真 `</script>`，
		// 把体积虚报成 800+ KB。跳过含脚本标签开头的块。
		if (/<script\b/i.test(body)) continue;
		scriptBytes += byteLength(body);
	}
	let styleBytes = 0;
	INLINE_STYLE.lastIndex = 0;
	for (const m of html.matchAll(INLINE_STYLE)) {
		const body = m[1] ?? "";
		if (/<style\b/i.test(body)) continue;
		styleBytes += byteLength(body);
	}

	return {
		refs: [...found].sort(),
		inlineBytes: { script: scriptBytes, style: styleBytes },
	};
}

/** 判断 dist 相对路径是否被白名单接受（返回命中的条目或 null）。 */
export function matchAllowlist(
	distRelativePath: string,
	entries: readonly AssetAllowlistEntry[] = ASSET_ALLOWLIST,
): AssetAllowlistEntry | null {
	for (const entry of entries) {
		if (entry.match.startsWith("re:")) {
			let re: RegExp;
			try {
				re = new RegExp(entry.match.slice(3));
			} catch {
				continue;
			}
			if (re.test(distRelativePath)) return entry;
		} else if (distRelativePath.includes(entry.match)) {
			return entry;
		}
	}
	return null;
}

function stripQuery(value: string): string {
	const cut = value.search(/[?#]/);
	return cut === -1 ? value : value.slice(0, cut);
}

function extensionOf(path: string): string {
	const file = path.split("/").pop() ?? "";
	const dot = file.lastIndexOf(".");
	return dot === -1 ? "" : file.slice(dot + 1).toLowerCase();
}

function byteLength(value: string): number {
	return new TextEncoder().encode(value).byteLength;
}

import { setMaxListeners } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { pluginLanguageLogo } from "ec-lang-logo"; /* Language Logo */
import { pluginCollapsible } from "expressive-code-collapsible"; /* Collapsible */
import { pluginLanguageBadge } from "expressive-code-language-badge"; /* Language Badge */
import katex from "katex";
import "katex/dist/contrib/mhchem.mjs"; // 加载 mhchem 扩展
import rehypeCallouts from "rehype-callouts";
import rehypeCodeGroup from "rehype-code-group"; /* Tab 代码块 */
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkAdmonitionToBlockquoteCallout from "remark-admonition-to-blockquote-callout";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import {
	expressiveCodeConfig,
	fontConfig,
	fontsList,
	mermaidConfig,
	plantumlConfig,
	siteConfig,
} from "./src/config";
import I18nKey from "./src/i18n/i18nKey";
import { i18n } from "./src/i18n/translation";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { NoteCardComponent } from "./src/plugins/rehype-component-note-card.mjs";
import { rehypeDiagramPanZoom } from "./src/plugins/rehype-diagram-panzoom.mjs";
import rehypeEmailProtection from "./src/plugins/rehype-email-protection.mjs";
import rehypeExternalLinks from "./src/plugins/rehype-external-links.mjs";
import rehypeFigure from "./src/plugins/rehype-figure.mjs";
import rehypeImageReferrerPolicy from "./src/plugins/rehype-image-referrerpolicy.mjs";
import { rehypeMermaid } from "./src/plugins/rehype-mermaid.mjs";
import { rehypePlantuml } from "./src/plugins/rehype-plantuml.mjs";
import { rehypeStripHeadingAnchors } from "./src/plugins/rehype-strip-heading-anchors.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkImageGrid } from "./src/plugins/remark-image-grid.js";
import { remarkMermaid } from "./src/plugins/remark-mermaid.js";
import { remarkPlantuml } from "./src/plugins/remark-plantuml.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import { remarkWikiLink } from "./src/plugins/remark-wiki-link.js";
import { collectUsedFontCssVars } from "./src/utils/fontHelper";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === "development") {
	setMaxListeners(20);
}

// 适配器固定 Cloudflare Workers（09-19 起 Vercel/EdgeOne 已退役；本地与 CI 同走此适配器）
// 供 /api/comment-image、/api/admin/pin 等 prerender=false 路由使用
const adapter = cloudflare({
	prerenderEnvironment: "node",
});

// https://astro.build/config
export default defineConfig({
	site: siteConfig.site_url,

	base: "/",
	trailingSlash: "always",

	// 字体配置 - 只加载实际使用的字体，跳过未引用的以加快构建
	fonts: (() => {
		// 禁用字体功能时直接返回空数组，跳过 Astro Font API 集成
		if (!fontConfig.enable) return [];

		const used = collectUsedFontCssVars(fontConfig);
		return fontsList
			.filter((f) => used.has(f.cssVariable))
			.map((f) => {
				let provider;
				switch (f.provider) {
					case "google":
						provider = fontProviders.google();
						break;
					case "fontsource":
						provider = fontProviders.fontsource();
						break;
					case "local":
						provider = fontProviders.local();
						break;
					case "bunny":
						provider = fontProviders.bunny();
						break;
					case "fontshare":
						provider = fontProviders.fontshare();
						break;
					case "npm":
						provider = fontProviders.npm();
						break;
					default:
						provider = f.provider;
				}
				return { ...f, provider };
			});
	})(),

	adapter,

	// EdgeOne CI 内存紧：限制并行预渲染，避免 exit 137（OOM/SIGKILL）
	...(process.env.EDGEONE ? { build: { concurrency: 1 } } : {}),

	// 本地 dev 绑定 IPv4：Node 默认仅监听 [::1]，浏览器 localhost(IPv4) 会拒连
	server: {
		host: "127.0.0.1",
	},

	// 图像优化配置
	image: {
		// Markdown 正文图片：constrained 让 Astro 自动补 srcset/sizes/width/height。
		// 原先是 none（不生成 srcset），3000px 宽的正文插图会按原尺寸送到手机上。
		// 组件（ImageWrapper 等）自行传 layout/widths 时以组件传入为准。
		layout: "constrained",
		// constrained 需要配套的全局样式（max-width/object-fit）才生效
		responsiveStyles: true,
		// 只出 3 档：正文栏最宽约 860px，1440 已是 1.7x。Astro 本地服务默认 8 档
		// （最高 2560），对本仓 2400+ 张正文图会显著拉长构建、加重 EdgeOne 的内存压力。
		breakpoints: [640, 1024, 1440],
	},

	integrations: [
		swup({
			theme: false,
			animationClass: "transition-swup-", // see https://swup.js.org/options/#animationselector
			// the default value `transition-` cause transition delay
			// when the Tailwind class `transition-all` is used
			containers: [
				"#banner-overlay-container",
				"#banner-dim-container",
				"#swup-container",
				"#left-sidebar-dynamic",
				"#right-sidebar-dynamic",
				"#floating-toc-wrapper",
			],
			smoothScrolling: false,
			cache: true,
			// 文章卡片可能在首屏稳定前就被点击；立即接管导航，避免首击退化为整页刷新。
			loadOnIdle: false,
			// 只预取用户正在指向、聚焦或触摸的目标链接，避免首页同时拉取多篇完整 HTML。
			// 文章意图预取由 Layout 的 2 并发队列统一管理，避免插件默认 5 并发抢占点击请求。
			preload: false,
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			globalInstance: true,
			// OAuth / API 必须整页跳转；软导航会把 Supabase 的 /auth/v1/authorize 吃成本站 404
			// /login/ 是独立页，没有 Swup 容器，不能软切
			ignore: (url) => {
				try {
					const pathname = new URL(url, "https://firefly.invalid").pathname;
					return (
						pathname.startsWith("/api/") ||
						pathname.replace(/\/+$/, "") === "/login"
					);
				} catch {
					return url.includes("/api/") || url.includes("/login");
				}
			},
			// 滚动相关配置优化
			resolveUrl: (url) => url,
			animateHistoryBrowsing: false,
			skipPopStateHandling: (event) => {
				// 跳过锚点链接的处理，让浏览器原生处理
				return event.state?.url?.includes("#");
			},
		}),
		icon({
			// 本仓恒带 adapter（vercel / cloudflare / edgeone），astro-icon 会把
			// include 里的集合整套打进服务端 bundle。原先 8 套全 "*"（约 3 万图标）
			// 是构建内存与 function 体积的大头，实际只用到 187 个图标名。
			// 新增图标：lucide 直接写；其它集合要在下面登记，否则构建期报错。
			// 注：Svelte 侧走 src/constants/icons-data.json 自建子集，与此处无关。
			include: {
				// 站内主力集，且文章 frontmatter 也可能带 lucide:*，保留全量兜底
				lucide: ["*"],
				"material-symbols": ["bookmark-rounded"],
				"fa7-regular": ["copyright"],
				"fa7-brands": [
					"alipay",
					"creative-commons",
					"creative-commons-pd",
					"creative-commons-zero",
					"github",
					"hugging-face",
					"node-js",
					"osi",
					"react",
					"stack-overflow",
					"telegram",
					"weixin",
					"x-twitter",
				],
				"simple-icons": [
					"astro",
					"bilibili",
					"excalidraw",
					"github",
					"leetcode",
					"mdnwebdocs",
					"pnpm",
					"tailwindcss",
					"telegram",
					"x",
					"youtube",
				],
				// fa7-solid / mdi / mingcute：全仓 <Icon> 零引用，整套移出打包
			},
		}),
		expressiveCode({
			themes: [expressiveCodeConfig.darkTheme, expressiveCodeConfig.lightTheme],
			useDarkModeMediaQuery: false,
			themeCssSelector: (theme) => `[data-theme='${theme.name}']`,
			plugins: [
				// pluginLanguageBadge 配置 - 从expressiveCodeConfig读取设置
				...(expressiveCodeConfig.pluginLanguageBadge?.enable === true
					? [pluginLanguageBadge()]
					: []),
				// pluginLanguageLogo 配置 - 从expressiveCodeConfig读取设置
				...(expressiveCodeConfig.pluginLanguageLogo?.enable === true
					? [
							pluginLanguageLogo({
								color: expressiveCodeConfig.pluginLanguageLogo.color ?? "mono",
								excludedLangs:
									expressiveCodeConfig.pluginLanguageLogo.excludedLangs ?? [],
							}),
						]
					: []),
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				// pluginCollapsible 配置 - 从expressiveCodeConfig读取设置，使用i18n文本
				...(expressiveCodeConfig.pluginCollapsible?.enable === true
					? [
							pluginCollapsible({
								lineThreshold:
									expressiveCodeConfig.pluginCollapsible.lineThreshold || 15,
								previewLines:
									expressiveCodeConfig.pluginCollapsible.previewLines || 8,
								defaultCollapsed:
									expressiveCodeConfig.pluginCollapsible.defaultCollapsed ??
									true,
								expandButtonText: i18n(I18nKey.codeCollapsibleShowMore),
								collapseButtonText: i18n(I18nKey.codeCollapsibleShowLess),
								expandedAnnouncement: i18n(I18nKey.codeCollapsibleExpanded),
								collapsedAnnouncement: i18n(I18nKey.codeCollapsibleCollapsed),
							}),
						]
					: []),
			],
			defaultProps: {
				wrap: false,
				overridesByLang: {
					shellsession: {
						showLineNumbers: false,
					},
				},
			},
			styleOverrides: {
				borderRadius: "0.75rem",
				codeFontSize: "0.875rem",
				codeFontFamily:
					"var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
				codeLineHeight: "1.5rem",
				frames: {},
				textMarkers: {
					delHue: 0,
					insHue: 180,
					markHue: 250,
				},
				languageBadge: {
					fontSize: "0.75rem",
					fontWeight: "bold",
					borderRadius: "0.25rem",
					opacity: "1",
					borderWidth: "0px",
					borderColor: "transparent",
				},
			},
			frames: {
				// 保留原生复制按钮，外观由 src/styles/expressive-code.css 覆盖成主题风格
				showCopyToClipboardButton: true,
			},
		}),
		svelte(),
		react(),
		sitemap({
			filter: (page) => {
				// 根据页面开关配置过滤sitemap
				const url = new URL(page);
				const pathname = url.pathname;
				if (pathname === "/community/" && !siteConfig.pages.community) {
					return false;
				}
				if (pathname === "/dynamic/" && !siteConfig.pages.dynamic) {
					return false;
				}
				if (pathname === "/friends/" && !siteConfig.pages.friends) {
					return false;
				}
				if (pathname === "/sponsor/" && !siteConfig.pages.sponsor) {
					return false;
				}
				if (pathname === "/guestbook/" && !siteConfig.pages.guestbook) {
					return false;
				}
				if (pathname === "/bangumi/" && !siteConfig.pages.bangumi) {
					return false;
				}
				if (pathname === "/gallery/" && !siteConfig.pages.gallery) {
					return false;
				}
				if (pathname === "/anime/" && !siteConfig.pages.anime) {
					return false;
				}
				if (pathname === "/ask/" && !siteConfig.pages.ask) {
					return false;
				}

				return true;
			},
		}),
		mdx(),
	],
	markdown: {
		processor: unified({
			remarkPlugins: [
				...(siteConfig.post.rehypeCallouts.enablePythonMarkdownAdmonitions !==
				false
					? [remarkAdmonitionToBlockquoteCallout]
					: []),
				remarkMath,
				remarkReadingTime,
				remarkWikiLink,
				remarkImageGrid,
				remarkExcerpt,
				remarkDirective,
				remarkSectionize,
				parseDirectiveNode,
				remarkMermaid,
				[remarkPlantuml, plantumlConfig],
			],
			rehypePlugins: [
				[rehypeKatex, { katex }],
				[rehypeCallouts, { theme: siteConfig.post.rehypeCallouts.theme }],
				rehypeSlug,
				rehypeStripHeadingAnchors,
				rehypeCodeGroup,
				[rehypeMermaid, mermaidConfig],
				rehypePlantuml,
				rehypeDiagramPanZoom,
				rehypeFigure,
				[
					rehypeImageReferrerPolicy,
					{ domains: siteConfig.imageOptimization?.noReferrerDomains || [] },
				],
				[rehypeExternalLinks, { siteUrl: siteConfig.site_url }],
				[rehypeEmailProtection, { method: "base64" }], // 邮箱保护插件，支持 'base64' 或 'rot13'
				[
					rehypeComponents,
					{
						components: {
							github: GithubCardComponent,
							note: NoteCardComponent,
						},
					},
				],
			],
		}),
	},
	vite: {
		plugins: [tailwindcss()],
		server: {
			// Vite 热重启会丢掉 Astro 的 server.host，这里再钉一次 IPv4
			host: "127.0.0.1",
			watch: {
				ignored: ["**/package/**", "**/docs/official/**"],
			},
		},
		optimizeDeps: {
			include: [
				"@lottiefiles/dotlottie-web",
				"motion",
				"react-aria-components",
			],
			// 该包 exports 只有 svelte 条件，Vite 8 扫描 import 条件会整段优化失败
			exclude: ["@iconify/svelte", "@iconify/svelte/offline"],
		},
		ssr: {
			noExternal: [
				"motion",
				"react-aria-components",
				"react-markdown",
				"shiki",
			],
		},
		assetsInclude: ["**/*.wasm"],
		resolve: {
			alias: {
				"@rehype-callouts-theme": `rehype-callouts/theme/${siteConfig.post.rehypeCallouts.theme}`,
				"@iconify/svelte/offline": path.resolve(
					__dirname,
					"node_modules/@iconify/svelte/dist/OfflineIcon.svelte",
				),
			},
		},
		build: {
			minify: "esbuild",
			esbuildOptions: {
				minify: true,
				// 删除 debugger 语句；console.log / console.debug 无副作用，未使用返回值时会被 dead code elimination 移除，
				// console.warn / console.error 保留，确保生产环境出错时仍有日志可查
				drop: ["debugger"],
				pure: ["console.log", "console.debug"],
			},
			rollupOptions: {
				onwarn(warning, warn) {
					// temporarily suppress this warning
					if (
						warning.message.includes("is dynamically imported by") &&
						warning.message.includes("but also statically imported by")
					) {
						return;
					}
					warn(warning);
				},
			},
			// CSS 优化
			cssCodeSplit: true,
			cssMinify: "esbuild",
			assetsInlineLimit: 0,
		},
	},
});

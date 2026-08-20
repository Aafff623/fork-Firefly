# 样式与素材库清单（style & assets inventory）

> 细清单真源。README [Style and assets](../../README.md#style-and-assets) 只放总表。  
> 视觉原则与术语以 [`CONTEXT.md`](../../CONTEXT.md) 为准。

## 视觉体系（三原则）

1. **壳层中性灰** — 页面 / 卡片 / 按钮底色走中性灰，不把整站泡在主题色里。
2. **彩仅点缀** — 紫系邻近色（indigo / violet / cool / rose / berry）只出现在链接、高亮、图标、竖条等点缀位。
3. **默认色相锚点** — Kraken 主紫，`siteConfig.themeColor.hue ≈ 290`（链接主色）；粉玫等作模块创意点缀；标题荧光笔可穿插 `--hl-rose`。

配置入口：[`src/config/siteConfig.ts`](../../src/config/siteConfig.ts) · [`src/config/displaySettingsConfig.ts`](../../src/config/displaySettingsConfig.ts) · [`src/config/backgroundWallpaper.ts`](../../src/config/backgroundWallpaper.ts)。

## 样式入口（`src/styles/`）

| 文件 | 职责 |
|---|---|
| `main.css` | 全局壳层、主题色变量、基础布局 |
| `variables.styl` | Stylus 变量 |
| `markdown.css` · `markdown-extend.styl` | 正文排版与扩展 |
| `expressive-code.css` | 代码块主题覆盖 |
| `layout-styles.css` · `navbar.css` · `toc.css` | 布局 / 导航 / 目录 |
| `post-card.css` · `post-card-grid-bg.css` · `post-card-letter.css` | 文章卡片变体 |
| `waterfall.css` · `tags.css` · `categories.css` | 列表 / 标签 / 分类 |
| `dynamic.css` | 动态时间线 |
| `gallery.css` | 相册 |
| `display-settings.css` | 显示设置面板 |
| `gift-surprise.css` · `announcement-press.css` | 惊喜礼盒 / 公告 |
| `site-footer.css` | 底部栏景层 |
| `banner-title.css` · `waves.css` · `curtain-focus.css` | 横幅与氛围 |
| `transition.css` | Swup / 过渡 |
| `fancybox-custom.css` · `photoswipe.css` | 灯箱 |
| `scrollbar.css` · `custom-scrollbar.css` · `widget-responsive.css` | 滚动条与侧栏响应 |
| `guestbook-cicada.css` · `anime-bangumi.css` · `text-voice.css` · `recommend-index.css` | 页面特化 |

改皮优先改配置与 CSS 变量；非必要不拆 `Layout.astro` 大文件。

## 字体

定义与选用：[`src/config/fontConfig.ts`](../../src/config/fontConfig.ts)。

| 字体 | CSS 变量 | Provider | 本站用途 |
|---|---|---|---|
| Inter | `--font-inter` | fontsource | **现行全局** `selected` |
| Zen Maru Gothic | `--font-zen-maru-gothic` | fontsource | 横幅主标题 `bannerTitleFont` |
| JetBrains Mono | `--font-jetbrains-mono` | fontsource | 代码 `codeFont` |
| GreatVibes Regular 2 | `--font-greatvibes` | local（`public/assets/fonts/`） | 装饰；构建期 `subsetFonts` |

`enable: true`；留空区域字段则回退到 `selected`。

## 代码块主题（Expressive Code）

[`src/config/expressiveCodeConfig.ts`](../../src/config/expressiveCodeConfig.ts)：

| 模式 | 主题 ID |
|---|---|
| 暗色 | `one-dark-pro` |
| 亮色 | `one-light` |

插件：折叠（默认长代码折叠）· 行号 · 语言徽章开 · 语言 Logo 关。

## 图标库（Iconify via astro-icon）

[`astro.config.mjs`](../../astro.config.mjs) → `icon({ include })`：

| 集合 | 包 | 用法 |
|---|---|---|
| **lucide**（主） | `@iconify-json/lucide` | UI 默认 |
| material-symbols | `@iconify-json/material-symbols` | 补充 |
| fa7-brands / regular / solid | `@iconify-json/fa7-*` | 品牌与经典图标 |
| simple-icons | `@iconify-json/simple-icons` | 品牌单色 |
| mdi | `@iconify-json/mdi` | Material Design Icons |
| mingcute | `@iconify-json/mingcute` | 可爱风补充 |

组件侧还可：`@iconify/svelte` · `lucide-react`（React 岛）。

## 桌宠与 PIO

| 体系 | 路径 | 状态 | 配置 |
|---|---|---|---|
| **SpritePet**（默认） | [`public/pets/`](../../public/pets/) | 现行双 DeepSeek + 访客换皮 | [`petConfig.ts`](../../src/config/petConfig.ts) |
| Live2D / Spine | [`public/pio/`](../../public/pio/) | 备选；与 SpritePet **互斥** | [`pioConfig.ts`](../../src/config/pioConfig.ts) |

SpritePet 包一览与许可：见 [`public/pets/README.md`](../../public/pets/README.md)（摘要）：

| 包 | 许可摘要 |
|---|---|
| maid-deepseek-whale / openpet-deepseek | 默认皮；许可线索见 pets README |
| diandian / claude | MIT |
| elaina / gojo | 非商业再分发已授权 |
| gpt-muse | 素材默认按 CC BY-NC 4.0 理解 |

个人博客非商业展示可接入；**商用须单独确认**。复拉可选皮：`node scripts/fetch-codex-pets.mjs`。

## 评论表情与 GIF

| 项 | 现行 | 入口 |
|---|---|---|
| 表情包 | Dynamic 回复使用 `@waline/emojis@1.4.0`：qq / weibo / bilibili / bmoji（unpkg CDN） | `commentConfig.waline.emoji` |
| GIF 搜索 | Dynamic 的 Waline 客户端默认 **Giphy** | `Waline.astro` |
| 梗图建议 | 接线、默认 `enabled: false` | `stickerSuggest` · `/api/comment-sticker-suggest` |

## 音乐素材

| 项 | 路径 / 说明 |
|---|---|
| 模式 | 默认 `local`（[ADR-0002](../adr/0002-local-music-default.md)） |
| 曲库 | `public/assets/music/`（mp3 · `cover/` · `lrc/`） |
| 清单 | [`musicConfig.ts`](../../src/config/musicConfig.ts) → `local.playlist` |
| 归因 | `public/assets/music/ATTRIBUTION.txt`（氛围曲多为 Pixabay Content License） |
| 备选 | `mode: "meting"` + 公共/自建 Meting API |

## README / project-init 配图

约定目录：[`assets/images/readme/`](../../assets/images/readme/)（≠ Astro `src/assets`）。说明见 [`assets/README.md`](../../assets/README.md)。

| 文件 | 用途 |
|---|---|
| `banner-pixel-garden.png` | README 页首横幅 |
| `features.png` | Features 能力地图（主视觉；详表折叠） |
| `integrations.png` | Integrations 现行/备选矩阵 |
| `workflow.png` | 发文 / 功能 / 交付三泳道 |
| `architecture.svg` | 架构说明图 |
| `tech-stack.svg` | 技术栈气质图（以文字表为准时可略旧） |
| `showcase-*.png` | 产品主链路真机截图 |
| 重截命令 | 先 `pnpm dev`，再 `python scripts/capture-readme-showcase.py` |
| README 本地预览壳 | 仓库根 `preview-readme.{html,css,js}` · `python -m http.server 8090` · http://127.0.0.1:8090/preview-readme.html |

本仓**无**独立 Preview 壳。

## 其它静态资源（`public/assets/`）

| 路径 | 用途 |
|---|---|
| `fonts/` | 本地字体源文件（如 GreatVibes） |
| `music/` | 本地曲库 |
| `collections/` | 合集封面图 |
| `images/widgets/calendar/` | 日历封面 GIF |
| `tag-sphere/` | 标签球星空等（见目录内 SOURCE） |
| `css/` · `js/` | Twikoo 自定义 CSS、第三方 min 脚本等 |
| `dynamic/` | 动态页静态槽位 |

内容正文配图通常随帖在 `src/content/posts/<slug>/`，不强制进 `public/`。

## 氛围与壁纸

| 项 | 配置 |
|---|---|
| 壁纸模式 / 横幅 | `backgroundWallpaper.ts`（含独立 `atmosphere`，与 mode 四选一无关） |
| Banner 氛围层 | `atmosphere`：正文区 fixed 垫底；可与 `firefly:banner-slide` 同色同频 |
| 特效开关 | `effectsConfig.ts` |
| 公告礼盒 | `announcementConfig.ts` · `gift-surprise.css` · `src/components/widget/gift/` |

## 相关

- README 总表：[Style and assets](../../README.md#style-and-assets)
- 技术栈细表：[tech-stack-inventory.md](./tech-stack-inventory.md)
- 桌宠知识：[`dual-pet-deepseek.md`](./dual-pet-deepseek.md) · [`codex-pet-picker.md`](./codex-pet-picker.md)

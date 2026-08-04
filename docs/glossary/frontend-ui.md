# 前端 UI / 布局术语表

> 依据：src/layouts、src/config、src/content.config.ts、CONTEXT.md、docs/official/。不确定处标【待确认】。

## 1. 布局术语

| 术语 | 代码 / 键 | 含义 |
|---|---|---|
| 页面壳 | Layout.astro | HTML 壳：head、主题变量、分析、Swup |
| 主网格 | MainGridLayout.astro | 导航、壁纸、侧栏、主内容、页脚 |
| 侧边栏 | sidebarConfig / SideBar.astro | left / right / both；平板 tabletSidebar |
| 横幅模式 | banner | 顶部横幅壁纸 |
| 全屏壁纸 | fullscreen | 铺满视口 |
| 透明叠加 | overlay | 背景叠加可调透明度/模糊 |
| 纯色 | none | 无壁纸图 |
| 列表/网格 | postListLayout.defaultMode | list 单列 / grid 多列；masonry 瀑布流 |
| 分类导航栏 | categoryBar | 首页/归档顶部分类快捷条 |
| 设置面板 | displaySettingsConfig | 访客外观/壁纸/特效开关 |
| 浮动控件 | FloatingControls | 回顶、TOC、回首页等 |
| 岛屿 | Svelte island | 搜索、设置等客户端组件 |

## 2. 配置文件 → 控制范围

| 文件 | 控制 |
|---|---|
| siteConfig.ts | 标题、主题色、页面开关、列表布局、分页、图像 |
| profileConfig.ts | 头像、姓名、签名、社交链接 |
| navBarConfig.ts | 导航链接与搜索 |
| sidebarConfig.ts | 侧栏位置与小组件顺序 |
| backgroundWallpaper.ts | 壁纸模式与横幅文案 |
| displaySettingsConfig.ts | 设置面板可切换项 |
| commentConfig.ts | 评论（本仓 **Waline**，`type: "waline"`；见 ADR-0001） |
| dynamicConfig.ts | 动态页 / Memos |
| friendsConfig.ts / galleryConfig.ts / sponsorConfig.ts | 友链 / 相册 / 打赏 |
| fontConfig.ts / musicConfig.ts / effectsConfig.ts / pioConfig.ts / petConfig.ts | 字体 / 音乐 / 特效 / 看板娘 / 站内桌宠 |

详解见 docs/official/ 对应章节与 src/config/README.md。

## 3. 内容集合

| 集合 | 目录 | 用途 |
|---|---|---|
| posts | src/content/posts/ | 博文 md/mdx |
| dynamic | src/content/dynamic/ | 碎碎念（勿与 bangumi mode: dynamic 或 SSR 混淆） |
| spec | src/content/spec/ | about / guestbook 等特殊页 |

## 4. 部署相关 UI

| 术语 | 含义 |
|---|---|
| site / site_url | Astro 站点基址；OG/sitemap 依赖 |
| dist/ | 构建产物 |
| CF_WORKERS | 真则启用 Cloudflare adapter；Pages/Vercel 静态勿开 |
| Pagefind | 构建后静态搜索索引 |
| LQIP | 低质量图占位 |
| siteInfo 小组件 | 侧栏展示构建平台/版本（可 FIREFLY_BUILD_PLATFORM） |

## 5. 侧栏组件 type

profile · announcement · music · categories · tags · stats · siteInfo · calendar · sidebarToc · advertisement · dynamic

## 6. 双桌宠（短条）

| 术语 | 含义 |
|---|---|
| 双宠 / SpritePet | 浏览态 Maid + 文章态 OpenPet；`petConfig` / `SpritePet.svelte`；与 Spine/Live2D 互斥 |
| 外侧留白游走 | Maid 挂侧栏卡片**外侧**（左卡左缘 / 右卡右缘），不压正文；卡间固定约 **5s**（无 jitter） |
| 拖放回游 | 仅拖拽改自由坐标；松手约 **2s** 后钻洞回卡片游走 |

详解：`docs/knowledge/dual-pet-deepseek.md` · handoff：`docs/outputs/handoff/dual-pet-deepseek/`。

## 7. 修订

- 示例文 firefly-layout-system.md 个别字段可能滞后于类型定义。【待确认】
- PAGE_SIZE 常量与 postsPerPage 关系以 siteConfig 为准。【待确认】

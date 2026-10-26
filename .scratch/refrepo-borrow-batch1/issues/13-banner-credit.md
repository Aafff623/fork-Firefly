# 13: banner.credit 图片署名配置

**What to build:** banner/壁纸图片署名：`src/config/backgroundWallpaper.ts`（或 coverImageConfig，按现有结构二选一）加 `credit: { enable, text, url }`；Layout 的 banner 角落按配置渲染一行小字（可跳转原图/画师页）；默认关闭。

**Blocked by:** None

**Status:** resolved（2026-10-27）

- [x] 配置字段上线（默认 enable: false，行为不变）
- [x] banner 角落渲染 credit 小字（含可选链接）
- [x] 开启时本地 dev 验收显示与跳转
- [x] `pnpm check && pnpm type-check` 绿

**实现记录（2026-10-27）**

- 配置落 `src/config/backgroundWallpaper.ts` 顶层 `credit: { enable: false, text: "", url: "" }`（与 `banner.position` 同层，语义就是「横幅这张图的署名」）；类型在 `src/types/backgroundWallpaper.ts` 补可选字段 `credit?: { enable: boolean; text: string; url?: string }`，不新增配置文件、不进设置注册表（符合 AGENTS.md 治理第 7 条）。
- 渲染位置：本仓横幅 DOM 在 `src/layouts/MainGridLayout.astro` 的 `#wallpaper-wrapper`（`Layout.astro` 只是外壳，没有 banner 节点），故小字挂在 `#banner-overlay-container` 末尾：`absolute bottom-2.5 right-3 md:right-6 z-30`，`text-[11px] md:text-xs text-white/70 hover:text-white`，加 `drop-shadow` 保证浅色壁纸上可读；有 `url` 时输出 `<a target="_blank" rel="noopener noreferrer">`，没有则纯文本。`enable: false` 或 `text` 为空时不输出任何 DOM。
- 验证：临时把 `enable` 改成 true + 假文案/链接，dev 下浏览器实测小字落在横幅右下角（`rect 1175.8,335.4 → 1328.9,350.2`，横幅区域 `0,0 → 1350.5,362.6`，高约 14.8px），`<a href>` 正确、`pointer-events: auto` 可点；还原默认配置后首页 HTML 中 `.banner-credit` 出现 0 次。
- 未验证：移动端窄屏与 fullscreen 模式下的观感（小字跟着 banner 容器走，理论上同位置；本轮未逐模式截图）。

**参考**：fuwari `src/config.ts:22-26`（credit 与 position 一起由 Layout 消费）；`temp/reports/batch1/fuwari-borrow.md` 第 4 条。注意：这只解决「用了别人的图要署名」，不替代图片来源合规审查。低优先。

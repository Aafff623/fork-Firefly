# 02: OG 分享卡本地字体 + takumi-js

**What to build:** 把文章级 OG 卡从「satori + 构建期 fetch Google Fonts」改为上游方案：`takumi-js/response` 的 `ImageResponse` 构建期预渲染 1200×630 PNG，中文字体从 `node_modules/@fontsource-variable/noto-sans-sc` 读 unicode.json、按 subsetOf/subsetRank 组逻辑字体族喂入（不联网）；magic-byte 格式检测 + sharp 转码兜底 + 1×1 透明 PNG 硬兜底；标题 `text-fit: grow per-line-all` 自动缩放。完成后才允许把 `generateOgImages` 默认打开。

**Blocked by:** None（但 `takumi-js` 第三方许可须先确认再入 package.json——本票开工前置）

**Status:** needs-info（前置：takumi-js 许可证确认 + 133 篇构建耗时/CF 时限评估；本轮先落 01 静态兜底）

- [ ] 确认 takumi-js 许可证可商用并记录结论
- [ ] `src/pages/og/[...slug].ts` 换 takumi-js + fontsource 分片字体加载，删除构建期 Google Fonts fetch
- [ ] 保留 meta 接线（`src/layouts/Layout.astro` 已有条件接线，确认不动）
- [ ] 本地量一次完整构建耗时（133 篇），记录数值；评估 CF 构建时限
- [ ] 抽样 3 篇文章 OG 图：中文标题无豆腐块、封面图/格式兜底路径可走通
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：上游 `temp/repos/Firefly/src/pages/og/[...slug].ts`（浅克隆本地专属；公网 github.com/CuteLeaf/Firefly 同路径）；`temp/reports/batch1/cuteleaf-firefly-borrow.md` 第 1 条。与 01 是同一痛点两档解法；本票成本中，构建耗时是主要风险。

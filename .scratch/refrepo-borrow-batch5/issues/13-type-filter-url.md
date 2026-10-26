# 13: ?type= 可分享筛选态

**What to build:** anime/相册/动态等页的筛选态同步 URL（`replaceState`，抄 Search.svelte 先例、批 1 票 10 同模式）：筛选结果可分享、可刷新保持、可外部直达。

**Blocked by:** None

**Status:** open

- [ ] 目标页筛选态 URL 同步（先 anime 页试点）
- [ ] 刷新/分享保持筛选（含初始读取）
- [ ] Swup 软导航下行为正确
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch5/antfu-me-borrow.md` 第 4 条（MediaConsumption.vue；我们 anime 页筛选纯客户端，可抄 Search.svelte replaceState 先例）。上游 `temp/repos/antfu.me/`（设计借鉴）。

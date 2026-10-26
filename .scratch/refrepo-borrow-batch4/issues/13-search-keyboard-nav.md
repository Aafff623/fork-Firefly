# 13: 搜索结果键盘导航

**What to build:** 搜索结果键盘导航：结果列表方向键上下移动 + 回车打开 + aria-activedescendant；Search.svelte 已有 Escape 关闭（line 274），补方向键导航；AdvancedSearch.svelte 零 keydown，从零加。

**Blocked by:** None

**Status:** open

- [ ] Search.svelte：方向键导航 + 回车（保留 Escape）
- [ ] AdvancedSearch.svelte：同款（含 ?q= 初始态兼容，批 1 票 10）
- [ ] aria-activedescendant + 焦点管理
- [ ] 本地键盘走查验收
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/vitepress-borrow.md` 第 3 条；已亲验 Search.svelte keydown 仅 Escape、AdvancedSearch 零 keydown（agent 表述「无任何 keydown」略糙，实质成立）。上游 `temp/repos/vitepress/`（local search 键盘导航思想）。

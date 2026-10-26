# 12: 复制追加版权

**What to build:** 选中正文复制时自动追加版权声明与原文链接：selection/copy 事件处理；**排除 pre/code 块**（复制代码不掺版权）；文案与开关可配置；移动端兼容。

**Blocked by:** None

**Status:** open

- [ ] 复制追加逻辑（排除代码块）
- [ ] 文案配置化（含原文 URL 动态拼接）
- [ ] 开关默认值定（建议开，可关）
- [ ] 桌面/移动各验证一次
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/butterfly-borrow.md` 第 7 条。上游 `temp/repos/hexo-theme-butterfly/`（思想迁移）。

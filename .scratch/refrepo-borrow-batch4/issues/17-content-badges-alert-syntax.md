# 17: 内容层小件（标题徽章 + GitHub 警报语法）

**What to build:** ① 标题徽章 Badge：frontmatter badges 字段（内容层），文章标题旁渲染；与 title-mood 展示层（列表卡 emoji）不冲突；② GitHub 风格 `> [!TIP]` 警报语法兼容：我们已有 25 种 admonition，补 GitHub 语法糖的解析兼容（映射到现有 callouts）。

**Blocked by:** None

**Status:** open

- [ ] Badge：schema 字段 + 标题渲染（样式可选）
- [ ] `> [!TIP]` 语法兼容（映射现有 admonition 风格）
- [ ] 存量 markdown 零影响
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/vitepress-borrow.md` 第 8/9 条（Badge 标题徽章——与 title-mood 展示层不冲突；GitHub 风格 [!TIP] 警报——我方已有 25 种 admonition，只补语法兼容）。上游 `temp/repos/vitepress/`（思想迁移）。

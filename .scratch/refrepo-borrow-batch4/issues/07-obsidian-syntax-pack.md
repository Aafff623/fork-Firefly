# 07: Obsidian 语法补全包

**What to build:** vault→博文流水线常用语法逐项小 remark 插件（可独立开关）：`==高亮==`、`%%隐藏注释%%`、表格转义、frontmatter `aliases`（链接可按别名解析）、wiki-link 大小写不敏感匹配。每项独立小插件，装进现有 remark 管线（与批 4 票 10 的登记表衔接）。

**Blocked by:** None

**Status:** open

- [ ] 五项逐项插件 + 开关（默认值按项定）
- [ ] aliases 接入 wiki-link 解析（大小写不敏感同理）
- [ ] 与现有 25 种 admonition/callouts 不冲突
- [ ] 每项一个用例测试
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/quartz-borrow.md` 第 6 条（Obsidian 风格 markdown 全家桶，vault→博文流水线正需）。上游 `temp/repos/quartz/`（obsidian-flavored-markdown 思想，逐项重实现）。

# 10: 文章页脚「cd ..」父级返回 + comment on intent

**What to build:** 文章页脚两个轻交互：① `cd ..` 父级返回（按当前列表上下文返回上级，而非硬编码首页）；② comment on 外链（Bluesky/Mastodon intent URL，配置开关）——站外评论入口。

**Blocked by:** None

**Status:** open

- [ ] cd .. 按列表上下文返回（来自哪个列表回哪去）
- [ ] comment on intent 链接（可配置，默认关）
- [ ] 与现有分享栏分工明确（不重复）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch5/antfu-me-borrow.md` 第 1 条（WrapperPost.vue:140-157；我们 grep 验证全无）。上游 `temp/repos/antfu.me/`（设计借鉴）。

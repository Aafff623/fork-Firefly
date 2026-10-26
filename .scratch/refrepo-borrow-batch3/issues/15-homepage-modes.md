# 15: 首页三模式配置化（Regular/Home-Info/Profile）

**What to build:** siteConfig 加 homeMode 参数开关，零代码切首页形态：regular（文章网格，现状）/ homeInfo（大标题+简介+社交按钮的信息卡式）/ profile（首页即名片，头像+简介+导航入口）。**与现有侧栏 Profile 常驻的关系要先设计**（profile 模式下侧栏卡是否隐藏，避免双重名片）。

**Blocked by:** None

**Status:** open

- [ ] homeMode 配置 + 三态布局组件（或现有首页扩展）
- [ ] profile 模式下与侧栏 Profile 的关系明确（不重复）
- [ ] 三态本地切换验收（布局/导航/SEO meta 正确）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/papermod-arch-perf.md`（首页三模式纯 param 开关零代码切换——我们 grep 验证无此开关，首页恒为文章网格，列为最值得学的一条）+ `papermod-borrow.md` 第 6 条。上游 `temp/repos/hugo-PaperMod/`（思想迁移）。

# 10: 「关闭零负担」四层防护 + 构建产物扫描

**What to build:** 功能关闭后构建产物不留残余：① 先构建扫描现状（分别关评论/音乐/桌宠等，统计产物中残留 CSS/JS 字节，记录数值）；② 按结果引入防护——重点防 Astro CSS hoist 陷阱（stylus + `is:inline` 可绕开 hoist，关掉的功能样式仍可能进包）；③ 建一条回归断言（关闭功能的样式/脚本不出现在产物）。

**Blocked by:** None

**Status:** open

- [ ] 现状扫描报告（每功能关闭前后产物差，写入本票 Comments）
- [ ] 防护落地（范围按扫描结果定，最小改动优先）
- [ ] 回归断言或门禁：关闭功能零残留
- [ ] `pnpm build` + `pnpm check:gates` 绿

**参考**：`temp/reports/batch2/shirone-borrow.md` 第 4 条 + `shirone-arch-perf.md`（L3 stylus + is:inline 绕 Astro CSS hoist，对方实测关评论仍 12KB——我们是否中招需扫描确认）。上游做法见 `temp/repos/Shirone/src/integration/`（重实现）。

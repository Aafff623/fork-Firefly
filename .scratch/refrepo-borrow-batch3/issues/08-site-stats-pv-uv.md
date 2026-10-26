# 08: 站点 PV/UV 展示 + CF Web Analytics

**What to build:** 站点访问量展示：接入 Cloudflare Web Analytics（beacon 免 cookie，我们就在 Workers 上，天然适配）；侧栏或 footer 展示组件按开关默认关。**明确不学 butterfly 把 umami token 内联进客户端**（反面教材）；token/站点 ID 只走配置或 CF 环境。

**Blocked by:** None

**Status:** open

- [ ] CF Web Analytics beacon 接入（开关默认关）
- [ ] 展示组件（PV/UV 数字，样式贴合现有 widget）
- [ ] 隐私说明（免 cookie）写入配置注释或关于页
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/butterfly-borrow.md` 第 3 条 + `butterfly-features.md`（busuanzi 位我们没有；Waline visitorCount 只是评论系统页面阅读数，不是站点统计）。上游 `temp/repos/hexo-theme-butterfly/`（思想迁移，反面教材已记录）。

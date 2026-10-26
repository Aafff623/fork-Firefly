# 17: PWA/离线（高风险，默认关）

**What to build:** manifest + Service Worker 离线访问，**默认关**。风险专项：SW 缓存失效策略、与 Cloudflare Workers/CF 响应头叠加（缓存头冲突）、版本更新提示。本票可长期 open 观望，实施前必须写专项风险清单。

**Blocked by:** None

**Status:** open（观望型，实施需另立专项）

- [ ] 风险清单：SW 缓存 × CF 头叠加 × 更新策略（先文档后代码）
- [ ] manifest + SW（默认关，配置开启）
- [ ] 离线首页/文章页可用（开启时验证）
- [ ] 更新提示不骚扰
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/butterfly-borrow.md` 第 8 条（本批最高风险：SW 缓存失效 + CF 头叠加，建议默认关）。上游 `temp/repos/hexo-theme-butterfly/`（思想迁移）。

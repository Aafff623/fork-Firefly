# 06: CDN 资产登记表（plugins.yml 模式）

**What to build:** 第三方 JS/CSS 资产总闸：`cdnConfig.ts` 配置域登记资产（名称/版本/URL/provider）；provider 支持 local/jsdelivr/unpkg/cdnjs/custom 一键切换；存量第三方资产逐步登记（先高频：katex/mermaid/fancybox 类）。

**Blocked by:** None

**Status:** open

- [ ] cdnConfig.ts 配置域 + provider 切换机制
- [ ] 首批存量资产登记（列清单，按影响面排序）
- [ ] local provider 下资产走本地 public/（构建可用）
- [ ] 登记表有测试或门禁防漂移（新资产未登记可发现）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/butterfly-arch-perf.md`（cdn.js + plugins.yml 195 行锁第三方版本，provider 一键切换；我们无此总闸）+ `butterfly-borrow.md` 第 10 条。上游 `temp/repos/hexo-theme-butterfly/`（思想迁移）。

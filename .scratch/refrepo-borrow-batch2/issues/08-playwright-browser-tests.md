# 08: Playwright 浏览器级测试体系（关键路径起步）

**What to build:** 从零建浏览器级回归：引入 Playwright（注意 `package.json` WIP），先覆盖 4 条关键路径 spec：① 首页 axe a11y 断言（与票 02 的 skip link/focus-visible 联动验收）；② 文章页 CLS 断言；③ reduce-motion 下动效降级断言；④ 评论区加载与软导航后存续断言。脚本进 package.json（`test:e2e` 类）与 CI（可后置到 09 票一起接）。

**Blocked by:** None

**Status:** open

**WIP 注意：** `package.json` 在制品中（2026-10-26 git status），加依赖前重新查 git status 或等其落地。

- [ ] Playwright 依赖与配置落地（浏览器安装方式明确）
- [ ] 4 条关键路径 spec 本地跑通
- [ ] `test:e2e` 脚本进 package.json；CI 接入可随 09 票
- [ ] 与现有 12 个 Node 行为测试分工明确（浏览器管渲染/交互，Node 管逻辑）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch2/shirone-borrow.md` 第 1 条（最高优先）+ `shirone-arch-perf.md`（66 个 node --test + 64 个 Playwright spec 的体系描述）。 Shirone 的 spec 写法可参考，但代码不整段拷（溯源陷阱，重实现）。上游浅克隆 `temp/repos/Shirone/tests/`。

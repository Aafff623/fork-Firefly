# 14: 沉浸阅读模式

**What to build:** 文章页沉浸阅读：配置项 `immersiveReading: { enable, defaultOn, tocEnabled, tocPosition }` 进 siteConfig；控件 `src/components/controls/ImmersiveReading.astro` + `ImmersiveTOC.astro`（右下角按钮进入，只留文章卡+侧边目录，其余装饰退场）；接入现有 displaySettings 设置面板做开关；布局状态类 + Swup 生命周期整合；注意与 stickyNavbar、设置面板状态一致性。

**Blocked by:** None

**Status:** needs-info（`src/i18n/**` 仍被其他 Agent 的 WIP 占用；等 i18n 落地后继续）

- [ ] 配置四字段 + 控件两文件
- [ ] 进入/退出沉浸态：装饰退场、目录保留、滚动正常
- [ ] 与 displaySettings 面板、stickyNavbar 状态一致（无冲突）
- [ ] Swup 软导航进出文章页行为正确
- [ ] `pnpm check && pnpm type-check && pnpm check:gates` 绿

**参考**：上游 `src/config/siteConfig.ts:250-259` + `src/components/controls/ImmersiveReading.astro` / `ImmersiveTOC.astro`（浅克隆 `temp/repos/Firefly/`）；`temp/reports/batch1/cuteleaf-firefly-borrow.md` 第 7 条。成本中；我们 controls 目录无对应物，属净新增交互。

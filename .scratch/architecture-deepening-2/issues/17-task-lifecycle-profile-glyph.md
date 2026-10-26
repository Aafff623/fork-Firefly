# 17: Profile / GlyphTitle 迁移到生命周期 seam

**What to build:** Profile 只保留一个页面就绪订阅，切页时清掉旧的 voice rotate 计时器；GlyphTitle 的 resize 监听接入 seam，换页后不再累积。两处都不再各自硬编码页面事件。

**Blocked by:** 02（页面生命周期补 onPageView 与 epoch token）；external：`Profile` 与 `GlyphTitleEffects` 的未提交 WIP 必须先落地

**Status:** resolved（2026-10-26；浏览器软导航无错误，soft-nav 后 post glyph 计数待复验）

- [x] Profile 只保留一个页面就绪订阅；voice rotate 旧计时器被清除
- [x] GlyphTitle 的 resize 监听由 seam 清理，不再逐跳累积
- [x] 两处都不再使用死事件名
- [x] 浏览器：连续软导航无错误覆盖；Profile voice / 桌宠正常
- [x] 行为测试或静态门禁覆盖重复注册

## Result

- Profile 改用 `onPageView(bootProfileWidget)`，voice rotate 计时器集中到 `window.__profileVoiceTimers`，每次 boot 先清空。
- GlyphTitle 改用 `onPageView(boot)`；resize 监听按元素登记 `registerPageCleanup`，保留节点切页后由 `resizeArmers` 重挂。
- 静态门禁已覆盖死事件名；冒烟首页/文章页/软导航均无 Astro 错误。
- 待复验：软导航后 `[data-post-glyph-render]` 计数为 0，直载为 1；可能与该页 WIP/内容标记有关，留验收确认。

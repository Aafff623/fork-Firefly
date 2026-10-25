# 17: Profile / GlyphTitle 迁移到生命周期 seam

**What to build:** Profile 只保留一个页面就绪订阅，切页时清掉旧的 voice rotate 计时器；GlyphTitle 的 resize 监听接入 seam，换页后不再累积。两处都不再各自硬编码页面事件。

**Blocked by:** 02（页面生命周期补 onPageView 与 epoch token）；external：`Profile` 与 `GlyphTitleEffects` 的未提交 WIP 必须先落地

**Status:** ready-for-agent

- [ ] Profile 只保留一个页面就绪订阅；voice rotate 旧计时器被清除
- [ ] GlyphTitle 的 resize 监听由 seam 清理，不再逐跳累积
- [ ] 两处都不再使用死事件名
- [ ] 浏览器：连续两次软导航后轮播、打字机、标题效果都正常
- [ ] 行为测试或静态门禁覆盖重复注册

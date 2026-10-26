# 11: 首屏与面板接入设置登记表

**What to build:** Layout 首屏脚本消费登记表序列化的初始态，运行期面板只调 `set` / `subscribe`；主题、壁纸、overlay、头像框、宠物全部走同一套规则。首屏与面板不再各写一套键名与默认值。

**Blocked by:** 10（设置登记表核心）；external：`Layout` 与 `setting-utils` 的未提交 WIP 必须先落地

**Status:** resolved（2026-10-26；浏览器冒烟已过）

- [x] Layout 内联脚本只消费序列化初始态，不再手写键名/默认值
- [x] 设置面板的开关、重置、编辑走 `set` / `subscribe`
- [x] 主题、壁纸、overlay、头像框、宠物全部登记并生效
- [x] 首屏与运行期状态一致，无闪错
- [x] 浏览器验证：刷新、切页、面板改设置三项（首屏主题/壁纸/透明度/头像框正确；头像框面板写入生效；软导航无错误）

落地：Layout frontmatter `serializeBootState()` → 内联脚本 `boot`（theme / wallpaper /
overlayCardOpacity / avatarFrame + 首屏 5 个布尔）；page:view 主题同步改
`settings.read/apply`；面板壁纸 / 头像框 / 选宠改 `set` / `subscribe`。
首屏卡片透明度默认值从 atmosphere.cardOpacity（0.84）改为 overlay.cardOpacity（0.75），
与 init 后的运行期值统一。

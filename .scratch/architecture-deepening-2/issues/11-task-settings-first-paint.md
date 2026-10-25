# 11: 首屏与面板接入设置登记表

**What to build:** Layout 首屏脚本消费登记表序列化的初始态，运行期面板只调 `set` / `subscribe`；主题、壁纸、overlay、头像框、宠物全部走同一套规则。首屏与面板不再各写一套键名与默认值。

**Blocked by:** 10（设置登记表核心）；external：`Layout` 与 `setting-utils` 的未提交 WIP 必须先落地

**Status:** ready-for-agent

- [ ] Layout 内联脚本只消费序列化初始态，不再手写键名/默认值
- [ ] 设置面板的开关、重置、编辑走 `set` / `subscribe`
- [ ] 主题、壁纸、overlay、头像框、宠物全部登记并生效
- [ ] 首屏与运行期状态一致，无闪错
- [ ] 浏览器验证：刷新、切页、面板改设置三项

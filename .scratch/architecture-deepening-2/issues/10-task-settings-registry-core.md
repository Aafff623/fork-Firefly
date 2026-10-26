# 10: 设置登记表核心

**What to build:** 一个 `settings` module：每个设置项一行登记（id、storageKey、默认值、门控、apply、事件），对外只有 `read / apply / applyAll / set / subscribe`。依赖注入 storage、root、now，纯逻辑可在 node 测试。

**Blocked by:** external：`setting-utils` 与 `simple-toggles` 的未提交 WIP 必须先落地

**Status:** resolved（2026-10-26）

- [x] 登记表行覆盖主题、壁纸、overlay、头像框、宠物、简单布尔
- [x] 五个动词的接口与错误语义（写失败返回 false）
- [x] storage / root / now 全部注入，测试不需要真实 DOM
- [x] 首屏初始态的序列化函数
- [x] 行为测试覆盖读、写、门控、写失败、订阅

落地：`src/lib/settings/registry.ts`（14 行：theme / wallpaper / overlayCardOpacity /
avatarFrame / petId + 9 个布尔）；`simple-toggles` 退化成它的视图；`scripts/test-settings-registry.mts`
接入 `check:behavior`。

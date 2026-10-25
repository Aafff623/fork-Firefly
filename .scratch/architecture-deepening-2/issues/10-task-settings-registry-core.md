# 10: 设置登记表核心

**What to build:** 一个 `settings` module：每个设置项一行登记（id、storageKey、默认值、门控、apply、事件），对外只有 `read / apply / applyAll / set / subscribe`。依赖注入 storage、root、now，纯逻辑可在 node 测试。

**Blocked by:** external：`setting-utils` 与 `simple-toggles` 的未提交 WIP 必须先落地

**Status:** ready-for-agent

- [ ] 登记表行覆盖主题、壁纸、overlay、头像框、宠物、简单布尔
- [ ] 五个动词的接口与错误语义（写失败返回 false）
- [ ] storage / root / now 全部注入，测试不需要真实 DOM
- [ ] 首屏初始态的序列化函数
- [ ] 行为测试覆盖读、写、门控、写失败、订阅

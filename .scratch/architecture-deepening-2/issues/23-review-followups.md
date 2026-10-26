# 23: 第二轮深度 review 残留

**What to build:** 收口第二轮实现里被安全 / 静默失败 / Standards / Spec 四线审查点名、但本轮不适合直接改的残留；需要平台能力或会触及产品语义的部分先记录，等园主定。

**Blocked by:** None（部分条目需要园主或部署面决策）

**Status:** ready-for-human

## 已在本轮修掉

- `readJson` 加 64KB 默认上限与流式截断，新增 `too-large` → 413；owner/post 放宽到 1.7MB。
- 评论图加同源校验、上传/删除分桶、SDK 错误脱敏；`ask` 索引故障改 503 `index_unavailable`。
- `search/ai` 补全局付费预算（300/小时/isolate）、null body 不再 500、empty/invalid 分开。
- 429 body 补中文 `message`；Waline 上传错误优先显示 message。
- `ask-index` 排除 password 文章与主题 demo。
- 限流桶超过 5000 时清扫过期键。
- SpritePet 隐藏态恢复可见时补 resume；`startPlayback` 在隐藏/暂停时不改状态。
- `page-lifecycle` 清理失败打日志；loader 的 rejected promise 不再永久缓存。
- Waline 样式/初始化失败不再永久假加载：重置 rejected promise，写可见错误态，下次可重试。
- 设置登记表 / 首屏注入 / 贴纸 429 与策略收口 / Profile 与桌宠显式锚点 / 死事件门禁均已落地。
- 验证：`astro build` 通过；`check-delivery-budget` 865 页 0 违规；`check:behavior` 13/13；`tsc` 0；`astro check` 0 errors；死事件门禁自测通过。

## 残留（需要园主 / 部署面）

- **评论图匿名上传总量**：代码只能做同源 + 进程内限流；真正的日配额/WAF 需要在 CF 侧配规则或 KV/DO 计数。
- **Supabase `getUser` 抖动被答成 guest**：已在审查中标 High；修法是把网络/5xx 区分成 503 `auth_unavailable`，会触及登录态语义，需园主确认。
- **ArticleCard 三份适配器 / pinKind 双算 / SpritePet waitMs 未清**：后续小票，不影响当前行为。
- **登录注册 `email_taken` 枚举**：产品文案决策，未改。

# 六个提交的审查收口（三线 + 自审）

Type: task
Status: claimed

## 范围

`f699323e..HEAD`：01 页面生命周期、02 设置 facade、评论图安全、检索 seam、CI 门禁、文档纠偏。
审查方式：code-reviewer / security-reviewer / silent-failure-hunter 三线独立读代码，加上我对照
`git show f699323e:` 的旧实现逐函数比对（用括号配平提取函数体，忽略空白后比较）。

## 已修（本次引入的缺陷）

1. **重复 `page:view` 会销毁当前页清理**：原实现 `viewed` 为真时调 `startPage()`，把刚挂好的
   Typewriter / Waline cleanup 一并 dispose。改为只补 controller，不再 dispose。
   同时 `onPage` 在 before-swap→page:view 的空窗期（无 controller）改为登记 cleanup 兜底，
   不再依赖不存在的 signal。测试补两条断言。
2. **无 token 仍发 DELETE**：服务端已强制 token，客户端在 `deleteToken` 缺失（升级瞬间/异常响应）
   时仍会发一个注定 403 的请求，留下无日志的孤儿。改为跳过并 `console.warn`；非 2xx 也留日志。
3. **坏百分号编码变 500**：`objectKeyFromPublicUrl` 的 `decodeURIComponent` 未捕获，
   `/comment/%` 直接 URIError。改为返回 null（403）。
4. **store 缺纵深**：`deleteCommentImageObject` 自己再校验 `comment/` 前缀与 `..`/`//`。
5. **`new-post.js` 默认 `draft: true` 是误改**：脚手架落在 `posts/`，改默认值只让新帖隐身，
   不解决草稿箱（`_draftbox/`）问题。已撤销，恢复 `false`。
6. **测试把当前配置写死**：`test-simple-toggles` 的回环断言改为跟着 `displaySettingsConfig` 的
   switchable 走——面板关掉时断言「写入无痕」，开着时断言「可回环」。
7. CI 注释两处漂移：deploy 的 v41 历史失败说明（AskChat 已白名单）、build 的「三个行为测试」（实为 5 个）。

## 核实未坏

- **R2/COS 签名**：`toHex` / `sha1Hex` / `hmacSha1Hex` / `sha256Hex` / `hmacSha256` / `encodeObjectKey` /
  `cosAuthorization` / `putObjectToCos` / `putObjectToR2` / `deleteObjectFromCos` / `deleteObjectFromR2`
  与旧实现忽略空白后**逐字一致**；新代码只有两个 kind 分发器。
- **ask-retrieve**：新旧逐分支对照，打分、limit、`urlFor` 默认值、recent / site-meta / 空结果等价。
- **setting-utils + 面板**：sakura 钉住语义、bannerCarousel 锁定仍 apply、petRoam 的 try/catch、
  cardBorder / noteCard / cardFollowTheme 的 switchable 门控均未变；9 个 id 的读、写、reset 对得上。
- **生命周期**：首屏保留 boot 清理、before-swap 与 page:view 成对、重复 boot 幂等、
  Typewriter 只在 before-swap 销毁、Waline 只断 `pendingIO` 不碰活实例。

## 残留（未修，附理由）

- **删除 token 无过期、走 query**：会进 CF/代理访问日志；泄露后可长期删该对象。改协议要同时动
  客户端与服务端，且图片可重传，暂不引入 exp/header。
- **`getDeleteSecret` 回落到存储私钥**：轮换 R2/COS 私钥即令在途 token 失效（token 只在会话内存，
  实际影响小）。若改成「未配独立 secret 就 503」，今天的 DELETE 会全线失败，需要先配 secret。
- **magic-byte 只查文件头**：相对改动前（完全不查）是净改进；结构解析 / 转码是另一个量级的工程。
- **上传无鉴权 + 进程内限流（存量）**：多 isolate 各自计数，等于免费图床的滥用面；需要
  CF Rate Limiting / Turnstile 这类平台能力，不在本轮。
- **ask 索引加载失败返回空（存量）**：`/api/ask` 会把「读不到索引」答成「站内暂无」。
- **设置写入失败时 UI 仍翻（存量语义）**：`writeBooleanSetting` 的 false 被 facade 丢弃，
  与迁移前 setter 返回 void 的行为一致。
- **`simple-toggles` 的 petRoam 默认值是 `true`，组件里 `defaultPetRoamEnabled = false`**：
  两处都无实际消费者（组件不走 facade 的默认值），属历史不一致，未动。

## 披露

- `6fe086d7` 的 `src/global.d.ts` 夹带了另一个 Agent 的两个类型声明（`__repelEngine`、`__ffBootBound`，
  BootLoader.astro / RepelText.astro 在用）。纯类型、无行为影响；提交时按文件整体 add 导致，
  未改写历史。
- 本地 `pnpm build` 会重写 `src/constants/lqips.json`（本次为他人 WIP 的 java-course 封面补条目），
  未提交，留给对应改动。

## Verification

- `pnpm run check:behavior`：5/5 PASS
- `astro check`：0 errors / 0 warnings / 10 hints
- `tsc --noEmit`：0 错
- `biome check`（本轮改动文件）：0 错
- `pnpm run build` + v41 + budget：见执行报告

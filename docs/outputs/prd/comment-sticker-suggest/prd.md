# PRD：评论区梗图联想（边打字边推）

> 状态：**approved**（2026-08-04）— 园主确认「开始 build」视同批准  
> 主题：`comment-sticker-suggest`  
> 依据：  
> - `docs/idea/comment-sticker-suggest/architecture.md`  
> - `docs/idea/comment-sticker-suggest/research-index.md`  
> - ADR-0001（Waline）· 会话调研（表情包生态 / 打字预测 / Agent+缓存对标）  
> 批准：园主确认开始实施（2026-08-04）

---

## 背景与问题

本站评论现行 **Waline**（见 ADR-0001）：

- 表情**选项卡**（qq / weibo / bilibili / bmoji）= 点开再选  
- 工具栏 **Giphy 搜索** = 主动搜动图  
- 大图走 `/api/comment-image` → 腾讯云 COS  
- [`Waline.astro`](../../../src/components/comment/Waline.astro) 已对 `textarea.wl-editor` 旁挂视觉镜像与折叠编辑器  

缺口：缺少输入法式 **「边打字 → 上方弹出匹配梗图」**。业界无博客评论开箱同构方案；本站应用**旁挂 type-ahead + L1 词表热路径 +（后期）Agent 冷路径写回**自拼，且不换评论系统、不 fork Waline。

---

## 一句话目标

访客在评论框输入中文热梗时，**热路径秒出**候选梗图；未命中且开启 Agent 时，可接受短延迟由服务端匹配并写回缓存——越喂越快，但不把模型放进每个按键的热路径。

---

## 已拍板

| # | 决策 |
|---|---|
| 1 | 评论栈保持 **Waline**；不换 Twikoo / Giscus / Artalk；不 fork `@waline/client` |
| 2 | 交互 = **旁挂 type-ahead 浮层**；不占用、不改造默认 Giphy `search` 面板 |
| 3 | 分层 = L0 会话缓存 → L1 策展词表（热）→ L3 Agent（冷，写回）；**L2 向量 = P2** |
| 4 | **P0 不上 Agent**：只交付旁挂浮层 + L1；`agentEnabled` 默认 `false` |
| 5 | 插入 = **优先 Waline 短码** `:name:`（CDN 可映射时）；否则 Markdown 图；依赖视觉镜像刷新；镜像需支持短码行内渲染 |
| 6 | 梗图 = 白名单 HTTPS URL（优先本站 COS）；禁止浏览器直调模型；禁止 Tenor |
| 7 | `stickerSuggest.enabled` 默认 **`false`**；关闭 = 与现网零行为差（回滚） |
| 8 | 大规模编码前必须本 PRD **approved**（`docs/agents/workflow.md` 门禁） |

---

## 用户故事

### 访客

1. 在文章 / 留言板等评论区展开编辑器，输入「好耶」。  
2. 停顿约 300ms 后，输入框上方出现候选梗图条（可按 Tab 应用首选）。  
3. 点击 / Tab → 正文插入短码（或 Markdown 图）→ 镜像层立刻显示行内表情。  
4. 提交后 Waline 正常渲染；仍可使用原有表情选项卡与 Giphy。

### 园主

1. 通过 PR 维护 `src/data/sticker-lexicon/zh-meme.json`（策展关键词与 COS URL）。  
2. 配置 `stickerSuggest.enabled` 控制是否对访客暴露。  
3. P1 起可选开启 `agentEnabled`，观察冷路径与限流；优质结果再 PR 进仓内词表。

---

## 范围（分期）

### P0（首期可独立上线）

- 扩展 `commentConfig.waline.stickerSuggest` 类型与默认值（`enabled: false`，`agentEnabled: false`）  
- `GET|POST /api/comment-sticker-suggest`：仅 L1 查找；`prerender=false`；独立限流  
- 客户端 `sticker-suggest/*` 旁挂：`attach` / 抽词 / 浮层 / 插入 / 会话缓存  
- `Waline.astro` 在开关开启时多一行 `attachStickerSuggest`  
- 仓内词表 ≥30 条人工中文热梗（`license: self|curated`）  
- 样式限制在 `.waline-shell` 下  

### P1

- 服务端 L3 Agent：**DeepSeek 官网直连**（`https://api.deepseek.com`，默认模型 `deepseek-v4-flash`，关 thinking）  
- 环境变量：`DEEPSEEK_API_KEY`（必填）；可选 `DEEPSEEK_API_BASE` / `DEEPSEEK_MODEL`  
- 未命中触发；硬超时；IP/全站更严限流  
- 写回：**进程内 L1′ 合并**（同实例二次热命中）；仓内 JSON 仍以 PR 策展为主  
- 模型只返回词表 `id` 列表，禁止发明外链  
- URL 白名单与输出 schema 校验  

### P2（可选，不阻塞 P0/P1）

- L2 近义 / 向量检索  
- 跨实例持久化（KV/DB）  
- 运营加词 UI；必要时抽 Svelte island  
- 词条可映射 Waline `:shortcode:`  

---

## 非目标

- 换评论系统或 fork Waline  
- 用本功能替换 Giphy / 表情选项卡  
- 每个按键实时 LLM（无防抖、无缓存）  
- 整库镜像 ChineseBQB / 不明来源热梗 CDN  
- 接入已关停的 Tenor API  
- 浏览器暴露 Agent Key（`PUBLIC_*`）  
- 改 Waline Neon schema / 评论服务端  
- 重写现有视觉镜像或折叠编辑器  
- P0 强上向量库或 Svelte island  

---

## 成功标准

### P0

| # | 标准 |
|---|---|
| 1 | `enabled: false` 时评论行为、DOM、网络请求与现网一致（无 suggest API） |
| 2 | `enabled: true` 时，展开编辑器输入词表关键词 → 浮层出现候选（≤6） |
| 3 | 点击 / Tab → 插入短码（或 Markdown）→ 视觉镜像显示图 → 提交后 Waline 卡片正常出图 |
| 4 | 打开 Waline emoji / Giphy 面板时，联想浮层不遮挡或主动隐藏 |
| 5 | L1 命中链路本机/预览 &lt;200ms 量级（无 Agent） |
| 6 | 无匹配时安静空态，不 toast 刷屏 |
| 7 | `pnpm check` 与 `pnpm type-check` 通过 |

### P1（额外）

| # | 标准 |
|---|---|
| 8 | 未命中且 `agentEnabled` 时可出现加载态，随后候选或空态；超时不打断输入 |
| 9 | 同实例对同一归一化 `q` 第二次请求 `source` 为热路径（`l1`）或等价缓存命中 |
| 10 | 无效/非白名单 URL 不得写回、不得插入 |

---

## 技术约束与落点

| 项 | 约定 |
|---|---|
| 运行时 | Astro 7 SSG + Vercel；API `prerender=false`（对齐 `comment-image`） |
| 客户端 | CDN Waline；旁挂只依赖 `textarea.wl-editor` |
| 配置 | `src/config/commentConfig.ts` + `src/types/commentConfig.ts` |
| API | `src/pages/api/comment-sticker-suggest.ts` |
| 词表 | `src/data/sticker-lexicon/zh-meme.json` |
| 模块 | `src/components/comment/sticker-suggest/` · `src/lib/sticker-suggest/` |
| 契约全文 | `docs/idea/comment-sticker-suggest/architecture.md`（API / schema / 安全 / 写回） |

### 配置草案

```ts
stickerSuggest?: {
  enabled: boolean;       // 默认 false
  debounceMs?: number;    // ~300
  minChars?: number;      // 2
  maxResults?: number;    // 6
  agentEnabled?: boolean; // P0 必须 false
  endpoint?: string;      // /api/comment-sticker-suggest/
};
```

---

## 风险与回滚

| 风险 | 级别 | 缓解 |
|---|---|---|
| Agent 费用 / 刷接口 | 高 | P0 关 Agent；P1 限流 + 超时 + 配额 |
| 浮层挡官方 popup | 中 | z-index；官方面板打开时隐藏 |
| 长文误触发 | 中 | 防抖 + minChars + 仅光标前 token |
| 版权 / 不适内容 | 中 | 人工策展；`enabled`；白名单 URL |
| L1′ 冷启动丢失 | 中（P1） | 预期写进架构；优质条目 PR 进 JSON |
| Waline class 变更 | 低 | 选择器集中；挂载失败静默 |

**回滚**

1. `stickerSuggest.enabled = false` → 完全静默（主回滚）。  
2. `agentEnabled = false` → 仅关冷路径。  
3. 紧急：移除 `Waline.astro` 挂载调用并关开关。

---

## 实施前门禁与顺序

1. 本 PRD **draft → approved**（园主确认）。  
2. 可选：`.scratch/comment-sticker-suggest/` Issue 摘录。  
3. 实施顺序：类型+开关 → API L1 → 旁挂 UI + 词表 → 本地预览验收 →（确认后）commit/push → 核线上 → P1 另开手递。  
4. 交付闭环遵循 `docs/agents/workflow.md`（本地预览 → 校验 → push → 核线上）。

---

## 关联

| 文档 | 路径 |
|---|---|
| 架构 | `docs/idea/comment-sticker-suggest/architecture.md` |
| 调研索引 | `docs/idea/comment-sticker-suggest/research-index.md` |
| ADR | `docs/adr/0001-waline-over-giscus.md` |
| 旁挂先例 | `src/components/comment/Waline.astro` |
| 上传先例 | `src/pages/api/comment-image.ts` |
| 工作流 | `docs/agents/workflow.md` |

# 评论区梗图联想 · 调研索引

> Date: 2026-08-04  
> 用途：固化业界对标结论，供 PRD / 架构引用；细节以会话调研为准，本文不重复长表。  
> 关联：`architecture.md` · `docs/outputs/prd/comment-sticker-suggest/prd.md`

## 一句话结论

公开渠道**没有**与「博客评论框 + Agent 语义匹配 + 知识资产喂养 + 热路径缓存秒出」完全同构的开箱产品。业界主流是 **L1 热词/缓存秒出 →（可选）L2 向量检索 →（可选）L3 模型/Agent 冷路径写回**。本站应自拼旁挂 UI + 词表 +（P1）服务端 Agent，而非换评论系统。

## 分层对照（业界 → 本站）

| 业界层 | 典型形态 | 本站映射 |
|---|---|---|
| L0 / 端侧热缓存 | 会话 Map、输入法本地态 | 浏览器 `client-cache` |
| L1 关键词 / 映射表 | 微信已添加表情关键字；Hike 消息→贴纸映射 | `zh-meme.json` 策展词表 |
| L2 向量 / CLIP | meme-search、StickerCLIP、V2EX 自建梗图库 | **P2**，首期不做 |
| L3 模型 / Agent | LLM emoji 推荐论文；自建冷路径 | **P1**，服务端调用，默认关 |
| 外置图库 | Giphy / Klipy / Stipop | 保留 Waline 默认 Giphy（主动搜，非 type-ahead） |

## 最接近对标（摘录）

| 名称 | 相似度 | 可借鉴 | URL / 出处 |
|---|---|---|---|
| Hike Type-ahead Sticker | 高 | 意图预测与可更新映射表拆分；热路径要低延迟 | arXiv:1902.02704 |
| 微信表情联想 | 中高 | 本地秒匹配 + 云端补发现；隐私分层 | 微信帮助中心「表情联想」 |
| neonwatty/meme-search | 中高 | 自建图库 + 向量索引（本站作 P2 底座参考） | https://github.com/neonwatty/meme-search |
| Gboard / Apple Predictive Emoji | 中 | 端侧小模型求秒出；非云端 Agent 热路径 | arXiv:1906.04329 等 |
| Waline Emoticons Search | 低～中 | **挂载点**：自定义 `search`；职责是面板搜图，不是边打边推 | https://waline.js.org/cookbook/customize/search.html |
| LLM emoji recommendation | 中 | 冷路径 prompt / 评估思路 | arXiv:2409.10760 |
| Dango（已停更） | 中（形态） | 边打边荐曾存在；易被系统键盘吞噬 | 约 2017 停更 |
| Stipop / Klipy | 中 | 外置贴纸/GIF API；非自养知识资产 | stipop.io · klipy.com |

## 明确不可用 / 已死

| 路径 | 状态（2026-08-04） |
|---|---|
| Tenor 第三方 API | **2026-06-30 关停**；Waline Cookbook Tenor 示例不可再依赖 |
| 搜狗 / 微信 / 抖音「开放平台」当站外搜索源 | 无面向博客评论的官方搜索 API |
| 博客评论区开箱 Agent 荐梗开源 | **未找到**（Waline / Artalk / Twikoo Discussions） |
| 整库 ChineseBQB 直接上生产 CDN | 版权与噪音风险；仅可参考索引结构 |

## 对评论系统的结论

| 系统 | 贴纸相关 | 本站态度 |
|---|---|---|
| Waline | `emoji` 预设 + 可插拔 `search`；本站已旁挂视觉层 | **保持**；type-ahead 旁挂，不改 `search` 职责 |
| Twikoo / Artalk | OwO 生态更丰，格式与 Waline 不同 | 学交互，不迁系统 |
| Giscus | iframe，难插贴纸 | ADR-0001 已否决 |

## 本站产品含义

1. **热路径**必须本地/词表级秒出，才能接近输入法体感。  
2. **Agent** 适合冷路径与养库，不适合每个按键满血推理。  
3. **越喂越快**靠写回 L1（及以后 L2），不靠反复推理。  
4. Waline `search` 继续服务 Giphy；边打边推是另一条旁挂链路。

## 会话产物（非仓内）

| 产物 | 说明 |
|---|---|
| Canvas：`agent-cache-sticker-benchmark.canvas.tsx` | 对标看板 |
| Canvas：`comment-sticker-suggest-architecture.canvas.tsx` | 最小侵入方案看板 |
| Agent 调研 | 表情包生态 / 打字预测 / 本站评论探索 / 对标 Agent+缓存 |

## 关联

- 架构：`docs/idea/comment-sticker-suggest/architecture.md`
- PRD：`docs/outputs/prd/comment-sticker-suggest/prd.md`
- ADR：`docs/adr/0001-waline-over-giscus.md`

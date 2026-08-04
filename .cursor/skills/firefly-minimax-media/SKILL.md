---
name: firefly-minimax-media
description: >-
  Designs artistic MiniMax prompts and generates Firefly blog media (post covers,
  short promo videos, mascot TTS/voice design, BGM) via Cursor MCP namespaces
  user-MiniMax and user-minimax-coding, or mmx CLI. Always preflight local MiniMax
  quota with scripts/check_quota.py before costly calls; download CDN URLs with
  scripts/fetch_media.py; serialize video with acquire_video_slot.py (acquire,
  mark-submit, release). Use when the user asks for card covers, 生成封面,
  MiniMax 出图/视频/配音/音乐, pet voice, quota check, or to refresh post
  `image:` assets in this Firefly repo.
compatibility: Requires Firefly project root and mmx CLI for quota script. Prefer MCP for generation. Never store API keys in this skill.
---

# Firefly × MiniMax 媒体调度

为 **本仓库** 卡片封面 / 短视频 / 桌宠配音 / BGM 设计有高级感的 prompt，并调用本机 MiniMax。

**设计铁律：**

1. **先查额度，再谈生成**（`check_quota.py`）  
2. **MCP 返回 URL 必须立刻落盘**（`fetch_media.py`）— 不要假设 `output_directory` 会写文件  
3. **视频先抢槽 → 只提交一次 → mark-submit → 只许轮询**（`acquire_video_slot.py`）  

全局 CLI 手册：`~/.cursor/skills/mmx-cli`。

## 按需阅读

| 何时打开 | 文件 |
|----------|------|
| 额度 / 权益 / 场景门槛 | [quota-routing.md](references/quota-routing.md) |
| 工具与坑 | [capability-map.md](references/capability-map.md) |
| 封面 prompt | [prompt-craft.md](references/prompt-craft.md) |
| 落盘接线 | [workflows.md](references/workflows.md) |
| Lab 两轮结论 | [lab-findings.md](references/lab-findings.md) |

## 运行时分层（必须按序）

```
0 意图：只要文案？还是真生成？
1 额度门禁     → check_quota.py --need <场景>
2 视频另加锁   → acquire_video_slot.py acquire
3 权益匹配     → 通用池% vs 视频池次数
4 场景生成     → MCP / mmx
4b 视频提交记账 → mark-submit --task-id ...
4c 视频只许轮询 → query_video_generation（禁止再 generate_video）
5 URL→本地     → fetch_media.py
6 接线 FM/HTML
7 中途复检额度
8 视频释放锁   → release
9 汇报
```

### 脚本速查

```bash
python .cursor/skills/firefly-minimax-media/scripts/check_quota.py --need image --min-percent 5 --json
python .cursor/skills/firefly-minimax-media/scripts/check_quota.py --need video --min-remaining 1 --json

python .cursor/skills/firefly-minimax-media/scripts/acquire_video_slot.py acquire --owner agent-c
# generate_video(async) → 立刻：
python .cursor/skills/firefly-minimax-media/scripts/acquire_video_slot.py mark-submit --owner agent-c --task-id <id>
# 此后只能 query；再次 mark-submit 会被拒绝
python .cursor/skills/firefly-minimax-media/scripts/acquire_video_slot.py release --owner agent-c

python .cursor/skills/firefly-minimax-media/scripts/fetch_media.py --url "https://..." --out path/to/file.mp4
```

退出码：`0` 通过 · `2` 不够/锁占用/重复提交 · `1` 工具失败。

## 硬规则

1. 付费工具须用户明确授权 + 门禁通过。  
2. 禁止写入 API Key。  
3. Skill 只在 `Firefly/.cursor/skills/`。  
4. 视频：显式 `MiniMax-Hailuo-02` + `async_mode=true`；提交后立刻 `mark-submit`；轮询阶段禁止再调 `generate_video`。  
5. 音乐：`lyrics` 必填 — 可用结构标签占位。  
6. `voice_design` 可能无 CDN — 只对 TTS URL 做 `fetch_media`。  
7. 丰富正文联用 `ob2blog`（`##` 起笔、禁 `image: api`）。

## 资产落点

| 类型 | 目录 | 接线 |
|------|------|------|
| 新帖封面 | `posts/<slug>/cover.*` | `image: ./cover.*` |
| 演示封面池 | `posts/images/minimax/v2-*.jpg` | 相对 FM |
| 桌宠音频 | `public/pets/<petId>/audio/` | `<audio src="/pets/...">` |
| 站点音乐 | `public/assets/music/` | `<audio src="/assets/music/...">` |
| 短视频 | `public/media/minimax/video/` | `<video src="/media/minimax/video/...">`；禁改壁纸 |

## 封面强制前置

```
[ ] check_quota --need image
[ ] 读帖主题；查重；选定 style-taste ID（未点名默认 03；见 prompt-craft）
[ ] 艺术 prompt（该 ID 材质/光线 + 创意/贴题或高度抽象/多要素；禁蓝紫渐变与廉价 AI 味）→ text_to_image
[ ] fetch_media 落到 cover.*
[ ] 改 FM；可选 understand_image
```

## 索引 / 章节信息图 checklist

适用于教程索引帖、目录帖的章节小长条（非卡片封面）。流程摘要见 `docs/agents/workflow.md` →「正文配图 / 索引帖信息图」；风格表见 `references/prompt-craft.md`（style-taste）；成帖 Web 化见 `knowledge-output`「配图规范」。

```
[ ] 风格：已按章选定 style-taste ID（写进本帖风格表）；禁止默认水彩/整批同材质；并发不得抄兄弟帖模板
[ ] 构图：信息图 + 主题元素；禁止「同款吉祥物只换姿势」
[ ] 参照物：官网/素材库已下载，并用于 reference / subject-ref / 构图（禁止空捏）
[ ] 按章节拆元素与指向（箭头/层级），一章一构图
[ ] 附属主题元素够大、对比够、一眼可辨（平台/渠道/Node/设备等不可缩成色点）
[ ] 主体（关键元素+信息，±吉祥物）占画面主体；留白适度，忌大面积空镜
[ ] 字与图分区：胶囊/标题不与图标插画重叠
[ ] 图内文案写要点/元素说明；禁止复读章节名或 H2
[ ] 中文策略：原生易糊则「底图无字 + 后期叠字」，叠字纳入排版
[ ] 弱相关模块：可改用免广告合规网图，不必强行主题生图
[ ] 同帖差异：封面与章节图 / 相邻章风格或色板有区分（抽查）
[ ] 落盘后核对磁盘真源再预览（防 data-store / OneDrive 旧稿）
```

**已知坑（简记）**：锁死水彩导致套图（已废止，走 style-taste）；`image-01` 中文不稳；Windows mmx prompt 编码；Astro `data-store` / OneDrive 旧预览。长工程可先落稿，不默认整组返工。

## 汇报模板

门禁、视频槽（acquire/mark-submit/release）、工具、**本地路径**、接线、结束后额度、摩擦点。

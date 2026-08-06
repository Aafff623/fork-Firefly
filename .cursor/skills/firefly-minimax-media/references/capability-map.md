# MiniMax 可调度资源（本机实测索引）

> 密钥只存在于本机配置；此处只写 **键名与路径**，永不写值。  
> 权威长文索引：`C:\Users\Lenovo\.claude\minimax-config.md`  
> 官方 Prompt 规范（2026-08-06 已装本机）：`h3-prompt-writing`（视频 H3 结构）· `minimax-music-gen`（音乐叙事句）→ 详见 `prompt-craft.md`。

## 配置位置

| 路径 | 作用 |
|------|------|
| `C:\Users\Lenovo\.cursor\mcp.json` | Cursor 全局 MCP：`MiniMax` + `minimax-coding` |
| `C:\Users\Lenovo\.mmx\config.json` | `mmx` 主认证（`api_key` + `region: cn`） |
| `C:\Users\Lenovo\minimax_mcp_output\` | MCP 默认输出基准（可被 `output_directory` 覆盖） |
| `C:\Users\Lenovo\.cursor\skills\mmx-cli\` | 全局 CLI skill（跨项目） |

MCP 启动：`uvx.exe --from minimax-mcp|--from minimax-coding-plan-mcp --with mcp<2 ...`  
Host：`MINIMAX_API_HOST=https://api.minimaxi.com`（cn）。缺 `mcp<2` 会因 FastMCP 移除而启动失败。

## MCP 工具表

### `user-MiniMax`（生成向）

| 工具 | 用途 | 关键参数 / 默认 | 注意 |
|------|------|----------------|------|
| `text_to_image` | 文生图 | `model=image-01`；`aspect_ratio`∈1:1,16:9,4:3,3:2,2:3,3:4,9:16,21:9；`n`∈[1,9]；`prompt_optimizer=true` | 付费；**仍常只返回 URL** → 立刻 `fetch_media.py` |
| `generate_video` | 文/图生视频 | 推荐显式 `MiniMax-Hailuo-02`（schema 默认名可能是 Hailuo-2.3，以能跑通为准） | 付费；`async_mode`+`query_video_generation`；6s/768P 省次；URL→`fetch_media.py` |
| `query_video_generation` | 查视频任务 | `task_id` | 异步配套 |
| `text_to_audio` | TTS | 默认 `voice_id=female-shaonv`；`model=speech-2.6-hd`；emotion/speed/pitch… | 付费 |
| `list_voices` | 列音色 | `voice_type` all\|system\|voice_cloning | 免费查询向 |
| `voice_design` | 描述生成音色 | `prompt` + `preview_text` | 付费 |
| `voice_clone` | 音频克隆 | `voice_id` + `file` + `text` | 付费；**需实名** |
| `music_generation` | 音乐 | `prompt`[10,300] + **`lyrics` 必填**[10,600]；可用 `[Intro]`/`[Verse]`/`[Chorus]` 占位；≤1 分钟 | 付费；URL→`fetch_media.py` |
| `play_audio` | 本机播放 | wav/mp3；**会出声** | 非生成 |
| `mcp_auth` | 鉴权 | — | 断连时用 |

### `user-minimax-coding`（理解向）

| 工具 | 用途 | 关键参数 | 注意 |
|------|------|----------|------|
| `understand_image` | 看图分析 | `prompt` + `image_source`（JPEG/PNG/WebP；去 `@` 前缀） | 审封面质量时用 |
| `web_search` | 网页搜索 | `query`（建议 3–5 词） | 最多约 10 条 |
| `mcp_auth` | 鉴权 | — | |

## CLI 补充（MCP 未暴露或查额度时）

`mmx quota show` / `mmx image` / `mmx video` / `mmx speech` / `mmx music` / `mmx vision` / `mmx search` / `mmx text chat`  
Agent 标志：`--non-interactive --quiet --output json`；视频加 `--async`。

## 额度（Token Plan · cn）— confirmed via `mmx quota show`

| 池 | 语义 | 典型窗口 |
|----|------|----------|
| `general` | 文本+图片+语音+音乐 **共享** token 百分比池 | 看 `current_interval_remaining_percent` |
| `video` | 海螺视频 **按次** | 约 **3 次/当前视频窗口**（≈天），周约 21 次 |

调用前对视频任务必查；不要把「每天三个视频」写死进代码，以 `quota show` 为准。

## Gaps（期望有但 MCP 未直接给）

- 无独立「额度查询」MCP 工具 → `scripts/check_quota.py` / `mmx quota show`
- MCP **不保证**写入 `output_directory` → 一律准备 `scripts/fetch_media.py`
- **MiniMax-H3** → CLI + `~/.agents/skills/mmx-cli/h3-video`
- 音乐 cover / BPM → CLI `mmx music *`
- 图片 `seed` / 精确宽高 / base64 → CLI `mmx image generate`
- `voice_clone` 未实名不可用；桌宠音频无运行时钩子

## URL 落盘（Lab 修正）

签名 URL **多数可用浏览器 UA 直接下载**（图/音/视频均已实测成功）；偶发 403 再改 CLI/`base64`。URL 约 1 天过期，**拿到立刻下**。

## 推荐调用模式

**封面**：门禁 → prompt → `text_to_image` → `fetch_media.py` → FM → 可选 `understand_image`。  
**音色**：门禁 → `list_voices`/`voice_design` → `text_to_audio` → `fetch_media.py` →（慎用 `play_audio`）。  
**短片**：`acquire_video_slot` → 门禁 → `generate_video(async)` → poll → `fetch_media.py` → `release`。

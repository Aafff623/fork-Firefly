# Skill Lab 实测发现

## Round 1（旧规范）· 2026-08-02 早

| Agent | 场景 | 门禁 | 本地落盘 | 备注 |
|-------|------|------|----------|------|
| A | 封面 | ✅ | URL 手下 | MCP 不写盘 |
| B | 语音+乐 | ✅ | URL 手下 | |
| C | 视频×1 | ✅ | curl | ~110s |

→ 已补 `fetch_media.py` / `acquire_video_slot.py`。

## Round 2（新规范）· 同日

| Agent | 场景 | check_quota | fetch_media | acquire/release | 结果 |
|-------|------|-------------|-------------|-----------------|------|
| R2-A | 纸墨封面 | ✅ | ✅ 228246B | n/a | PASS |
| R2-B | 雨夜旁白+乐 | ✅×2 | ✅×2 | n/a | PASS；voice_design 无 CDN |
| R2-C | 柔光短片 | ✅ | ✅ 430154B | ✅/✅ | **主链路 PASS**；误触第 2 次 `generate_video` → FAIL「仅一次」 |

额度：general ~67%→53%；video **2→0**（R2-C 两次提交，多烧 1 次）。

### Round 2 新缺口 → 已补

| 问题 | 处理 |
|------|------|
| 轮询时误再调 `generate_video` | 流程加 `mark-submit`；二次 mark 拒绝；SKILL/workflows 白名单 |
| `voice_design` 无 URL | 文档：只对 TTS URL `fetch_media` |
| 新脚本本身 | R2-A/B/C 证明 `fetch_media` + acquire/release 可用 |

### 样例帖（均为 `draft: true`）

- `skill-lab-r2-paper-ink` · `skill-lab-r2-rain-notes` · `skill-lab-r2-soft-light`
- Round1：`skill-lab-night-debug` · `skill-lab-pet-voice` · `skill-lab-promo-clip`

# 额度分层 → 权益 → 场景路由

Agent **任何生成调用前**先跑：

```bash
python .cursor/skills/firefly-minimax-media/scripts/check_quota.py --json
```

批量中途（每 N 张图 / 每次视频前后）可再跑一次做实时门禁：

```bash
python .cursor/skills/firefly-minimax-media/scripts/check_quota.py --need image --min-percent 5
python .cursor/skills/firefly-minimax-media/scripts/check_quota.py --need video --min-remaining 1
```

退出码：`0` 通过 · `2` 不够 · `1` 检测失败（mmx/网络）。

## 两池语义（Token Plan · cn）

| 池 | 计量 | 覆盖能力 |
|----|------|----------|
| `general` | 当前窗口 / 本周 **剩余百分比** | 文生图、TTS、音色设计、音乐、文本、看图、搜索 |
| `video` | 当前窗口 / 本周 **次数** | 短视频生成（海螺等） |

`voice_clone` 另受实名限制，与额度无关也可能失败。

## 场景匹配（专业门禁）

| 场景 | `--need` | 建议阈值 | 通过后动作 | 不足时 |
|------|----------|----------|------------|--------|
| 卡片封面 / 配图 | `image` | `--min-percent 5` | `text_to_image` | 停；汇报剩余 %；可改用已有图 |
| 桌宠/旁白 TTS | `speech` / `voice` | `--min-percent 5` | `voice_design`→`text_to_audio` | 停；勿克隆硬试 |
| BGM | `music` | `--min-percent 5` | `music_generation` | 停或改无音乐方案 |
| 短宣传片 | `video` | `--min-remaining 1` | 先告知将耗 1 次再 `generate_video` | **禁止**提交；可改静图/外链 |
| 仅写 prompt 草案 | （可跳过生成门禁） | — | 只产出文案 | — |

## 并行 Agent 注意

多 Agent 同时跑时，**通用池 % 与视频次数会被邻居拉动**。复检下降不等于自己多烧了——对照是否调用过对应工具。  
视频场景额外执行：

```bash
python .cursor/skills/firefly-minimax-media/scripts/acquire_video_slot.py acquire --owner <唯一名>
# generate_video 一次 → mark-submit --task-id ...
# 仅 query_video_generation → fetch_media
python .cursor/skills/firefly-minimax-media/scripts/acquire_video_slot.py release --owner <唯一名>
```

`mark-submit` 在 `max_submits=1`（默认）时会拒绝第二次记账，用来挡住「把轮询误做成再出片」。

## 决策优先级

1. 用户有没有明确要「真的生成」？没有 → 只做设计，不烧额度。  
2. `check_quota.py` 是否 `gate_ok`？否 → 停并说明哪一池不够。  
3. 场景选池：视频只用 `video`（先抢槽）；其它用 `general`。  
4. 同池多任务：优先用户点名主任务；封面批量每 3～5 张复检。  
5. 视频最稀缺：默认 6s / 768P；能 I2V 用已有封面就别空烧。

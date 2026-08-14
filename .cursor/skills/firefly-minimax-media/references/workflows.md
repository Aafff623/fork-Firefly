# 工作流

**所有生成流第一步**：`check_quota.py --need <场景>`。不通过则中止。  
**所有返回 URL 的生成**：立刻 `fetch_media.py --url ... --out ...`，确认本地 `bytes>0` 再接线。

## A. 批量 / 单帖封面

```
0. check_quota.py --need image --min-percent 5
1. 列 slug / title / 现有 image
2. 新帖 → posts/<slug>/cover.*
3. 选定 style-taste ID（未点名默认 03）；独立艺术 prompt（prompt-craft）；默认 aspect_ratio=16:9；n=1
4. text_to_image（可带 output_directory，但不要信任它落盘）
5. 若响应含 URL → fetch_media.py → cover 路径
6. 改 FM image:；可选 understand_image
7. 网格+瀑布看中心裁切；每 3～5 张复检额度
```

## A2. 索引 / 章节信息图（小长条）

与封面流分离。完整 checklist 见上级 `SKILL.md`；风格路由见 `prompt-craft.md`（style-taste）；门禁摘要见 `docs/agents/workflow.md`。

```
0. check_quota.py --need image
1. 起草「本帖风格表」：每章（+封面）选定 style-taste ID；禁止整帖/整批同一材质（含水彩默认）
2. 按章节列主题元素 + 下载官网/素材参照（reference / subject-ref）
3. 弱相关章 → 可合规网图直接落 images/；强相关 → 生图
4. prompt = 该章 style ID 材质/光线 + 信息图构图（箭头/层级/多要素）+ 贴题物件；底图无字（若后期叠中文）
5. text_to_image / mmx → fetch_media → posts/<slug>/images/cite-*.jpg
6. 可选后期叠清晰中文（分区，勿挡元素；勿复读 H2/章节名）
7. 核对磁盘真源后再预览；understand_image 抽查尺度/对比/留白/风格是否串台
```

## B. 短视频

```
0. acquire_video_slot.py acquire --owner <id>
1. generate_video 恰好 1 次:
   - model: MiniMax-Hailuo-02（显式）
   - duration: 6 · resolution: 768P · async_mode: true
2. 立刻 mark-submit --owner <id> --task-id <task_id>
3. 此后工具白名单仅: query_video_generation / fetch_media / check_quota / release
   （禁止再调用 generate_video —— 与 query 名字相近，易误触）
4. query 至 Success（常见 1–3 分钟）
5. fetch_media.py → public/media/minimax/video/<name>.mp4
6. 文内 <video>；禁止改 backgroundWallpaper
7. release --owner <id>
8. check_quota 快照
```

失败且确认未扣次：可 release 后停止；**不确定是否扣次时不要盲目重提**。  
若 `mark-submit` 返回已达 `max_submits`：说明已提交过，只许轮询。

## C. 桌宠 / 吉祥物音色

```
1. check_quota --need speech
2. list_voices 或 voice_design（勿 voice_clone，除非已实名）
3. text_to_audio → URL 则 fetch_media → public/pets/<petId>/audio/
4. play_audio 默认跳过（会出声）；用户要求再播
5. 未要求改代码时不碰 SpritePet API
```

## D. 背景音乐

```
1. check_quota --need music
2. music_generation(prompt, lyrics)  # lyrics 必填；纯 BGM 可用结构标签+哼鸣占位
3. fetch_media → public/assets/music/
4. <audio controls src="/assets/music/...">
```

## E. 与成帖联用

媒体齐了仍要文章像文章：正文从 `##` 起、重建干净 FM、`draft` 策略、跑 `_shared/scripts/validate_post.py`。  
Skill Lab mock 最低也要：title / draft / 一段导语 / 媒体块 / 一句验收说明。

## 失败排障

| 现象 | 处理 |
|------|------|
| MCP 工具不可用 | `mcp_auth`；Settings→MCP；确认 `mcp<2` |
| 有 URL 无文件 | `fetch_media.py`；403 再试 CLI base64 |
| 视频槽占用 | `acquire_video_slot.py status`；过期锁可被新 owner 覆盖逻辑清理 |
| content-assets 报错 | 勿删 `.astro/`；`astro sync` + 重启 dev |
| 并行额度「被偷」 | 属共享池正常；以是否调用过对应工具为准 |

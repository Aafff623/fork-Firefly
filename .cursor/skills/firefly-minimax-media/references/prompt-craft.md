# 封面与媒体 Prompt 工艺（Firefly）

目标：每张卡片一眼能读出主题，有印刷品/展览级完成度，而不是「AI 套图」。

> 2026-08-06 覆盖式重构：视频纳入 MiniMax 官方 **H3** 结构（`MiniMax-AI/MiniMax-H3` → `h3-prompt-writing`）；音乐纳入官方 **叙事句** 结构（`MiniMax-AI/skills` → `minimax-music-gen`）。图片保持 style-taste。官方 skill 已装至本机 `~/.claude/skills/` 与 `~/.cursor/skills/`。

## 用户口味硬规范（优先于一切风格实验）

1. **极具创意，拒绝廉价 AI 味** — 尤其讨厌蓝紫渐变、紫粉霓虹、通用赛博弥散光。
2. **艺术感 + 现代感** — 像展览图录 / 独立杂志插页，不像素材站模板。
3. **紧贴主题，或主题高度抽象** — 能一眼联想文章；允许隐喻，禁止跑题装饰。
4. **画面要有多种要素** — 至少 2～3 个可辨物件/材质/光影层次，忌单物件居中空镜。

概念句模板：`主题物件A + 物件B + 材质/工艺 + 光线 + 情绪 + 禁止项`。

## 风格路由（style-taste · 2026-08-06）

样张页：`Firefly/public/media/minimax/style-taste/index.html`。
**未入选（避开）**：04 瑞士海报 · 12 黏土 · 14 粗野 · 15 陶瓷。

**适用范围**：卡片封面 **与** 索引/章节信息图同一套表。封面未点名时默认 **03**；索引帖须按章显式选 ID，**禁止**把 16 水粉/水彩当整帖默认，**禁止**并发批任务共用一个材质 prompt。日历封面 / 合集卡背景命中 **17**，勿默认 03。

### 通用（生成前列选项；封面未选 → 默认 03）

| ID | 风格 | 菜单文案 | 适用主题 |
|----|------|----------|----------|
| 03★ | 编辑静物 | 印刷级静物（默认） | 几乎任意博文；失败/配置/checklist 类也稳 |
| 09 | 35mm 胶片 | 胶片纪实 | 随笔 / 旅行 / 情绪 / 视频教程 |
| 16 | 水粉插画 | 杂志风插画 | 教程 / 科普 / 产品介绍（**可选**，勿整批套用） |
| 06 | Risograph | 孔版油墨 | 创作谈 / 科技人文 |
| 10 | 剪纸拼贴 | 剪纸拼贴 | 综述 / 多概念 / 抽象杂谈 |
| 05 | 包豪斯 | 几何抽象 | 系统设计 / 高度抽象贴题 |
| 08 | 等轴微缩 | 等轴微缩场景 | 流程 / 架构 / 工具链 / MCP·部署图示 |

### 特定（命中主题直接用）

| ID | 风格 | 触发主题 |
|----|------|----------|
| 01 | 像素场景 | 像素场景 / 8·16-bit 环境 / 复古掌机 / retro game（**非**吉祥物主角） |
| **17** | **卡通人物** | 日历封面族 / 合集卡背景 / 侧栏吉祥物 / soft chibi 叠字 UI |
| 02 | 体素 | Minecraft / 方块 / 沙盒 |
| 13 | Low-poly | 低面数 / 3D 游戏美术 |
| 07 | 浮世绘 | 和风 / 浮世绘 / 日式美学 |
| 11 | 水墨 | 书法 / 古典 / 禅意 / 水墨 |

> **01 vs 17**：01 偏「像素场景/物件」；17 偏「圆润 16-bit chibi 人物 + 柔色底 + 下半留白叠字」。合集卡、日历封面族**一律 17**，不要用 01 凑合。

### 17 · 卡通人物风（标准 · 2026-08-06）

站点锚点：`docs/idea/calendar-cover/mood.md` + `public/assets/images/widgets/calendar/*.gif`；合集样张：`public/assets/collections/*.jpg`；菜单样张：`style-taste/17-chibi.jpg`。  
日历动图生成（规格 / 标杆 / 额度）以 `.scratch/gif-library/README.md` 为准；对标已上线 voxel 三张，不要对标工作室白底干净道具。

**气质**：`soft · pixel · chibi · calm · UI-banner-safe`（非写实、非赛博、非黏土）。

#### Prompt 结构（按序拼接，英文主体 + 可选中文补钉）

| 段 | 必填 | 写什么 |
|----|------|--------|
| A 画风锁 | ✓ | `soft 16-bit pixel art, cute chibi character, rounded pixel edges, gentle anime-pixel look` |
| B 人物变体 | ✓ | 发型/发色/服装 1 句（同族可换变体，忌换画风） |
| C 主题道具 | ✓ | 1～2 个可辨物件，贴合合集/栏目主题（勿堆满） |
| D 构图 | ✓ | 人物偏**上半**；**下半柔色留白**供叠标题；主体居中略上 |
| E 色板光感 | ✓ | soft pastel / muted sky；克制点缀；忌高饱和霓虹 |
| F 媒介 | ✓ | 合集/静封面：`static illustration`；日历动图另走视频→GIF，仍锁本画风 |
| G 禁止尾 | ✓ | 见下方固定尾句 |

**模板**（合集卡 / 叠字横幅 · `aspect_ratio=4:3` 或 `16:9`）：

```
soft 16-bit pixel art, cute chibi character, [hair/outfit variant],
holding or beside [1–2 theme props], calm gentle expression,
character in the upper half of the frame, soft pastel [sky/room] background,
empty soft lower half reserved for UI text overlay, calendar-banner-safe composition,
rounded pixels, cozy and readable, static illustration,
no text, no watermark, no logo, no UI chrome, no photorealism,
no purple neon glassmorphism, no dense clutter in the lower half
```

中文可补钉（勿替代英文主体）：`柔和像素卡通人物，上半角色下半留白叠字，静帧，无文字无水印`。

#### 硬规范

1. **人物优先**：画面主角必须是 chibi 人物，不是空场景（空场景改用 01/03）。
2. **同族可变体**：发色/服装/道具可换；禁止漂成写实、3D 黏土、赛博霓虹。
3. **叠字安全区**：下半约 40～50% 保持柔、空、低对比；标题叠在卡上仍可读。
4. **道具克制**：1～2 件主题物即可；禁止下半堆道具抢字。
5. **合集卡用静图**：落盘 `jpg/png`，不要用 GIF 当合集背景。
6. **`prompt_optimizer`**：若漂成通用二次元厚涂或霓虹，改 `false` 重跑并收紧 A/G 段。
7. **与索引信息图区分**：章节信息图仍禁「同款吉祥物只换姿势」；17 专用于日历/合集/侧栏吉祥物位。

#### 质检（17 专用）

1. 一眼是「软像素 chibi」，不是照片、厚涂插画或 01 夜写字台场景？
2. 主题道具能否对应栏目（合集 slug / 日历气质）？
3. 下半是否够空、叠字后对比够？
4. 有无文字/水印/UI 框/紫霓虹？

## 布局与比例

站点默认 **`grid`**（`PostCard` 封面约 **`2:1`** + `object-cover`）。列表模式普通行不显示封面。

| 展示模式 | 裁切行为 | 生图建议 `aspect_ratio` |
|----------|----------|-------------------------|
| grid（默认） | 顶栏约 2:1 | **`16:9`**（最稳） |
| waterfall 默认 | 4:3 | `4:3` |
| waterfall `3n+1` | 16:9 | `16:9` |
| waterfall `3n+2` | 1:1 | `1:1` |
| waterfall `3n+3` | 3:4 | `3:4` |

主体必须 **耐中心裁切**（安全边距，避免贴边关键细节）；长边建议 ≥1280px。封面勿烧字。

## 一帖一概念

生成前用一句话定概念：`主题物件 + 材质/工艺 + 光线 + 情绪 + 禁止项`。

| 帖主题类型 | 概念方向示例 |
|------------|--------------|
| 代码 / MDX | 精密仪器台面、半透明树脂铸件里的符号碎片、冷白顶光 |
| 加密 / 安全 | 折叠金属信封、蜡封几何、雾面保险柜细节（勿锁+二进制烂梗堆砌） |
| Mermaid / 图示 | 纸上墨线建筑平面、针管笔阴影、少量色块标注 |
| 视频教程 | 胶片片门 + 柔和放映光斑，偏摄影棚静物 |
| 数学 KaTeX | 粉笔尘、石板曲线、黄铜尺规静物 |
| Firefly 品牌向 | 暖金萤火、深林夜色、克制光点——**不要**紫粉霓虹玻璃 |

## 必含的高级感约束（写入 prompt 尾部）

**静物/编辑向**（03 等）英文尾句可复用：

```
editorial still life, museum catalog photography, tactile materials,
controlled color grading, shallow depth of field, no text, no watermark,
no logo, no UI mockup, no purple neon glassmorphism, no generic AI cyber glow
```

中文可加：`印刷级静物摄影，克制配色，真实材质，无文字无水印`。

**17 卡通人物**勿套上面静物尾句；用专节「G 禁止尾」与模板末段（`static illustration` + `calendar-banner-safe` + 下半留白）。

## 明确禁止（用户已踩过的坑）

- 紫色 / 靛蓝玻璃拟态、弥散光球、通用赛博城市
- 同一批封面共用同一构图（对称玻璃球居中等）
- 画面内大段英文标题或博客 UI
- 为「好看」牺牲主题可读性

若 `prompt_optimizer=true` 后风格漂移变套图：关闭优化器（`prompt_optimizer=false`）重跑，或收紧材质/色板描述。

## 质检（生成后）

对落盘文件调用 `user-minimax-coding` → `understand_image`，检查：

1. 能否从画面猜出文章主题？
2. 是否出现紫玻璃 / 霓虹套话？
3. 主体是否被裁切危险区挡住（边缘 10%）？

不合格则改 prompt 重生成，勿用劣图硬接线。

---

# ✦ 视频（H3 / Hailuo）—— 官方结构

> 权威实现：本机 `h3-prompt-writing` skill（`MiniMax-AI/MiniMax-H3`）。生成前可让 Agent 读该 skill + `references/base-en.txt` / `ref-en.txt`。
> 把 prompt 当**制片简报**：角色、动作时序、运镜、光影、声音、约束一次钉死，减少废片。

## 五模式（先判定输入类型）

| 模式 | 含义 |
|------|------|
| **T2VA** | 文生视频：从文本构建完整音视频时间线 |
| **I2VA** | 首帧生视频：从第一帧向前发展 |
| **FL2VA** | 首尾帧生视频：描述首尾之间的连续路径 |
| **L2VA** | 末帧生视频：推断合理开场并收敛到末帧 |
| **Ref2VA** | 全参考（图+视频+音频 ≤~12 文件）：六段重写格式 |

## Base 模式三字段（按序，必填）

```
integrated_multimodal_description   # 主体叙事：每镜头 = 构图 + 主体 + 环境 + 动作 + 运镜 + 声音 + 参考出现点
overall_soundscape                  # 整体音景：环境音 / 空间混响 / 层次
non_diegetic_music                  # 画外音乐：情绪 / 配器 / 节奏，与画面平行
```

## Ref2VA 六段（按序）

```
subject_definitions   # 每个参考主体的职责定义
summary               # 需求摘要
retention_analysis    # 保真分析：哪些参考特征必须严格保留
detailed_description  # 逐镜头详述（构图/主体/环境/动作/运镜/声音/参考点）
overall_soundscape
non_diegetic_music
```

## 参考职责分配（最关键）

明确每张图/每段视频/每段音频**干什么**，比堆图有效得多：

```
参考图1 → 定胶片质感与场景基调
参考图2 → 主角身份（同一张脸、同一发型、同一服装结构全程不变）
参考图3 → 产品细节 / 道具
参考音频 → 环境声或节奏轨
```

**图生视频时**：prompt 只写「运动 + 运镜 + 变化」，**不要重复描述图片已有的外观**。

## 时间线节拍（按秒切动作）

一次只主导一个主要动作，按时间戳切，避免塞太多动作：

```
0-4s： 超微距开场，一滴水珠悬浮，镜头缓慢后拉
4-9s： 人物抬手，指尖抽出丝带，丝带旋转折叠成文字
9-13s：空间扩展成画廊，水彩渗入服装但不改变版型
13-15s：镜头被丝带拉升，定格成高级时装海报构图
```

复杂叙事用**分段生成再剪辑**，不要一镜到底硬塞长剧情。

## 声音轨（H3 原生生成音频，必须写）

不写声音轨，模型会自己猜。三轨建议：

```
对话（若有人声）→ 语气 / 台词（保留原文语言，不改写）
音效 / 环境音 → 具体（水彩流动、雨滴、布料摩擦）
音乐 → 情绪 + 配器 + 节奏（见下方音乐节）
```

## 负面锁定（视频版）

社区点名雷区，全部写进限制：

```
严格一镜到底（如需）禁止剪辑跳切
禁止换脸 / 身份漂移 / 服装变形
禁止畸形手 / 多余肢体 / 荧光色 / 塑料皮肤
禁止任何字幕 / Logo / 水印 / 中文字符（除非剧情要求）
身份与服装全程一致
```

## 社区高级模板（可直接改主体）

### 品牌 / 时尚广告型（9:16 竖屏）

```
制作一支 15 秒、9:16 竖屏高级时尚广告。整体氛围、胶片质感与冷感色调严格参考图1；
人物外形与服装细节锁定参考图2（同一张脸、同一发型、同一服装结构全程不变）；产品细节参考图3。

[0-4s] 超微距开场，一滴透明水珠悬浮，倒映人物轮廓，镜头缓慢后拉。
[4-9s] 人物轻轻抬手，指尖抽出透明水彩丝带，丝带围绕身体旋转并折叠纸张，形成立体文字。
[9-13s] 空间扩展成纸艺画廊，水彩自然渗入服装但绝不改变版型与颜色结构。
[13-15s] 镜头被丝带向上拉升，最终定格成高级时装海报构图。

视觉：前卫高级时装编辑风格，博物馆艺术装置感，真实纸纤维与水彩物理扩散、
表面张力、颗粒沉积。超写实电影光影，克制高级。
声音：全程极低环境音 + 水彩流动细微声，结尾一声轻脆定格音。无歌词人声。
限制：严格一镜到底，禁止剪辑跳切、换脸、服装变形、畸形手、多余肢体、
荧光色、塑料皮肤、任何字幕/Logo/水印/中文字符。身份与服装全程一致。
```

### 电影感一镜到底 + 物理真实

强调「真实物理」「同一身份锁定」「时间戳节拍」+ 明确负面。长提示词对 H3 的一致性与质感提升非常明显。

## 运镜控制

- 较老 Hailuo 模型：描述后加 `[推进]` `[左摇,上升]` `[跟随]` 等括号指令（一组 ≤3 个，顺序生效）。
- **H3**：更偏向**自然语言描述运镜**（"镜头缓慢后拉"），少用括号指令。

## 视频生成参数（本机）

```
model: MiniMax-Hailuo-02（H3 就绪后改用 H3）
duration: 6（先 6s 验证结构，再拉长）
resolution: 768P（省次数）
async_mode: true
```

额度：视频按次计（约 3 次/天窗口），生成前必跑 `check_quota.py --need video`。

---

# ✦ 音乐（Music 2.0）—— 叙事句结构

> 权威实现：本机 `minimax-music-gen` skill（`MiniMax-AI/skills`）+ `references/prompt_guide.md`。
> 核心原则：**写生动完整的叙事句，不是逗号标签**。把 prompt 当给音乐人的创意简报。

## 结构（一个完整句式，按序）

```
A [情绪/风格 mood] [BPM] [流派 genre+sub-genre] [song/piece/track].
[人声描述 OR "Instrumental with..." 纯器乐描述].
[叙事/主题 —— 这首歌关于什么].
[氛围/场景 atmosphere].
[关键乐器与制作元素 production].
```

## 官方示例

**人声（情绪对立 + 角色化人声 + 主题 + 场景）**：

```
A melancholic yet defiant Pop-House song, featuring emotional vocals,
about lighting a torch in the cold dark night as a form of romantic rebellion,
energetic rhythm with synth elements.
```

**纯器乐（情绪 + BPM + 场景 + 精确乐器）**：

```
A warm and uplifting 100 BPM indie folk instrumental piece, evoking a sunny
afternoon stroll through a small town market, featuring bright acoustic guitar
fingerpicking, gentle ukulele strums, light hand claps, and a whistled melody
that feels like pure contentment.
```

## 分步构建

1. **开头 = 情绪 + 风格（必填）**：可加 BPM、年代/地域、风格融合（"contrasting moods"）。
2. **描述人声（具体化）**：`Sultry, sophisticated male baritone with jazz inflections`，**避免** "female vocal"。
3. **加叙事/主题**：人声歌写"关于什么"；纯器乐描述场景（"evoking a sunrise drive along a coastal highway"）。
4. **设定氛围**：如 "bittersweet but healing mood"。
5. **指定制作元素**：挑 2-3 个关键乐器写精确，其余交给模型。

## 常用技巧

- 完整句子优于标签：`A melancholic R&B song about...` > `R&B, sad, slow, piano`
- 具体生动：`salvaging memory fragments in space-time` > `sad memories`
- 把声音写成角色：`Sultry baritone with jazz inflections` > `male vocal`
- 给一个场景/世界观：`A high-end rooftop lounge at night` 让模型有一致世界
- **英文提示效果最好**；中文场景描述可混入增加风味
- 纯器乐：人声位置换成「乐器焦点 + 场景叙事」

## 速查

- **Genre 九类**：Pop & Dance / Rock & Alt / R&B-Soul-Funk / Hip-Hop / Electronic / Folk-Acoustic / Jazz-Blues / Classical / World
- **BPM 档位**：40-60 冥想 / 60-80 慢歌谣 / 80-110 中速律动 / 110-130 活力 / 130-160 驱动
- **人声风格**：smooth emotional / raw unpolished / breathy intimate / powerful soulful / sultry sophisticated / ethereal clear / aggressive intense
- **乐器**：吉他贝斯、键盘合成器、鼓组打击乐、管乐、质感音效（vinyl crackle / ambient pads / rain sounds）

## 本机 music_generation 参数

```
prompt: 上述叙事句（英文优先）
lyrics: 必填 [10,600] —— 可用 [Intro]/[Verse]/[Chorus] 结构标签占位；纯 BGM 可极简哼鸣
```

---

# ✦ 语音 / 桌宠

- **桌宠配音**：先人物设定（年龄感、气息、语速），`voice_design` 的 `preview_text` 用一句站内口头禅试听。
- `list_voices` / `voice_design` → `text_to_audio` → `fetch_media.py` →（慎用 `play_audio`）。
- `voice_clone` 需实名，未实名勿硬试。

---

## 参考

| 源 | 位置 |
|---|---|
| H3 官方 skill | `~/.claude/skills/h3-prompt-writing/` · `~/.cursor/skills/h3-prompt-writing/` |
| Music 官方 skill | `~/.claude/skills/minimax-music-gen/` · `~/.cursor/skills/minimax-music-gen/` |
| H3 测试池 | `awesome-minimax-h3-prompts`（120+ 条，按场景分类） |
| 全局索引 | `~/.claude/minimax-config.md` |

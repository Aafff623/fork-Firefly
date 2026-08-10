---
name: knowledge-output
description: >-
  把 knowledge-extract 提炼出的素材笔记
  （位于 D:\OneDrive\Desktop\Knowledge\todo\{Theme}\{facet}\{时间戳_短题}\，
  兼容历史扁平 todo\{时间戳_主题}\）
  输出成 Firefly 博客文章，落盘到 src/content/posts/{slug}/，发布成功后将素材移入 Knowledge\Archive\ 留档。
  触发词：发布笔记、把知识笔记发到博客、knowledge output、素材转博客、提取完发出去、把 todo 里的笔记写成博客文章。
  调用方式：无参数 = 处理 todo 全部主题；带参数(/knowledge-output {主题A} {主题B}) = 只处理指定主题。
  区别于 ob2blog(Obsidian vault → 博客)：本技能源是 Agent 自行总结的素材笔记(非 Obsidian vault，
  无 wiki 链接/附件映射/manifest 一致性)。任何「把 Knowledge 素材笔记变成博客成品帖」的诉求触发本技能。
  用户若同时要求「在动态里加内容/发条动态」，改用独立的 dynamic-post 技能发布。
compatibility: 需在 Firefly 项目根(含 src/content.config.ts)下执行；Python 3 stdlib；复用 ob2blog 的
  frontmatter 模板与 validate_post.py。产出后收尾调用 site-cascade。
---

# knowledge-output — Knowledge 素材笔记 → 博客文章

把 Agent 提炼好的知识素材，加工成可发布的 Firefly 博客帖。素材已是结构化的草稿，本技能负责**补全成帖要素 + 落盘 + 校验 + 级联索引**，不做二次提炼。

## 与 ob2blog 的边界（先说清）

| 维度 | ob2blog | knowledge-output（本技能） |
|---|---|---|
| 源 | Obsidian vault `D:\...\Notes\threetwoa_ob` | `D:\OneDrive\Desktop\Knowledge\todo\…` 素材笔记 |
| 依赖 | wiki 链接 `![[…]]`、附件映射、manifest 一致性 | 无；素材是独立 md + 可选 assets / source |
| 真源约束 | Obsidian = 真源，双边同步 | 素材即草稿；博客落盘后素材可留档 |
| 复用 | — | 复用 ob2blog 的 frontmatter.yaml + validate_post.py |

两者互补不冲突：**extract 产出素材 → output 产出成品 → 走 site-cascade**。

素材库 Theme/facet 与来源索引真源：`knowledge-extract/references/theme-taxonomy.md`、`source-modules.md`（含 `wechat`）。

## 输入 / 输出

- 输入（优先新规范）：
  `D:\OneDrive\Desktop\Knowledge\todo\{Theme}\{facet}\{时间戳_短题}\{短题}.md`
  + `assets/`（笔记图）+ 可选 `source/`（公众号等原文，**成帖默认不整篇搬进 posts**，除非用户要求保留附录）
- 兼容输入：历史扁平 `todo\{时间戳_主题}\{主题}.md`
- 输出（分流）：
  - **正式发**：`src/content/posts/{slug}/index.md` + `cover.*`(可选) + 附件拷贝
  - **草稿箱**：`src/content/posts/_draftbox/{slug}/`（本地预览、**不 git add / 不 push**；见下「草稿箱」）
- 收尾：正式发才跑 `site-cascade`（最新动态/统计/分类标签/热力图）；草稿箱不 emit 公开动态
- 归档：每**正式发布成功**一个主题，将该**单篇目录**从 `todo\…` 移入 `Archive\{Theme}\{facet}\…`（无 Theme 的旧扁平稿可仍入 `Archive\` 根）；内容不改写

## 调用方式

- `knowledge-output`（无参数）：递归遍历 `Knowledge\todo\` 下**全部**单篇目录（含 `{Theme}/{facet}/…` 与扁平遗留），逐个发布
- `knowledge-output {主题}`（带一个或多个主题名）：只处理匹配的主题

匹配规则：参数可以是完整单篇目录名（如 `2026-08-05_Matt-Pocock-工程方法论`）、Theme ID（如 `claude-code`）、facet、或短题子串（如 `Matt-Pocock`）；多个参数逐个匹配。无匹配时列出 todo 现有 Theme/单篇供用户确认。批量处理按路径序逐个执行，单个失败不阻断其余。

## 工作流（六步）

```
1 选材    → 按调用方式从 Knowledge\todo\ 递归定位素材（无参数=全部；有参数=仅匹配），
            读文首 YAML / @knowledge 的 source·theme·facet；确认内容完整度(缺关键结论先回 extract 补齐)
2 定稿    → 读素材主体（非 source/ 原文）；按 humanizer-tta 校准语气；拆长文为可读章节；
            **成稿后强制过一遍 humanizer-tta（Depointify 去 AI 味，50 分评分 ≥45 才放行）**；再过「成帖红线」(见下)
3 成帖    → 补 frontmatter(参考 ob2blog/assets/templates/frontmatter.yaml)：
            title/published/description/tags/category/slug/image/draft/lang/pinned/comment
            slug 必须英文 kebab(小写字母数字连字符)，中文标题手传
            **category 门禁**：对照 CONTEXT.md「现行分类词表」；可参考 Theme→category 启发式
            （theme-taxonomy.md），素材 `@blog` 已写死则采纳，
            否则列出候选（既有 ∪「新建：名称」）**向用户确认后**才写；未确认不得落盘。
            禁止因「AI/工具」一律填 Agentic Coding。
4 落盘    → 建 src/content/posts/{slug}/；正文写 index.md；assets 图拷到 ./images/(ASCII 名)
            并改写引用，封面另拷 cover.jpg 写 FM（不进正文），图按「配图规范」统一 Web 化。
            跳过 prep_convert/sync_check(它们强依赖
            Obsidian vault，本场景无 manifest)
5 校验    → python .cursor/skills/ob2blog/scripts/validate_post.py src/content/posts/{slug}/index.md
6 收尾    → 调 site-cascade（公开帖 `--emit-dynamic`，推荐 `--blurb "作者批注"`；未传则用 description）；提示用户 pnpm dev 预览；未获准不 commit/push
6b 动态同步（可选）→ 用户若要求「同时在动态里加内容」，改用独立的 `dynamic-post` 技能发布
7 归档    → 每发布成功一个单篇，将其目录从 todo 树移入 Archive（保留 Theme/facet；原样留档）；失败/未发布不移动
```

笔记型动态正文须含 `>` 批注块（见 `site-cascade`）；勿只 emit 单行「发布了新笔记」。

## 动态同步（可选，引用独立技能）

用户调用本技能时若**显式要求**在动态流补充内容（「发帖同时在动态里说……」「动态里顺便发张图」），改用独立的 **`dynamic-post`** 技能发布那条自定义动态——它熟悉动态全链路（schema / API 图片抽取 / kind 启发式 / 配图缩略图规范）。未提则只走 site-cascade 的默认「新笔记」动态，不额外发。

## 成帖红线（素材进博客前最后一道）

成稿后先按 humanizer-tta（Depointify 模式）过一遍去 AI 味，50 分评分 ≥45 才允许发布；然后逐条过下方红线。素材经过 extract 提炼，但成帖前再扫一遍，别把 AI 味带上线：

1. **文章标题像人起的**：口语化、有钩子；禁「XX 实录 / XX 清单 / 这篇在讲什么」类手册腔。列表卡情绪点缀（emoji / 颜文字）由站点 `title-mood` **仅展示层**动态挂；**禁止**写入 frontmatter `title`（正文 H1 / RSS / OG 保持干净）。中立标题不装饰；同批邻帖应错开 emoji 与颜文字（实现按 post id 哈希）。
2. **小节标题（H2/H3）也要像人起的路牌**（园主硬偏好）：创意一点、通俗一点，带现场感；**禁止**课件/ChatGPT 收尾目录腔。  
   - **重灾禁词**：`一句话收束` / `一句话结论` / `一句话总结` / `总结一下` / `小结` / `核心要点` / `关键收获` / `综上所述` / `写在最后` / `结语` / `Key Takeaways` / `In conclusion` / 空心的 `概述`/`深入探讨`/`未来展望`。  
   - **正例气质**：`认清撞上哪一层就行`、`踩坑现场`、`先把段子拆开`、`适合谁 & 我的判断`（判断/边界/怎么选，而不是「收束」）。  
   - **成稿必扫**：全文搜 `一句话`、`收束`、`总结`、`要点`、`综上所述`；命中作标题就改名。范例库见 [`references/heading-anti-ai.md`](references/heading-anti-ai.md)。
3. **无「一句话 X」句式（正文标签也清）**：「一句话结论 / 一句话总结 / 一句话说」这类标签清零；要表达就直接给判断，别先贴标签。
4. **无工具流程痕迹**：不提「调用了 skill / 脚本 / 子代理」，不留「需要清理时说一声」样板话术。
5. **详略得当**：正文服务博客读者，删过程性信息，只留可带走的判断和数据。
6. **英文 em dash（—）归零**；中文破折号「——」属正常排版不受限；颜文字自然融入，不放代码块内。
7. **半角冒号避雷（Firefly 引擎硬规则）**：站点渲染引擎会把正文半角冒号 `:` 后的内容解析成 HTML 标签（`13:06` → `<06></06>`，`第一幕:午后` → `第一幕<午后></午后>`）。正文一律用全角冒号「：」；frontmatter 不受影响。**发布前必须 curl 渲染 HTML 扫一遍**，确认无 `<数字>`/`<中文>` 形式的标签残留。
8. **实录类内容保留原文精华**：群聊/对话/访谈类成帖，经典的发言、观点交锋必须原样保留（可脱敏、可修正拼写），点评退居幕后；不得用抽象总结替代实录原文。

## 配图规范

- **正文显示（站点）**：默认跟内容栏宽（信息密度高的横/方图不压）；仅竖幅/竖海报等比例限高。单击 Fancybox，`Esc` / 点留白关闭。细则与好例见 `docs/agents/workflow.md`「正文插图显示」。成帖不要用 HTML 强行拉满；原图可保留较高像素供灯箱。
- **Mermaid**：正文流程图默认横版（`flowchart LR`）；组内可竖、整图竖仅当横版过长。细则见 `docs/agents/workflow.md`「版式：横版优先」。
- **封面**：优先用素材 `assets/` 里的达标封面；没有或不合格，按 `knowledge-extract` 的配图规范 + `firefly-minimax-media`/`prompt-craft` **style-taste** 用 MiniMax 生成（未点名风格默认 03 编辑静物；抽象主题用具象符号、克制配色、留白 ≥20% 给标题、生成后集中质检），不合格重生成。统一存 `cover.jpg`（模板示例的 `cover.webp` 不强制，实现以 `cover.jpg` 为准）。
- **小节图**：素材 `assets/` 图拷到 `images/` 并改写引用（`./images/fig-*.jpg`）；缺图不硬凑。
- **Web 化**：所有图转 JPG；RGBA 先压平（贴深色底）；超 ~1.5MB 的大图降宽到 ~1600px 再存；像素图缩放用最近邻（ffmpeg `scale=...:flags=neighbor` 或 PIL `Image.NEAREST`）。封面只在 FM `image` 字段，不重复进正文。
- **质检**：封面 / 配图逐张 review（布局错乱？对比度暗淡？主题一眼可读？图标可辨？）；本地预览确认竖图未撑满视口。宁缺毋滥。

### 索引帖 / 章节信息图（补充）

教程索引、目录帖的章节配图走信息图逻辑，不走「吉祥物换姿势」。**画风必须走 style-taste**（与封面同一套路由表），禁止整帖水彩/同材质套图。

生图操作与 checklist：**`firefly-minimax-media`**（「索引 / 章节信息图 checklist」+ `prompt-craft` 风格路由）；流程摘要：**`docs/agents/workflow.md`** →「正文配图 / 索引帖信息图」。

| 检查 | 要求 |
|---|---|
| 风格 | 每章（及封面）有明确 style-taste ID；内容适配（工具链≠插画默认）；同帖宜有差异 |
| 元素尺度与对比 | 附属主题图标够大、够清楚，一眼能认出是什么 |
| 留白 | 主体占画面主体；忌大面积空镜 |
| 字图 | 分区排版，文字不压图标/插画 |
| 文案 | 图内不写重复的章节名/H2；写要点或元素说明 |
| 参照 | 优先官网/素材库 reference，禁止空捏 |
| 网图 | 弱相关模块可用合规免广告网图，不必定制生图 |
| 中文 | 可「无字底图 + 后期叠字」；叠字参与排版 |
| 返工 | 长工程可先落稿；不默认因观感挑剔整组重做 |

## 草稿箱（本仓「草稿」真义）

园主定义：**草稿 = 本地可 `pnpm dev` 预览调试，但不入库、不 push**。  
不要把「只设 `draft: true` 却 commit 进 `posts/<slug>/`」当成默认草稿——那只会藏生产首页，文件仍会到远端。

| 动作 | 落盘 | Git / 级联 |
|---|---|---|
| 用户说草稿 / 草稿箱 / 先本地调试 | `_draftbox/<slug>/`，`draft: true` | **禁止** add 正文；不 emit 动态 |
| 用户说出箱 / 可以发了 | 迁到 `posts/<slug>/`，通常 `draft: false` | validate → site-cascade → 确认后 push |
| 主题 demo（少见） | 已跟踪的 `posts/draft.md` 一类 | 与草稿箱无关，勿混用 |

约定真源：`AGENTS.md`「草稿箱」· `docs/agents/workflow.md` · `_draftbox/README.md`。

## 硬规则

1. **默认正式发 `draft: false` 且落 `posts/<slug>/`**：素材已过提炼关。用户明确要求草稿 / 草稿箱 / 先本地调试，素材含敏感/口令，或素材标明 **BibiGPT / `bibigpt` / 公众号 / `wechat` 来源**（园主默认先本地预览）→ **进 `_draftbox/`** 且 `draft: true`，不得 push 箱内正文。
2. **重建 frontmatter**：不沿用素材里的临时字段（可保留对 `source`/`theme`/`facet` 的引用到描述或 `@blog`）；`slug` 用英文 kebab（小写字母数字连字符）。单篇目录名若本身 ASCII（如 `2026-08-01_foo`）则取去时间戳部分；否则按主题语义手取英文 slug（如「ClaudeCode的Windows美化与配置」→ `claude-code-windows-beautify`）。
2b. **首页可见性（正式发必做）**：`pinned: false`（不要写成常驻置顶）；必须写带时分的 `updated: YYYY-MM-DDTHH:mm:ss`（落盘当下），让站内「默认自动置顶」选中这篇。仅写 `published: YYYY-MM-DD` 同日会与旧帖撞成同一时间戳，首页看起来像没顶上去。常驻置顶（`pinned: true`）只在用户明确要求时才开。草稿箱帖不要求抢首页置顶。
3. **图片处理**：素材 `assets/` 图片拷入帖子 `images/`（ASCII 名）并改写引用；封面另存 `cover.jpg` 写 FM，不进正文。统一做 Web 化（见「配图规范」）：RGBA 压平贴深色底、转 JPG、大图降宽、像素图最近邻缩放。缺图用占位封面或跳过，不硬凑。`source/images/` 默认不整包进帖，除非用户要求附录原文图。
4. **素材只读 + 正式发布后归档**：output 只读素材、写博客；**出箱并正式发布成功**后把该**单篇目录**从 `Knowledge\todo\…` **移入 `Knowledge\Archive\{Theme}\{facet}\…`**（无层级的旧稿可入 `Archive\` 根；原样留档，不改写内容）。失败 / 仍在草稿箱则不移动。
5. **越权禁止**：只在 blog 仓库内落 posts（含 draftbox）+ 正式发时的级联索引；不碰站点布局/配置内核，不改其他文章。
6. **发布闭环**：草稿箱止于本地预览；正式发：本地校验通过 → 用户确认 → push → 核线上（遵循 `docs/agents/workflow.md`）。

## 链接与引用处理

成帖时扫描正文提到的其他文章 / 主题 / 参考，自动补上可跳转的链接：

1. **站内已有帖**：正文提到本仓其他文章（标题或 slug 可对上 `src/content/posts/`）时，自动加超链接到该帖 URL；主题支持链接卡片 / 跳转按钮（如 `::github` 卡、引用卡片）就顺手加上。
2. **Knowledge 内其他主题**：提到 `D:\OneDrive\Desktop\Knowledge\`（todo 与 Archive）下别的主题时，若该主题已发布 → 链到帖子；未发布（仍在 todo）→ 标注「待发布，链接后补」，不臆造 URL。
3. **不编链接**：只有确认目标存在（在 posts 目录或已知有效 URL）才加，绝不猜 slug 拼 URL。
4. **成对互链**：Knowledge 里成上下篇的主题（如 Cursor 迁移 / OpenCode-Kimi 迁移），落帖后互相加「相关阅读」链接。

## 交接约定

素材笔记若带 `<!-- @blog: ... -->` 或文首 YAML（`source` / `theme` / `facet` / 建议 category·tags·封面），output 优先采纳；无标记则按内容与 Theme→category 启发式推断并**列出候选请用户确认 category**（不得静默默认）。产出后向用户报告：文件树(素材→帖子) + frontmatter 决策（含 category 依据与 Theme）+ 校验结果。正式发后走 `site-cascade`，并按 workflow 发 Agent 协作者评论。

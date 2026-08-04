---
name: knowledge-output
description: >-
  把 knowledge-extract 提炼出的素材笔记(位于 D:\OneDrive\Desktop\Knowledge\{时间戳_主题}\)
  输出成 Firefly 博客文章，落盘到 src/content/posts/{slug}/。触发词：发布笔记、把知识笔记发到博客、
  knowledge output、素材转博客、提取完发出去、把 {Knowledge 目录} 的笔记写成博客文章。
  区别于 ob2blog(Obsidian vault → 博客)：本技能源是 Agent 自行总结的素材笔记(非 Obsidian vault，
  无 wiki 链接/附件映射/manifest 一致性)。任何「把 Knowledge 素材笔记变成博客成品帖」的诉求触发本技能。
compatibility: 需在 Firefly 项目根(含 src/content.config.ts)下执行；Python 3 stdlib；复用 ob2blog 的
  frontmatter 模板与 validate_post.py。产出后收尾调用 site-cascade。
---

# knowledge-output — Knowledge 素材笔记 → 博客文章

把 Agent 提炼好的知识素材，加工成可发布的 Firefly 博客帖。素材已是结构化的草稿，本技能负责**补全成帖要素 + 落盘 + 校验 + 级联索引**，不做二次提炼。

## 与 ob2blog 的边界（先说清）

| 维度 | ob2blog | knowledge-output（本技能） |
|---|---|---|
| 源 | Obsidian vault `D:\...\Notes\threetwoa_ob` | `D:\OneDrive\Desktop\Knowledge\{时间戳_主题}\` 素材笔记 |
| 依赖 | wiki 链接 `![[…]]`、附件映射、manifest 一致性 | 无；素材是独立 md + 可选 assets 图 |
| 真源约束 | Obsidian = 真源，双边同步 | 素材即草稿；博客落盘后素材可留档 |
| 复用 | — | 复用 ob2blog 的 frontmatter.yaml + validate_post.py |

两者互补不冲突：**extract 产出素材 → output 产出成品 → 走 site-cascade**。

## 输入 / 输出

- 输入：`D:\OneDrive\Desktop\Knowledge\{时间戳_主题}\{主题}.md`（素材笔记）+ `assets/`（可选配图）
- 输出：`src/content/posts/{slug}/index.md` + `cover.*`(可选) + 附件拷贝
- 收尾：`site-cascade`（最新动态/统计/分类标签/热力图）

## 工作流（六步）

```
1 选材    → 从 Knowledge 目录定位素材笔记，确认主题与内容完整度(缺关键结论先回 extract 补齐)
2 定稿    → 读素材，按 humanizer-output-style 校准语气；过一遍「成帖红线」(见下)；拆长文为可读章节
3 成帖    → 补 frontmatter(参考 ob2blog/assets/templates/frontmatter.yaml)：
            title/published/description/tags/category/slug/image/draft/lang/pinned/comment
            slug 必须英文 kebab(小写字母数字连字符)，中文标题手传；category 从既有集合取
4 落盘    → 建 src/content/posts/{slug}/；正文写 index.md；assets 图拷到 ./images/(ASCII 名)
            并改写引用，封面另拷 cover.jpg 写 FM（不进正文），图按「配图规范」统一 Web 化。
            跳过 prep_convert/sync_check(它们强依赖
            Obsidian vault，本场景无 manifest)
5 校验    → python .cursor/skills/ob2blog/scripts/validate_post.py src/content/posts/{slug}/index.md
6 收尾    → 调 site-cascade；提示用户 pnpm dev 预览；未获准不 commit/push
```

## 成帖红线（素材进博客前最后一道）

素材经过 extract 提炼，但成帖前再扫一遍，别把 AI 味带上线：

1. **标题像人起的**：口语化、有钩子；禁「XX 实录 / XX 清单 / 这篇在讲什么」类手册腔。
2. **无「一句话 X」句式**：「一句话结论 / 一句话总结」这类标签清零。
3. **无工具流程痕迹**：不提「调用了 skill / 脚本 / 子代理」，不留「需要清理时说一声」样板话术。
4. **详略得当**：正文服务博客读者，删过程性信息，只留可带走的判断和数据。
5. **英文 em dash（—）归零**；中文破折号「——」属正常排版不受限；颜文字自然融入，不放代码块内。

## 配图规范

- **封面**：优先用素材 `assets/` 里的达标封面；没有或不合格，按 `knowledge-extract` 的配图规范用 MiniMax 生成（抽象主题用具象符号、克制配色、留白 ≥20% 给标题、生成后集中质检），不合格重生成。统一存 `cover.jpg`（模板示例的 `cover.webp` 不强制，实现以 `cover.jpg` 为准）。
- **小节图**：素材 `assets/` 图拷到 `images/` 并改写引用（`./images/fig-*.jpg`）；缺图不硬凑。
- **Web 化**：所有图转 JPG；RGBA 先压平（贴深色底）；超 ~1.5MB 的大图降宽到 ~1600px 再存；像素图缩放用最近邻（ffmpeg `scale=...:flags=neighbor` 或 PIL `Image.NEAREST`）。封面只在 FM `image` 字段，不重复进正文。
- **质检**：封面 / 配图逐张 review（布局错乱？对比度暗淡？主题一眼可读？图标可辨？），宁缺毋滥。

## 硬规则

1. **默认 `draft: false`**：素材已过提炼关，除非用户明确要求草稿或素材含敏感/口令内容，否则直接发布进生产构建。
2. **重建 frontmatter**：不沿用素材里的临时字段；`slug` 用英文 kebab（小写字母数字连字符）。主题目录名若本身 ASCII（如 `2026-08-01_foo`）则取去时间戳部分；否则按主题语义手取英文 slug（如「ClaudeCode的Windows美化与配置」→ `claude-code-windows-beautify`）。
2b. **首页可见性（必做）**：`pinned: false`（不要写成常驻置顶）；必须写带时分的 `updated: YYYY-MM-DDTHH:mm:ss`（落盘当下），让站内「默认自动置顶」选中这篇。仅写 `published: YYYY-MM-DD` 同日会与旧帖撞成同一时间戳，首页看起来像没顶上去。常驻置顶（`pinned: true`）只在用户明确要求时才开。
3. **图片处理**：素材 `assets/` 图片拷入帖子 `images/`（ASCII 名）并改写引用；封面另存 `cover.jpg` 写 FM，不进正文。统一做 Web 化（见「配图规范」）：RGBA 压平贴深色底、转 JPG、大图降宽、像素图最近邻缩放。缺图用占位封面或跳过，不硬凑。
4. **不动 Knowledge 素材**：output 只读素材、写博客；素材目录留档不改写（除非用户要求回写）。
5. **越权禁止**：只在 blog 仓库内落 posts + 级联索引；不碰站点布局/配置内核，不改其他文章。
6. **发布闭环**：本地校验通过 → 用户确认 → push → 核线上（遵循 `docs/agents/workflow.md`）。

## 链接与引用处理

成帖时扫描正文提到的其他文章 / 主题 / 参考，自动补上可跳转的链接：

1. **站内已有帖**：正文提到本仓其他文章（标题或 slug 可对上 `src/content/posts/`）时，自动加超链接到该帖 URL；主题支持链接卡片 / 跳转按钮（如 `::github` 卡、引用卡片）就顺手加上。
2. **Knowledge 内其他主题**：提到 `D:\OneDrive\Desktop\Knowledge\` 下别的主题时，若该主题已发布 → 链到帖子；未发布 → 标注「待发布，链接后补」，不臆造 URL。
3. **不编链接**：只有确认目标存在（在 posts 目录或已知有效 URL）才加，绝不猜 slug 拼 URL。
4. **成对互链**：Knowledge 里成上下篇的主题（如 Cursor 迁移 / OpenCode-Kimi 迁移），落帖后互相加「相关阅读」链接。

## 交接约定

素材笔记若带 `<!-- @blog: ... -->` 类标记（如建议 category/tags/封面），output 优先采纳；无标记则按内容推断并列出依据，供用户抽查。产出后向用户报告：文件树(素材→帖子) + frontmatter 决策 + 校验结果。

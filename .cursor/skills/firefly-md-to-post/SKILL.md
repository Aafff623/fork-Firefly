---
name: firefly-md-to-post
description: >-
  Converts a raw Markdown file plus companion assets into a Firefly-compatible
  blog post under src/content/posts/ for this fork-Firefly / threetwoa's blog
  repo. Use whenever the user wants to write, import, migrate, publish, or
  adapt an article for this site — including MD/MDX posts, covers, images,
  GIFs, Bilibili/YouTube embeds, code blocks, callouts, Mermaid/PlantUML,
  KaTeX, wiki links, or GitHub cards — even if they only say "加一篇文章",
  "渲染成博客", "导入 md", or drop a .md file without naming this skill.
compatibility: Requires the Firefly project root (package.json with pnpm new-post). Windows PowerShell OK.
---

# Firefly MD → Post

把「原始 MD + 配图」变成可渲染文章。主题负责卡片、日期、标签、TOC、上下篇；本 skill 只产出 **frontmatter + 正文 + 资源路径**。

**详略原则：** 主文只写常用路径；脏编码 / 危险 HTML / 双前言等见 `references/safety.md`（有才打开）。

## 按需阅读

| 何时打开 | 文件 |
|----------|------|
| 字段、脏 yaml、要不要加密 | [frontmatter.md](references/frontmatter.md) |
| 提醒框 / 代码 / GitHub 卡 / MDX | [syntax-cookbook.md](references/syntax-cookbook.md) |
| 图、GIF、B 站/YT、音频 | [media-rules.md](references/media-rules.md) |
| 乱码、危险链、script、结构极端 | [safety.md](references/safety.md) |
| 官方文档入口 | [official-docs.md](references/official-docs.md) |
| 复制骨架 | [assets/templates/](assets/templates/) |

## 硬规则（常用）

1. 在 `Firefly/` 根目录操作；UTF-8；正文从 `##` 起，不造卡片/TOC HTML。  
2. 默认 `.md`；要 Icon/JSX 才 `.mdx`。Callout 只出 github 五类（映射表见 cookbook）。  
3. **重建** frontmatter（模板 + frontmatter.md），丢弃脏键与 `prev*`/`next*`；本仓禁止 `image: api`。  
4. 导入未声明时 `draft: true`。勿改站点壁纸配置来「嵌视频」。  
5. 跑 `validate_post.py`；未获准不 commit/push。

边界输入另遵 [safety.md](references/safety.md)（不可见字符、危险 scheme、HTML 消毒、保真、强制 password）。

## 工作流

```
1 输入 → 2 slug → 3 建目录 → 4 迁资源 → 5 重建 FM+正文 → 6 校验 → 7 汇报
```

### 1–2. 输入与 slug

推断并写明假设：`title` / `tags` / `category` / `draft`。  
`slug`：英文 kebab-case；中文或怪文件名必须显式写。

### 3. 布局（默认一帖一目录）

```
src/content/posts/<slug>/
├── index.md(x)
├── cover.*
└── images/          # 静图
public/posts/<slug>/ # 仅 GIF / 本地音视频
```

可选 `pnpm new-post <slug>/index`，然后整份替换 title/正文。

### 4. 资源（一句话）

封面只进 FM；静图 `./images/`；GIF→`public`；B 站/YT→iframe（media-rules）；无音频文件用注释占位。保留 `[grid]`；远程 https 图默认不下载。

### 5. 正文转换（常用清单）

按序做；碰到边界再翻 safety：

1. 删重复 H1 / 文内「标签、发布于」  
2. `![[x]]`→标准图；callout 映射；`||x||`→`:spoiler[x]`  
3. watch URL→iframe；GitHub 根仓库可卡片，`/issues` 保持链接  
4. 并排双语言→`code-group`；要图标→MDX  
5. 保留 mermaid/plantuml/katex/EC 的 title与行标；勿乱改 `ansi`

Frontmatter 用 [frontmatter.yaml](assets/templates/frontmatter.yaml) 重建。

### 6–7. 校验与汇报

```bash
python .cursor/skills/firefly-md-to-post/scripts/validate_post.py src/content/posts/<slug>/index.md
pnpm dev   # 打开 /posts/<slug>/
```

汇报：路径、URL、封面/资源、转换要点、假设与待确认。

## 分工

| 主题自动 | Skill |
|----------|--------|
| 卡片、日期、标签、TOC、上下篇 | FM + 正文 + 资源 |

无封面可用 [cover-placeholder.svg](assets/placeholders/cover-placeholder.svg)。  
事实源：`CONTEXT.md`、`docs/official/01-入门/编写文章.md`。

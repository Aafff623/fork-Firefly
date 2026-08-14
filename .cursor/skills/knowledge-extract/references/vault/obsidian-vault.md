# Obsidian Vault → 附件解析

本仓文章源常在 **站外 Obsidian vault**（例如 `…/Notes/threetwoa_ob/`），不在 `src/content/posts`。

## 识别 vault 根

从笔记路径向上找，最近一层含 `.obsidian/` 的目录即为 vault 根。

必读（若存在）：

| 文件 | 用途 |
|------|------|
| `.obsidian/app.json` → `attachmentFolderPath` | 附件目录（如 `Assets/picture`） |
| 同目录其它 `.md` | 同名资源优先 |

## `![[…]]` 语法（必须消解）

| Obsidian | 含义 | 博客目标 |
|----------|------|----------|
| `![[name.webp]]` | 嵌入图 | 封面或 `![alt](./images/…)` |
| `![[name.png\|750]]` | 宽 750px | **默认** `![alt](./images/name.png)`（走 Astro 图管线）；宽度可丢 |
| 同上且必须保留宽度 | 宽 750px | 文件进 `public/posts/<slug>/` + `<img src="/posts/<slug>/name.png" width="750" />` |
| `![[name.png\|750x400]]` | 宽×高 | 同上；勿写相对 `./` 的 raw `<img>` |
| `![[folder/name.png]]` | 带路径 | 按 basename + 相对 vault 路径查找 |
| `![[Other Note]]` | 嵌其它笔记 | **不**内联全文；WARN + 链到源或省略 |
| `![[x.mp4]]` / 音视频 | 本地媒体 | → `public/posts/<slug>/` + `<video>`/`<audio>` |

Firefly 校验：正文残留 `![[…]]` → **FAIL**（见 `validate_post.py`）。

## 附件查找顺序

对 embed 目标 `name`（可含相对路径）：

1. 笔记所在目录  
2. `vault / attachmentFolderPath`  
3. `vault / attachmentFolderPath` 下按 **basename** 匹配（Obsidian 常用「仅文件名」）  
4. 全 vault 递归 basename（唯一命中才用；多个 → WARN 并取最短路径或附件目录优先）

扩展名：若 `![[foo]]` 无扩展名，尝试常见图/视频后缀；仍无则 WARN。

## 封面启发式

1. 文首（frontmatter 后至第一个 `##` 前）唯一图片 embed → 作 **cover**，正文删除该行  
2. 否则找文件名含 `cover` / `封面`  
3. 否则首张静图可作 cover（复制一份到 `cover.*`，文内仍可引用 `images/`）  
4. 都无 → `image: ''` 或占位 SVG

## 标题与 frontmatter

| 源 | 动作 |
|----|------|
| 无 YAML | `title` = 文件名去 `.md`；`published` = 今天或文件 mtime 日；`draft: false`（默认发布） |
| 有 Obsidian YAML | 映射已知键；未知键丢弃（可当线索） |
| 文内重复标题 | 不写 H1 |
| **已映射帖改名** | `title` 跟新文件名；`obsidianNote` 写新路径；**默认不动 slug**；同步「新笔记」动态里的锚文本 |

## 列表与空白

- 行首 **Tab** 缩进的嵌套列表 → 改为 2 或 4 空格（与邻近一致）  
- 保留有意空行；不要「美化」成重排全书

## 列表内插图

Obsidian 常在 `1.` 与 `2.` 之间插图。若图与列表项之间空行且图不缩进，会 **拆断有序/无序列表**（HTML 里出现 `</ol><p><img></p><ol start="2">`）。

正确：把图缩进挂在当前列表项下：

```markdown
1. 说明文字

   ![截图](./images/x.png)

2. 下一项
```

## 实测坑（随测试更新 · 2026-08-02 `ai-coding-save-money`）

| 现象 | 处理 |
|------|------|
| 附件只在 `Assets/picture`，笔记在子文件夹 | 必须走 `attachmentFolderPath`，不能只扫笔记目录 |
| raw `<img src="./images/…">` | **404**：相对路径不进 Astro content 图管线；改 Markdown `![](./images/…)` 或 `public/posts/<slug>/` 绝对路径 |
| `\|750` 宽度 | 默认可丢（站点 `max-width:100%`）；要保宽→`public/` + 绝对 `src` |
| 列表间插图拆 `ol` | 图缩进归属当前 `li` |
| 中文文件名资源 | 落盘改 ASCII（`cover.webp` / `cockpit-tools.png`） |
| webp 封面 + png 文内图 | 按扩展名原样拷贝 |

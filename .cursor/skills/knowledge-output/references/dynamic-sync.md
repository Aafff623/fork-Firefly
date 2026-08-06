# 动态同步（knowledge-output 子模块）

发新帖后，除了 site-cascade 自动 emit 的「新笔记」动态，用户还可以要求**同时在动态流补一条自定义内容**（感想、花絮、补充说明、配图分享）。本模块处理这条自定义动态的发布。

## 何时触发

用户在调用 knowledge-output 时**显式表述**要在动态里加内容，例如：

- 「发帖的同时在动态里说一声……」
- 「output 这篇，动态里顺便发张配图」
- 「发布后帮我在动态补一句感想」

没提就不发——site-cascade 的「新笔记」动态是默认行为，本模块只处理**用户额外要求**的那条。

## 动态的本质

动态流是**时间线**，读者扫的是「文字主体 + 可选小配图」：

- **文字永远是主体**：一两句话，最多一个短段落或列表，别写成小作文。
- **配图是点缀**：流里以缩略图呈现（单图约 16rem 宽 / 11rem 高，多图成网格），点击才看大图。图「粗略可读」即可。
- **即时性**：带当前时间戳，是「此刻」的记录。

## 发布流程

```
1 取时间   → 当前本地时间（siteConfig.timezone，默认 Asia/Shanghai）
2 定类型   → 按内容预判 kind（见下）
3 落盘     → 写 src/content/dynamic/YYYY-MM-DD-HHMMSS.md（frontmatter 仅 published）
4 配图     → 有图则压到规范尺寸，放 public/assets/dynamic/，正文引用
```

### 时间与文件名

- 文件名：`src/content/dynamic/{YYYY-MM-DD-HHMMSS}.md`
- frontmatter：`published: YYYY-MM-DD HH:MM:SS`
- 纯文字快捷方式：`pnpm new-dynamic "<内容>"`；有图或需精细控制时直接 Write。

### kind 启发式（`src/utils/dynamic-utils.ts` 自动判定，frontmatter 不用写）

| kind | 判定条件 | 适用 |
|---|---|---|
| `gallery` | 图片 >1 张 | 多图分享 |
| `note` | 含「发布了新笔记」或 `/posts/` 链接 | 发文联动（site-cascade 自动发） |
| `status` | 其余（0 或 1 张图） | 大多数手动动态 |

**注意**：用户手动补的动态若要链到新帖，用 `/posts/{slug}/` 链接即可——会被判成 `note`，这是合理的（它确实是发文联动）。但别用「发布了新笔记」开头（那是 site-cascade 的句式，重复了）。

### 正文写法

- 直接写 markdown，**不要标题**。
- 口语、第一人称，可 emoji / 颜文字。
- frontmatter 只写 `published`（必填）+ 可选 `pinned` / `location`。

**示例**（发帖后补一条带图动态）：

```markdown
---
published: 2026-08-07 09:30:15
---

这篇拆解写了三天，翻大纲翻到头秃。附上一张课程项目图感受下密度。

[AI Agent 全栈营拆解](/posts/geektime-ai-agent-fullstack/)

![全栈营六大项目](/assets/dynamic/s35-projects.jpg)
```

## 配图规范

- **存放**：`public/assets/dynamic/<名字>.jpg`（ASCII 名）。
- **引用**：`![描述](/assets/dynamic/名字.jpg)`（推荐绝对路径，简单不易错）。
- **压缩**：原图（尤其截图）先压——宽度 ≤1200px，JPG quality 85：

```python
from PIL import Image
im = Image.open("原图.png").convert("RGB")
if im.width > 1200:
    im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
im.save("public/assets/dynamic/名字.jpg", "JPEG", quality=85, optimize=True)
```

- **数量**：1 张 → status 单图；多张 → gallery 网格（最多显示 6）。
- **敏感信息**：图含密钥/token/完整邮箱先提醒用户打码。

## 发布后（自动生效）

动态落盘后 `/api/dynamic.json`、`/dynamic/` 时间线、首页侧栏「最新动态」自动读取，dev 下保存即热更新。**不需要再跑 site-cascade**（那是发新帖的级联，已在主流程跑过）。

## 硬规则

1. 动态是短内容；值得长期归档的走成帖，不要塞动态。
2. frontmatter 极简：只 `published` + 可选 `pinned`/`location`，无 title/tags/category。
3. 配图先压缩再入库，禁止 2560px 原图直丢 `public/`。
4. 图含敏感信息先提醒。

## 参考

- schema：`src/content.config.ts`（dynamicCollection：published/pinned/location）
- API 图片抽取：`src/pages/api/dynamic.json.ts`
- kind 启发式：`src/utils/dynamic-utils.ts`
- 渲染：`src/components/pages/dynamic/react/DynamicTimeline.tsx`、`dynamic-gallery.ts`
- 样式：`src/styles/dynamic.css`
- 配置：`src/config/dynamicConfig.ts`（defaultLocation/itemsPerPage）
- 脚本：`scripts/new-dynamic.js`

# Frontmatter

对照：`编写文章.md`、`content.config.ts`、`new-post.js`。

## 重建字段

| 字段 | 要求 |
|------|------|
| `title` `published` | 必填；日期 `YYYY-MM-DD` |
| `description` `image` `tags` `category` `slug` | 建议；`image` 用 `./cover.*`，**禁** `api` |
| `draft` | 导入未声明 → `false`（默认发布）；用户点名草稿 / 安全规则触发 → `true` |
| `password` / `passwordHint` | 见下方启发式 |
| `prev*` / `next*` | 禁止 |

`slug` 不在 zod，但仍决定 URL——要写。

## 脏源 → 怎么处置

| 源 | 动作 |
|----|------|
| 半截/多块 yaml | 全丢，按 [frontmatter.yaml](../assets/templates/frontmatter.yaml) 重建 |
| 非法日期 / `draft: maybe` | ISO 日期；无法判定的 draft 字面量 → `false`（默认发布） |
| `image` 失效或 `api` | 旁路找 `cover*`/首图，否则 `''` 或占位 SVG |
| 非标准键 | 忽略（可当线索） |

## 敏感 → password

正文像口令/密钥/`user / pass`/「勿公开」→ 建议 `password`；能删真密钥则删。有 password 时评论关闭属正常。

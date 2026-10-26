# 12: frontmatter.json 字段 schema（编辑器/Agent 护栏）

**What to build:** 仓库根新增 `frontmatter.json`（frontmatter.codes schema），按 `src/content.config.ts` 的 posts schema 翻译：title/description/published(datetime，默认 {{now}})/image(isPreviewImage)/tags(list)/category/draft/password/comment/updated/collections 等我们特有字段；配 `frontMatter.preview.host` 与 `pageBundle: true`。dynamic  collection 如需同款护栏另加一段（本票默认只 posts）。

**Blocked by:** None

**Status:** resolved（2026-10-26；字段与 schema 对齐，VS Code 扩展未装故补全未实测）

- [x] `frontmatter.json` 覆盖 posts 全部在用字段，与 content.config.ts 一致
- [ ] VS Code 装 Front Matter 扩展打开一篇 posts 有补全（验收方式）— 本机未装该扩展，未实测
- [x] 与 post-publish 发文流水线对齐：Agent 生成的 frontmatter 不漂移 — 字段名与 schema 一一对应
- [x] 无构建影响（纯 JSON），`pnpm check` 不受影响 — node 解析 + `astro check` 无引用

**参考**：fuwari 仓库根 `frontmatter.json`（浅克隆 `temp/repos/fuwari/`）；`temp/reports/batch1/fuwari-borrow.md` 第 3 条。schema 格式是 frontmatter.codes 公开规范，非对方独创；内容照我们自己的 schema 写。

## 实现记录（2026-10-26）

新建 `frontmatter.json`（仓库根）：

- 框架与预览：`frontMatter.framework.id: "astro"`、`frontMatter.preview.host: "http://localhost:4321"`、`frontMatter.content.publicFolder: "public"`，`pageFolders` 指向 `[[workspace]]/src/content/posts`。
- 内容类型 `default`：`pageBundle: true`、`previewPath: "'/posts'"`（路由是 `/posts/<slug>/`）、`clearEmpty: true`。
- 19 个字段逐条对 `src/content.config.ts` 的 posts schema：`title`（string）、`published`（datetime，`{{now}}`，isPublishDate）、`updated`（datetime）、`description`、`image`（image，isPreviewImage）、`tags`（list）、`themeTags`（list）、`collections`（list）、`category`、`lang`、`draft`（boolean，默认 false）、`pinned`（默认 false）、`author`、`sourceLink`、`licenseName`、`licenseUrl`、`comment`（默认 true）、`password`、`passwordHint`。

两点说明：

- **没收录 `slug`**：存量文章普遍写了 `slug:`，但 posts schema 里没有这个字段（zod 会把未知键剥掉），路由用的是 `post.id`。按「与 content.config.ts 一致」，这里不列；要把它变成正式字段，先改 schema 再补。
- **只做 posts**：dynamic / spec 两个 collection 没加段落，与票面「本票默认只 posts」一致。

验证：`node -e "require('./frontmatter.json')"` 解析通过，字段名 19 个与 schema 对齐；`astro check` 不读这个文件（纯 JSON，无构建影响）。

未验证：VS Code Front Matter 扩展的实际补全（本机没装该扩展），所以第二项勾选留空。

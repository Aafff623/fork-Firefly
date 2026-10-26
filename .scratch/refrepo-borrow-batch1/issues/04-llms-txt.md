# 04: llms.txt AI 站点索引路由

**What to build:** 新增 prerender 文本路由 `src/pages/llms.txt.ts`：Key Pages 段按 `siteConfig.pages` 开关过滤（友链/留言/动态/相册/书签等），Recent Posts 段取最近 20 篇标题+绝对 URL+描述；输出带 UTF-8 BOM（防静态托管/Windows 编辑器按 ANSI 解码致中文乱码）；复用现有 `getSortedPosts` 与 i18n。

**Blocked by:** None

**Status:** resolved（2026-10-27）

- [x] `src/pages/llms.txt.ts` 上线，构建产物含 `/llms.txt`
- [x] 内容按 pages 开关过滤正确；最近 20 篇标题/URL/描述齐全
- [x] 文件带 UTF-8 BOM， VS Code/记事本打开中文不乱码
- [x] 本地 dev 访问 `/llms.txt` 验收
- [x] `pnpm check && pnpm type-check` 绿

**实现记录（2026-10-27）**

- 新增 `src/pages/llms.txt.ts`（`export const prerender = true`，`GET` 返回 `text/plain; charset=utf-8`）。结构照上游：`# 站点标题` / `> 描述` / `## Key Pages` / `## Recent Posts`。
- Key Pages 映射到本仓真实路由与 i18n key：首页 `/`、归档 `/archive/`、关于 `/about/` 常驻；友链 `/friends/`(friends)、留言 `/guestbook/`(guestbook)、动态 `/dynamic/`(dynamic)、相册 `/gallery/`(gallery)、藏经阁 `/nav/`(navSites)、角色 `/agents/`(agents)、番组 `/bangumi/`(bangumi)、打赏 `/sponsor/`(sponsor) 跟随 `siteConfig.pages[页] !== false`。上游有而我们没有的 projects/booknav/bilibili/vndb/mal 不写。
- Recent Posts：`getSortedPosts()` 取前 20，URL 用 `getPostUrlBySlug(post.id)`（内部 `toPostSlug`，草稿箱 `_draftbox/` 前缀会被剥掉）拼成绝对地址，描述取 frontmatter `description`。
- BOM 用显式 `"\uFEFF"` 前置，避免源码里放不可见字符。
- 验证（dev + curl）：`/llms.txt` 返回 200 `text/plain; charset=utf-8`，首字节 `EF BB BF`；11 条 Key Pages 定义里 `bangumi:false` 的番组页被过滤，其余 10 条输出，20 篇最近文章的标题/绝对 URL/描述齐全。
- 构建验证：`astro build` 成功，产物 `dist/client/llms.txt`（5.1K）同样以 `EF BB BF` 开头，共 30 条列表项（10 个 Key Pages + 20 篇最近文章），无 `_draftbox` 草稿泄漏。

**参考**：上游 `temp/repos/Firefly/src/pages/llms.txt.ts`（公网同路径）；`temp/reports/batch1/cuteleaf-firefly-borrow.md` 第 3 条。零运行时成本；与站内 ask AI 检索互补（廉价上游索引）。

# lvy010 管理员认证与在线编辑实现调研

> 调研日期：2026-08-20
>
> 范围：`lvy010/X-Plore`、`lvy010/lvynote` 的公开仓库与历史，以及 `lvyovo-wiki.tech` 当日公开部署产物
>
> 证据约束：只使用作者自己的仓库、站点部署产物和 GitHub、Next.js 官方文档。本文不把压缩后的生产构建产物误称为公开源代码。

## 1. 结论先行

1. **公开仓库里没有这套后台源码。** `X-Plore` 当前是笔记索引与少量索引生成脚本，`lvynote` 当前是笔记备份；`lvynote` 的早期历史仅出现 Hexo 与 NexT/Butterfly 主题。对当前树、单一公开分支和历史关键提交的检查，都没有发现 GitHub OAuth、在线编辑器、文章删除、右键编辑菜单、评论或评论点赞实现。

2. **在线编辑确实存在，但只能由线上生产构建产物验证。** `lvyovo-wiki.tech/write` 暴露了 Markdown 编辑、预览、图片粘贴/拖放、文章发布、更新、删除和站点配置入口。当前部署配置指向 `lvy010/lvyovo-wiki`，但该仓库通过 GitHub 公共 API 返回 `404`。因此可以分析公开客户端行为，不能声称已经审阅其原始 TypeScript 源码、服务端源码或完整提交历史。

3. **它没有用 GitHub 登录识别管理员。** 当前实现的“认证”是浏览器读取 GitHub App 的 `.pem` 私钥，在客户端签发 App JWT，再向 GitHub 换取 installation access token。拥有这份私钥就会被界面视为有管理能力，它验证的是“是否持有 App 私钥”，不是“当前 GitHub 用户是不是指定管理员”。

4. **`.pem` 不是网站本地生成，也没有上传到站点后端。** GitHub App 所有者在 GitHub 设置中点击 `Generate a private key`，GitHub 下载 PEM 到本机；站点的文件选择器只是在浏览器内读取该文件。公开客户端没有显示把 PEM 上传到作者服务器的路径。

5. **这套密钥方案不能原样迁移到 Firefly。** GitHub 官方明确要求客户端应用不得携带 GitHub App 私钥，也不应在客户端生成 installation access token。线上产物虽可选择用 AES-GCM 将 PEM 缓存在 `sessionStorage`，但加密材料来自 `NEXT_PUBLIC_` 变量，会进入客户端构建；它只能降低存储内容被随手看到的概率，不能抵御 XSS 或同源恶意脚本。

6. **目标站没有已验证的右键菜单、富文本编辑器或 GitHub 评论点赞。** 编辑器是原生 `<textarea>` 加 Markdown 快捷键；引用只靠 Markdown 的 `>` 语法；没有应用级 `onContextMenu`。站内“点赞”是一个独立 Cloudflare Worker 的文章计数器，不是 GitHub 评论 reaction。用户想借鉴的右键、富文本和评论点赞是“目标能力”，不是这两个公开仓库或当前部署中已经验证的实现。

7. **Firefly 应借鉴数据流，不应复制信任边界。** 值得迁移的是 Markdown 作为真源、图片内容寻址、文章和索引一次 Git commit 原子提交、同一渲染管线预览。管理员身份应改成 GitHub OAuth 的服务端会话，并用 GitHub 不变的数值 `id` 识别指定账号；GitHub App 私钥只能保存在服务端密钥管理中。

## 2. 证据边界与仓库定位

### 2.1 仓库事实表

| 对象 | 2026-08-20 可验证状态 | 与目标能力的关系 |
| --- | --- | --- |
| [`lvy010/X-Plore`](https://github.com/lvy010/X-Plore) | 公开；默认分支 `main`；检查时 HEAD 为 [`23b8abdf`](https://github.com/lvy010/X-Plore/commit/23b8abdfbd6d94d69582214b43f77ba7e82b5961)；GitHub API 未识别许可证 | 当前树是笔记、图片、PDF、仓库索引和 Python 索引脚本，不是网站应用源码 |
| [`lvy010/lvynote`](https://github.com/lvy010/lvynote) | 公开；默认分支 `main`；检查时 HEAD 为 [`049980eb`](https://github.com/lvy010/lvynote/commit/049980ebf8ccbf54554d51de6441da3882179459)；443 个提交；只有一个公开分支；无 tag；GitHub API 未识别许可证 | 当前树是 Markdown、图片、PDF 和 Rust 学习资料，不是网站应用源码 |
| `lvy010/lvynote.github.io` | 作者 README 使用过这个名字；GitHub 目前把它解析到 `lvynote` | 是旧名称/入口线索，不是另一套可见后台源码 |
| `lvy010/lvyovo-wiki` | 当前线上构建配置写明 owner/repo/branch 为 `lvy010/lvyovo-wiki/main`；公共 GitHub API 返回 `404` | 可能是实际内容/应用仓库，但目前无法公开审阅；`404` 不能区分私有、删除或其它不可访问状态 |
| [`lvyovo-wiki.tech`](https://lvyovo-wiki.tech/) | 当前可访问；响应及页面资产显示为 Vercel 上的 Next.js/Turbopack 构建 | 这是在线编辑与 GitHub 写入行为的公开第一方运行证据，但不是可读源码仓库 |

### 2.2 公开仓库中“不存在”的证据

`X-Plore` 当前根目录包括 `Bilibili/`、`data/`、`lvywiki/`、`pdf/`、`png/`、`repo/`、`scripts/` 和笔记目录。README 明确描述的本地工作流是 `git clone` 后用 Typora 打开 Markdown，并自行增删改查和批注。它还用自然语言表示笔记和代码可获取、引用、改造，但根目录没有标准 `LICENSE` 文件。

`lvynote` 当前根目录和子树主要是 `note/`、`idea/`、`essay/`、`data/`、图片、PDF 与 Rust 学习内容。其 README 链接到 CSDN、旧 GitHub Pages 地址和 `lvyovo-wiki.tech`，没有描述管理员登录或编辑后台。

对两个仓库当前树进行下列能力关键词检查，没有命中应用实现：OAuth/login、GitHub token、PEM/session、editor/textarea/contenteditable、Tiptap/CodeMirror/Monaco/Milkdown、context menu、Giscus/comments/reactions。唯一近似命中来自 Git 自带 hook 示例中的普通 “comments” 文本，不是业务代码。

历史方面，`lvynote` 的 [`a8aed6e`](https://github.com/lvy010/lvynote/commit/a8aed6ee0628220e5ad6399606c091d7c6e5ef30) 提交名为 `next-theme`，引入 `blog/_config.yml`、`blog/package.json`、Hexo scaffolds、`blog/source/_posts/hello-world.md` 和 NexT theme submodule；后续 [`3169b1f`](https://github.com/lvy010/lvynote/commit/3169b1f5e4378a3c324c0d858d3548e8e58c1f8b) 转向 Butterfly 主题。该历史证明它曾是静态 Hexo 博客，但不能证明存在今天的 Next.js 在线后台。

**事实判断：公开仓库没有所问的 GitHub 登录、在线编辑、右键菜单或评论点赞源码。用户想借鉴的是目标站今天表现出来的部分能力，以及尚未被验证存在的期望能力，而不是已经公开、可直接移植的一套完整实现。**

## 3. 当前线上实现的真实身份模型

### 3.1 配置和入口

2026-08-20 获取的首页与 `/write` 生产资源包含以下公开配置：

- `GITHUB_CONFIG.OWNER` 默认 `lvy010`
- `GITHUB_CONFIG.REPO` 默认 `lvyovo-wiki`
- `GITHUB_CONFIG.BRANCH` 默认 `main`
- `GITHUB_CONFIG.APP_ID` 为一个公开 App ID
- 加密配置名为 `NEXT_PUBLIC_GITHUB_ENCRYPT_KEY`
- `isCachePem` 默认 `false`
- `hideEditButton` 默认 `false`

对应部署资源为 [`067989d8c435963d.js`](https://lvyovo-wiki.tech/_next/static/chunks/067989d8c435963d.js)。资源文件名会随部署变化，因此该 URL 是日期快照证据，不是稳定 API。

### 3.2 “导入密钥”而非 GitHub 登录

身份与 GitHub API 客户端集中在部署资源 [`d9897f61a585673b.js`](https://lvyovo-wiki.tech/_next/static/chunks/d9897f61a585673b.js) 中。可还原的数据流为：

```text
浏览器选择 .pem 文件
  -> FileReader 读取私钥字符串
  -> 页面状态立即标记 isAuth = true
  -> 私钥签发 RS256 GitHub App JWT
  -> GET /repos/{owner}/{repo}/installation
  -> POST /app/installations/{installation_id}/access_tokens
  -> installation token 写入 sessionStorage("github_token")
  -> 文章和配置操作直接调用 api.github.com
```

客户端签发的 JWT 使用 GitHub App ID 作为 `iss`，`iat` 比当前时间提前约 60 秒，`exp` 约 8 分钟后。installation token 进入当前标签页的 `sessionStorage`。如果开启 PEM 缓存，私钥会以 `p_info` 为键放入 `sessionStorage`。

没有找到 GitHub OAuth 的 `authorize` 跳转、OAuth callback、authorization code 交换、`GET /user`、GitHub `login` 或 GitHub 数值用户 `id` 的管理员比对。页面里出现的 GitHub 图标属于社交链接，不是登录按钮。

因此：

- **事实：** `isAuth` 代表浏览器当前持有 token 或可解密 PEM。
- **事实：** 导入 PEM 后，客户端状态会先标为已认证，GitHub 是否接受该私钥要到后续 API 调用时才真正暴露。
- **推断：** 管理权限实际等价于“持有能为该 GitHub App 签名的私钥，并且 App 已安装到目标仓库”。它不是用户身份认证。
- **风险：** 一旦 PEM 泄露，持有者可以在 App 安装范围和权限内扮演该 App；这比单个短期用户会话的影响面更大。

### 3.3 本地密钥如何产生、线上如何“识别”

这部分必须纠正两个容易混淆的概念：

1. **密钥生成发生在 GitHub，不在网站。** GitHub 官方流程是在账号或组织设置的 `Developer settings -> GitHub Apps -> Edit -> Private keys` 中点击 `Generate a private key`。GitHub 随后下载 PKCS#1 RSA PEM 到本机；GitHub 只保留公钥部分。参见 [Managing private keys for GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps)。

2. **网站没有把 PEM 上传到自己的线上后端。** 当前公开客户端用本地文件选择器读取 PEM，在本地签 JWT，并直接请求 GitHub API。所谓“线上识别管理员”其实是 GitHub 用 App 的公钥验证 JWT，再签发 installation token；网站自身只根据本地凭证状态决定是否展示/执行操作。

3. **可选缓存不等于安全上传。** 缓存代码用 Web Crypto 的 AES-GCM 和随机 12 字节 IV 加密 PEM；AES 密钥由 `SHA-256(NEXT_PUBLIC_GITHUB_ENCRYPT_KEY)` 派生。Next.js 官方说明 `NEXT_PUBLIC_` 变量会在构建时内联进浏览器 JavaScript，因此有能力运行同源脚本或利用 XSS 的攻击者能够获得派生材料并读取当前 origin 的存储。参见 [Next.js Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)。这是基于部署代码和官方环境变量语义得到的安全推断。

4. **官方红线相反。** GitHub 明确写道：GitHub App 私钥不能硬编码；客户端、原生应用或运行在用户设备上的应用绝不能携带私钥；客户端不应生成 installation access token，因为这要求私钥。用户发起的操作应使用 user access token。参见 [Best practices for creating a GitHub App](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app)。

结论是：这种方式适合作为个人实验站的实现观察，不应被当作 Firefly 的安全设计模板。

## 4. 在线编辑器与数据流

### 4.1 编辑体验

主要编辑逻辑位于当日 `/write` 资源 [`114f6d02cda6a769.js`](https://lvyovo-wiki.tech/_next/static/chunks/114f6d02cda6a769.js)：

- `/write` 是新建模式，页面本身公开可访问；未导入 PEM 时，发布按钮提示“导入密钥”。
- `/write/{slug}` 是编辑模式；文章页资源 [`810d36feb8d1f7e5.js`](https://lvyovo-wiki.tech/_next/static/chunks/810d36feb8d1f7e5.js) 中的编辑入口会导航到该路径。
- 编辑时读取 `/blogs/{slug}/config.json` 和 `/blogs/{slug}/index.md`。
- 表单状态包括 `slug`、`title`、`md`、`tags`、`date`、`summary`、`hidden`、`category`、封面和图片列表。
- 正文控件是原生 `<textarea>`，占位文本为 `Markdown 内容`，不是富文本或 block editor。
- `Ctrl/Cmd+B` 包裹 `**`，`Ctrl/Cmd+I` 包裹 `*`，`Ctrl/Cmd+K` 插入 Markdown 链接，Tab/Shift+Tab 处理缩进。
- 粘贴剪贴板图片或拖放文件时，先把本地对象加入编辑状态，再插入 `![](local-image:id)` 临时占位。
- `.md` 文件导入会替换正文。
- 预览沿用文章 Markdown 渲染链路，减少编辑预览和生产文章的语义偏差。

没有看到 Tiptap、ProseMirror、Lexical、Milkdown、CodeMirror、Monaco 或 `contenteditable`。因此应称为“Markdown 源码编辑器加实时预览”，不应称为成熟富文本编辑器。

### 4.2 图片和引用

图片在发布前计算 SHA-256；重复哈希会被跳过。上传路径使用 `${sha256}${extension}`，然后将 `local-image:id` 替换为文章目录内的真实 URL。这个内容寻址策略值得借鉴：同一文件名称稳定、天然去重，也更适合长缓存。

封面既可使用外链，也可引用本地图片。需要迁移时仍应补上源站没有公开展示的安全门：MIME 白名单、文件大小和像素上限、SVG 默认拒绝或严格消毒、EXIF 清理、文件头校验，而不是只信扩展名。

引用没有单独工具栏或结构化块。Markdown 渲染器支持 `>` 时自然能渲染 blockquote，但当前编辑器没有“插入引用”按钮或引用专属数据模型。

### 4.3 新建与更新文章

发布使用 GitHub Git database API，逻辑顺序为：

```text
读取 main 当前 ref 和基准 commit/tree
  -> 图片生成 blob
  -> index.md 生成 blob
  -> config.json 生成 blob
  -> public/blogs/index.json 更新并生成 blob
  -> 基于 base_tree 创建一个新 tree
  -> 创建一个父提交为旧 HEAD 的 commit
  -> PATCH refs/heads/main 指向新 commit
```

实际路径为：

- `public/blogs/{slug}/index.md`
- `public/blogs/{slug}/config.json`
- `public/blogs/{slug}/{image-sha256}.{ext}`
- `public/blogs/index.json`

提交信息是 `新增文章: {slug}` 或 `更新文章: {slug}`。编辑模式不允许修改 slug。文章正文、元数据、图片和全站索引被放入一个 Git commit，这一点比逐文件 Contents API 提交更完整，避免读者看到一半更新。

边界与风险：它先读取 branch head，最后再更新 ref。如果期间 main 被其它提交推进，更新可能产生非快进冲突或 `422`。当前客户端没有显示成熟的冲突合并、自动重基、幂等请求或草稿恢复流程。

### 4.4 删除文章

删除逻辑会递归列出 `public/blogs/{slug}`，在新 Git tree 中把这些路径的 SHA 设为 `null`，同时从 `public/blogs/index.json` 移除 slug，然后创建 `删除文章: {slug}` 提交并更新 main ref。界面只使用 `window.confirm`，并提示不可逆。

Git 历史理论上可恢复被删内容，但站点 UI 没有回收站、软删除、延迟清理或 PR 审核。Firefly 不应照搬不可逆 UI，应优先：

- 默认把内容移入归档或设置 `draft/hidden/deletedAt`；
- 远程删除走独立分支和 PR；
- 直接写主分支时要求二次确认、基准 SHA 和审计日志；
- 为媒体引用做反向检查，避免删除共享图片。

### 4.5 站点配置编辑

当前部署还支持快捷键打开配置对话框，并可编辑内容与卡片样式。保存时会把站点配置和上传图片组成一次 Git tree/commit，再更新目标分支。这个流程说明作者把 Git 仓库同时作为 CMS 数据源和审计日志。

值得保留的是“一次变更一次可回溯 commit”，不值得保留的是“浏览器持久持有 App 根级凭证并直写 main”。

## 5. 右键菜单、评论与点赞的事实核验

| 能力 | 公开仓库 | 当前线上部署 | 结论 |
| --- | --- | --- | --- |
| GitHub OAuth 登录 | 未发现 | 未发现 OAuth authorize/callback 或 `GET /user` | 不存在已验证实现 |
| 指定 GitHub 管理员识别 | 未发现 | 只检查 PEM/token 是否存在，不比对用户 `id` | 不存在已验证实现 |
| Markdown 在线编辑 | 未发现源码 | `/write` 已验证为 `<textarea>` + 预览 | 存在于线上构建 |
| 富文本编辑 | 未发现 | 未发现相关框架或 `contenteditable` | 不存在已验证实现 |
| 右键选中文本菜单 | 未发现 | 业务 chunk 无 `onContextMenu`；`contextmenu` 只在 React 通用属性表中出现 | 不存在已验证实现 |
| 图片粘贴/拖放与哈希去重 | 未发现源码 | 已验证 | 存在于线上构建 |
| 文章更新/删除 | 未发现源码 | GitHub Git database API 已验证 | 存在于线上构建 |
| GitHub 评论/Giscus | 未发现 | 未发现评论加载、提交或 Discussions 数据流 | 不存在已验证实现 |
| 评论 reaction/管理员点赞 | 未发现 | 未发现 GitHub reactions API | 不存在已验证实现 |
| 文章级站内点赞 | 未发现源码 | 已验证独立 Worker 计数器 | 存在，但不是评论点赞 |

文章点赞代码位于当日资源 [`8c296c207448f482.js`](https://lvyovo-wiki.tech/_next/static/chunks/8c296c207448f482.js)，请求 `https://blog-liker.yysuni1001.workers.dev/api/like`，GET 获取计数、POST 增加计数。展示值还会叠加由 `BLOG_SLUG_KEY + slug` 派生的确定性初始偏移，范围约为 300 到 3000。它是作者自己的展示逻辑，不能当成真实 GitHub reaction 数量。

如果 Firefly 要做 GitHub 评论点赞，GitHub 官方 [Reactions REST API](https://docs.github.com/en/rest/reactions/reactions) 支持 issue、PR、Discussion 和评论 reaction。以用户身份操作时应使用 GitHub App user access token；如果继续使用 Giscus，让 Giscus/GitHub 自己承载登录和 reaction 通常比再造代理层更稳妥。

## 6. Firefly 推荐架构

### 6.1 三个身份必须拆开

```text
访客身份
  邮箱 magic link / GitHub OAuth
  只解决“你是谁”

站内授权
  服务端 session + role
  GitHub provider 的不可变 numeric user id 命中 OWNER_GITHUB_ID 才是 owner
  只解决“你能做什么”

内容写入身份
  服务端 GitHub App private key / key vault
  每次获取短期 installation token，并限制仓库和 permissions
  只解决“服务如何写 GitHub”
```

不要让以下信号单独授予管理员：客户端布尔值、邮箱文本、GitHub 可变用户名、浏览器 local/session storage、隐藏按钮、特殊路由、URL 参数或已导入 PEM。

GitHub 官方要求持久识别用户时存储不可变的数值 `id`，不要依赖会变化的 handle 或 email。参见 [GitHub App best practices: durable unique id](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app#use-the-durable-unique-id-to-store-the-user)。可在 UI 中仍显示 `Aafff623`，但服务端授权应绑定其已验证的 numeric ID。

### 6.2 GitHub OAuth 的正确管理员识别

推荐流程：

1. 服务端生成带 `state` 和 PKCE 的 GitHub authorization URL。
2. callback 在服务端验证 `state`，用 authorization code 换 user access token。
3. 服务端调用 `GET /user`。
4. 将返回的 numeric `id` 与服务端环境变量 `OWNER_GITHUB_ID` 比对。
5. 只有匹配时签发短期、HttpOnly、Secure、SameSite 会话；`role=owner` 不由客户端提交。
6. 每个写操作重新从服务端 session 读取角色，并验证 CSRF、Origin、请求频率和内容约束。

GitHub 的 [Login with GitHub 官方教程](https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-a-login-with-github-button-with-a-github-app) 给出了 web application flow。用户触发的行为应优先使用 user access token；如果内容提交统一由机器人署名，服务端才使用 installation token。

邮箱登录可以作为普通用户入口，但不应仅凭一个客户端传来的邮箱授予 owner。即使邮箱已验证，也应在服务端做显式账号绑定和高风险操作二次认证。

### 6.3 服务端写入边界

服务端写入端点至少要执行：

- 会话 owner 校验、CSRF/Origin 校验和速率限制；
- slug 正规化与路径 allowlist，拒绝 `..`、绝对路径、编码绕过和目标目录外写入；
- 依据 Firefly 的 Astro content schema 校验 frontmatter，不信任浏览器预览；
- Markdown 和图片体积上限、MIME/file signature 校验；
- 使用读到的 base commit SHA 进行乐观并发控制；冲突时返回可理解的 diff，而不是覆盖；
- 把正文、frontmatter、图片和索引放入同一 commit；
- 记录 actor GitHub ID、操作类型、目标 slug、base/new SHA、时间和结果，不记录 token 或 PEM；
- 默认新建分支和 PR；只有明确选择且冲突检查通过时直写 `master`。

GitHub App 私钥放入部署平台的 server-only secret 或外部 key vault。GitHub 官方把私钥称为 App 最有价值的 secret，并建议 key vault 的 sign-only 模式；环境变量是次优方案。任何 `PUBLIC_` / `NEXT_PUBLIC_` / Astro 客户端环境变量都不能承载它。

### 6.4 编辑器迁移分层

**第一阶段：先复刻真实且低复杂度的能力。**

- 原生 Markdown 源码编辑和即时预览；
- 标题、slug、日期、标签、摘要、草稿等 schema 驱动字段；
- Bold、Italic、Link、Quote、Code、Heading 快捷键和按钮；
- 图片粘贴、拖放、哈希去重、上传进度、失败重试；
- 本地草稿恢复；
- 保存前 diff 和提交预览。

**第二阶段：补用户欣赏但目标站未验证的右键能力。**

- 仅当 `<textarea>` 有选区时打开应用菜单；
- 菜单命令调用统一的 selection transform，不单独维护第二套格式化逻辑；
- 支持加粗、斜体、链接、行内代码、引用、标题和 AI 辅助入口；
- 保留浏览器默认菜单的键盘替代与无障碍路径；
- 对触控设备不依赖右键。

**第三阶段：再判断是否需要富文本。**

如果目标是 Markdown-first 博客，原生文本编辑器通常更透明、更容易无损保存。若确实需要 block editor，应选能稳定序列化到 Markdown AST 的方案，并为往返一致性、原始 HTML、MDX、自定义 directive、代码块和图片引用建立 fixture 测试。不要为了“看起来像 Notion”牺牲内容真源和 Git diff 可读性。

### 6.5 文章与评论能力的推荐归属

| 领域 | 真源 | 写入主体 | 推荐交互 |
| --- | --- | --- | --- |
| 文章、frontmatter、图片 | Firefly Git 仓库 | 服务端 GitHub App 或 owner user token | 后台编辑后 PR/原子 commit |
| 普通用户资料和会话 | 站点数据库/认证服务 | 用户自己的服务端 session | 邮箱/GitHub 登录 |
| GitHub 评论与 reactions | GitHub Discussions/Issues | Giscus 或 GitHub user token | GitHub 原生身份和权限 |
| 站内文章喜欢 | 单独数据库/Worker | 登录用户或匿名限流 token | 不伪装成 GitHub reaction，不叠加伪造初始数 |

## 7. 可借鉴点与禁止照搬点

### 7.1 可迁移

- Markdown 与元数据分离但同一次提交更新；
- 图片按内容哈希命名和去重；
- 本地图片先用占位符，提交前统一解析为稳定 URL；
- 编辑和阅读复用同一 Markdown 渲染链；
- Git tree/commit/ref API 实现多文件原子变更；
- Git history 作为内容变更审计底座；
- 新建、编辑、删除使用明确提交信息。

### 7.2 不能照搬

- 浏览器读取和缓存 GitHub App PEM；
- 用 `NEXT_PUBLIC_` 材料加密同源浏览器 secret；
- `sessionStorage` 中有 token 就当作管理员；
- 未验证 GitHub 用户 `id`；
- 未登录也公开展示敏感管理入口并依赖按钮隐藏；
- 客户端直接拿 installation token 写主分支；
- 无 base SHA 冲突 UX、无幂等和无审核地直写 main；
- 删除只有 `window.confirm`；
- 把带算法初始偏移的文章点赞展示成真实用户反馈。

## 8. 建议实施顺序与验收条件

### P0：认证与服务端安全边界

- GitHub OAuth callback、服务端会话、numeric owner ID 校验；
- GitHub App PEM 只在服务端 secret；
- 所有 mutation API 统一授权、CSRF 和日志；
- 本地开发管理员模式只允许 `import.meta.env.DEV` 且绑定 loopback，并显示醒目环境标识。

验收：未登录、普通用户、伪造客户端 `isAdmin`、修改 GitHub handle、过期 session 均不能写；只有预设 numeric owner ID 可以进入写 API；浏览器资源和存储中检索不到 PEM、installation token 或服务端 secret。

### P1：Markdown 编辑与原子提交

- 编辑表单、预览、快捷键、图片粘贴/去重；
- schema 校验、路径 allowlist、base SHA 冲突控制；
- 单 commit 包含正文、媒体和索引；
- 默认 PR，提供显式直写模式。

验收：正文和图片同时成功或同时失败；两个浏览器并发编辑不会静默覆盖；断网后草稿可恢复；恶意 slug 和超限图片被拒绝。

### P2：删除、右键与评论

- 软删除/归档与恢复；
- 统一 selection transform 的工具栏和右键菜单；
- 保留或恢复 Giscus，让 GitHub 原生处理登录、评论与 reactions；
- 如果自建 reaction 代理，token 只能在服务端，并按 GitHub 权限模型校验。

验收：键盘、鼠标、触摸均可完成格式化；删除可恢复；普通用户不能借管理员端点替他人 reaction；评论 UI 的身份、计数和 GitHub 实际数据一致。

## 9. 许可证与可复制边界

两个公开仓库的 GitHub API `license` 字段均为 `null`，当前树也未发现标准许可证文件。`X-Plore` README 虽写有“所有笔记 & 代码均为开源，可以自由获取/引用/改造，二创可以 fork”，但它没有给出许可证名称、完整条款、归属要求、专利授权或对第三方素材的授权范围。

GitHub 官方说明，没有许可证时默认版权法适用，除 GitHub 服务条款允许查看和 fork 外，其他人不能当然地复制、分发或制作衍生作品。参见 [Licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)。

因此：

- 可以学习公开可见的架构思想、API 流程和交互模式，并在 Firefly 中独立实现；
- 可以按 GitHub 平台规则查看和 fork 公开仓库；
- 不应把压缩 chunk、README 之外的大段实现、站点文案、视觉资产或笔记内容直接复制进 Firefly；
- README 的宽松表达可作为作者意图线索，但不是完整 OSI 许可证的替代；
- 若需要直接复用具体实现或资产，应先让作者补充明确许可证，或取得书面授权，并保留来源与许可记录；
- 线上 `lvyovo-wiki` 原始仓库不可访问，其许可证也无法验证，更不能推定为开源。

本文不是法律意见；对有商业或公开分发风险的直接复用，应由权利人确认。

## 10. 最终事实清单

### 已验证存在

- `lvyovo-wiki.tech/write` 的 Markdown 源码编辑、预览、快捷键；
- 图片粘贴/拖放、SHA-256 内容寻址和去重；
- 文章和站点配置的 GitHub 多文件原子 commit；
- 文章更新与删除；
- 浏览器导入 GitHub App PEM 后直接换 installation token；
- 独立 Worker 驱动的文章级点赞。

### 已验证不存在于公开仓库，且当前部署也未发现

- GitHub OAuth 登录；
- 按指定 GitHub 用户识别管理员；
- 富文本编辑器；
- 应用级右键选区菜单；
- GitHub/Giscus 评论实现；
- GitHub 评论 reaction 或管理员点赞评论。

### 仍无法验证

- `lvy010/lvyovo-wiki` 的原始源码、服务端代码、许可证与 commit 历史；
- 站点是否有未被当前路由或客户端 chunk 引用的私有管理服务；
- GitHub App 实际安装权限范围；
- Worker 点赞服务的服务端持久化、限流和反作弊细节。

这些未知项不能用客户端推断冒充事实。

## 11. 第一方来源索引

### 作者仓库与提交

- [`lvy010/X-Plore`](https://github.com/lvy010/X-Plore)
- [`X-Plore` 检查时 HEAD](https://github.com/lvy010/X-Plore/commit/23b8abdfbd6d94d69582214b43f77ba7e82b5961)
- [`lvy010/lvynote`](https://github.com/lvy010/lvynote)
- [`lvynote` 检查时 HEAD](https://github.com/lvy010/lvynote/commit/049980ebf8ccbf54554d51de6441da3882179459)
- [`lvynote` 早期 Hexo/NexT 提交](https://github.com/lvy010/lvynote/commit/a8aed6ee0628220e5ad6399606c091d7c6e5ef30)
- [`lvynote` Butterfly 提交](https://github.com/lvy010/lvynote/commit/3169b1f5e4378a3c324c0d858d3548e8e58c1f8b)

### 作者线上部署快照

- [`lvyovo-wiki.tech`](https://lvyovo-wiki.tech/)
- [`/write`](https://lvyovo-wiki.tech/write)
- [站点配置 chunk](https://lvyovo-wiki.tech/_next/static/chunks/067989d8c435963d.js)
- [GitHub API 与 PEM 认证 chunk](https://lvyovo-wiki.tech/_next/static/chunks/d9897f61a585673b.js)
- [编辑器与文章写入 chunk](https://lvyovo-wiki.tech/_next/static/chunks/114f6d02cda6a769.js)
- [文章编辑入口 chunk](https://lvyovo-wiki.tech/_next/static/chunks/810d36feb8d1f7e5.js)
- [文章点赞 chunk](https://lvyovo-wiki.tech/_next/static/chunks/8c296c207448f482.js)

### 官方文档

- [GitHub: Managing private keys for GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps)
- [GitHub: Best practices for creating a GitHub App](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app)
- [GitHub: Building a Login with GitHub button](https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-a-login-with-github-button-with-a-github-app)
- [GitHub: Generating an installation access token](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)
- [GitHub: REST API endpoints for reactions](https://docs.github.com/en/rest/reactions/reactions)
- [GitHub: Licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [Next.js: Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)

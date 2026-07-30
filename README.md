# threetwoa's blog

<p align="center">
  <em>code less, architect more</em>
</p>

<p align="center">
  Forked by <a href="https://github.com/Aafff623/fork-Firefly">threetwoa</a>
  from <a href="https://github.com/CuteLeaf/Firefly">CuteLeaf/Firefly</a>
  · 二次开发，不是官方镜像。
</p>

<p align="center">
  基于 Firefly（Astro 静态博客主题）的个人站：少写一点代码，多留一点架构的余白。<br>
  把 AI 锻成可复用工作流，把记录写进博客与数字花园。
</p>

<p align="center">
  <a href="https://fork-firefly.vercel.app">🌐 线上博客</a>
  ·
  <a href="https://threetwoa-digital-garden.vercel.app">🌿 数字花园</a>
  ·
  <a href="#快速开始">⚡ 快速开始</a>
  ·
  <a href="#showcase--演示">🖼 Showcase</a>
  ·
  <a href="#文档">📚 文档</a>
</p>

<p align="center">
  <a href="https://fork-firefly.vercel.app"><img src="https://img.shields.io/badge/Demo-Live-059669?style=for-the-badge&labelColor=0f172a" alt="Live"></a>
  <img src="https://img.shields.io/badge/Astro-7.1-FF5D01?style=for-the-badge&labelColor=0f172a&logo=astro&logoColor=white" alt="Astro">
  <img src="https://img.shields.io/badge/Svelte-5-FF3E00?style=for-the-badge&labelColor=0f172a&logo=svelte&logoColor=white" alt="Svelte">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&labelColor=0f172a&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/Node-%3E%3D22-339933?style=for-the-badge&labelColor=0f172a&logo=node.js&logoColor=white" alt="Node">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&labelColor=0f172a" alt="License">
</p>

<p align="center">
  <img src="assets/images/readme/banner.png" alt="threetwoa's blog banner" width="100%">
</p>

<p align="center">
  <a href="#为什么">为什么</a>
  · <a href="#功能">功能</a>
  · <a href="#preview">Preview</a>
  · <a href="#showcase--演示">演示</a>
  · <a href="#快速开始">快速开始</a>
  · <a href="#架构">架构</a>
  · <a href="#主链路">主链路</a>
  · <a href="#目录结构">目录</a>
  · <a href="#路线图">路线图</a>
  · <a href="#文档">文档</a>
</p>

---

## 为什么

个人博客 fork 主题时常见问题：

- 配置散落，不知道该改哪、不该碰哪
- Agent 一改就漂：顺手重构布局、OG 指错域名
- 本地看着行，push 后线上才发现挂

**本仓边界：**

| 层 | 职责 |
|---|---|
| `src/config` / `src/content` | 日常换皮、写文、开关页面 |
| `Firefly_docs`（工作区旁路） | 官方配置语义单一查阅源 |
| `CONTEXT` / `AGENTS` / MDC | Agent 硬约束与术语 |
| 布局 / plugins / `astro.config` | 非必要不改（上帝文件） |
| Vercel `fork-firefly` | 静态托管；默认 **不** 开 `CF_WORKERS` |

```text
config + content → pnpm dev 验收 → push → Vercel Ready → 核线上
```

---

## 功能

| 功能 | 说明 | 边界 |
|------|------|------|
| **配置驱动** | 站点 / 侧栏 / 壁纸 / 字体 / 评论等均在 `src/config/*.ts` | 不改布局也能换品牌 |
| **Astro SSG** | 构建为静态 `dist` | 默认非 SSR |
| **Svelte 岛屿** | 搜索、设置、分页等交互 | 仅必要客户端 |
| **Pagefind** | 全文搜索 | 构建期索引 |
| **布局系统** | 单/双侧栏 · 列表/网格 · 多壁纸模式 | 见主题布局指南 |
| **Markdown 扩展** | 提醒框、Mermaid、PlantUML、Wiki Link… | `src/plugins` |
| **动态 / 相册等** | 主题内置扩展页 | `siteConfig.pages.*` 可关 |

<!-- ![features](assets/images/readme/features.png) -->

---

## Preview

**本仓无独立资产 Preview 站**（单产品博客，不是组件 Gallery）。产品界面见下方 Showcase。

### README 本地预览壳

边写边看排版（必须 HTTP，禁止 `file://`）：

```bash
cd Firefly   # 或 fork-Firefly 根目录
python -m http.server 8090
```

打开：http://127.0.0.1:8090/preview-readme.html

风格对齐：[agent-cfo](https://github.com/San-Y108/agent-cfo) / [fork-zhouli-translator](https://github.com/Aafff623/fork-zhouli-translator) 的 `preview-readme.*` 约定。

---

## Showcase · 演示

推荐路径：首页 → 文章 → 动态 → 归档 / 关于 / 图库。

线上：https://fork-firefly.vercel.app

### Showcase — Blog

<table>
  <tr>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-home.png"><img alt="首页" src="assets/images/readme/showcase-home.png" width="100%"></a>
      <br><strong>首页</strong><br>
      <sub>品牌标题 · 列表/网格 · 双侧栏 · 壁纸横幅</sub><br>
      <a href="https://fork-firefly.vercel.app/">打开首页</a>
    </td>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-post.png"><img alt="文章页" src="assets/images/readme/showcase-post.png" width="100%"></a>
      <br><strong>文章页</strong><br>
      <sub>封面 / TOC / Markdown 扩展 / 上下篇</sub><br>
      <a href="https://fork-firefly.vercel.app/posts/guide/firefly-layout-system/">打开示例文</a>
    </td>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-dynamic.png"><img alt="动态" src="assets/images/readme/showcase-dynamic.png" width="100%"></a>
      <br><strong>动态</strong><br>
      <sub>碎碎念时间线（可接 Memos）</sub><br>
      <a href="https://fork-firefly.vercel.app/dynamic/">打开动态</a>
    </td>
  </tr>
  <tr>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-archive.png"><img alt="归档" src="assets/images/readme/showcase-archive.png" width="100%"></a>
      <br><strong>归档</strong><br>
      <sub>按年折叠 · 分类导航</sub><br>
      <a href="https://fork-firefly.vercel.app/archive/">打开归档</a>
    </td>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-about.png"><img alt="关于" src="assets/images/readme/showcase-about.png" width="100%"></a>
      <br><strong>关于</strong><br>
      <sub>个人页 · 品牌与介绍</sub><br>
      <a href="https://fork-firefly.vercel.app/about/">打开关于</a>
    </td>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-gallery.png"><img alt="图库" src="assets/images/readme/showcase-gallery.png" width="100%"></a>
      <br><strong>图库</strong><br>
      <sub>相册网格 · 视觉内容</sub><br>
      <a href="https://fork-firefly.vercel.app/gallery/">打开图库</a>
    </td>
  </tr>
</table>

截图：本地 `http://127.0.0.1:4321` · Playwright · `scripts/capture-readme-showcase.py`  
版式参考：[合乎周礼 Showcase](https://github.com/Aafff623/fork-zhouli-translator#showcase--landing-page-) · [AgentCFO 演示](https://github.com/San-Y108/agent-cfo#%E6%BC%94%E7%A4%BA)

---

## 快速开始

```bash
git clone https://github.com/Aafff623/fork-Firefly.git
cd fork-Firefly
pnpm install   # 若镜像 404：pnpm install --registry https://registry.npmjs.org
pnpm dev       # http://localhost:4321
```

| 要求 | 版本 |
|------|------|
| Node | ≥ 22 |
| pnpm | ≥ 9（锁 `9.14.4`） |

```bash
pnpm build
pnpm check
pnpm new-post <slug>
pnpm new-d <一句话动态>
```

配置入口：`src/config/siteConfig.ts` · `profileConfig.ts`  
部署：push `master` → Vercel 项目 **fork-firefly** 自动构建。

---

## 架构

| 层 | 内容 |
|----|------|
| **Authoring** | `src/config` · `src/content` · 旁路 `Firefly_docs` |
| **Build** | Astro 7 SSG · remark/rehype · LQIP · font subset · Pagefind |
| **Runtime** | `dist` · Vercel CDN · Browser（Swup / Svelte islands） |

```text
Authoring → Astro build → static dist → Vercel → Browser
```

**栈：** Astro 7 · Svelte 5 · Tailwind 4 · TypeScript · pnpm · Biome · Pagefind · Swup · Vercel  

生图 Prompt（唯一入口，复制即用）：[`docs/outputs/prd/readme-diagrams/readme-image-prompts.md`](./docs/outputs/prd/readme-diagrams/readme-image-prompts.md)

---

## 主链路

```text
改 config / content
  → pnpm dev 本地预览
  → 本地校验（目视 + pnpm check）
  → git push
  → Vercel Ready
  → https://fork-firefly.vercel.app 再核
```

细则：[`docs/agents/workflow.md`](./docs/agents/workflow.md) · [`AGENTS.md`](./AGENTS.md)

---

## 目录结构

<details>
<summary>展开仓库树（摘要）</summary>

```text
Firefly/
├── src/
│   ├── config/           # 站点开关与文案
│   ├── content/          # posts · dynamic · spec
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── plugins/
│   └── utils/
├── public/
├── scripts/
├── docs/                 # agents · adr · glossary · knowledge · outputs
├── assets/images/readme  # README 契约配图
├── AGENTS.md · CONTEXT.md · LANGUAGES.md · CLAUDE.md
├── preview-readme.html   # README 本地预览壳 · 端口 8090
└── vercel.json
```

</details>

---

## 路线图

| 项 | 状态 |
|----|:----:|
| Phase A 治理 + 品牌 + Vercel | ✅ |
| Phase B README 结构 / Prompt / 预览壳 | ✅ |
| README 对齐 zhouli / agent-cfo 版式 | ✅ |
| Showcase Playwright 截图落盘 | ✅ |
| `banner.png` | ✅ |
| `features.png` / `architecture.png` / `workflow.png` 出图 | ⏳ |
| 替换 demo 文 / 头像（其他 plan） | — |

---

## 文档

| 文档 | 说明 |
|------|------|
| [`CONTEXT.md`](./CONTEXT.md) | 领域事实 |
| [`AGENTS.md`](./AGENTS.md) | Agent 硬约束 |
| [`LANGUAGES.md`](./LANGUAGES.md) | 共享用词 |
| [`docs/knowledge/firefly-ops.md`](./docs/knowledge/firefly-ops.md) | Day-2 运维 |
| [`docs/glossary/frontend-ui.md`](./docs/glossary/frontend-ui.md) | UI 术语 |
| [`docs/outputs/prd/readme-diagrams/readme-image-prompts.md`](./docs/outputs/prd/readme-diagrams/readme-image-prompts.md) | README 生图 Prompt（按三模块） |
| 旁路 `../Firefly_docs/` | Firefly 官方配置指南 |
| [`README.en.md`](./README.en.md) | 上游英文说明（保留） |

风格参照：

- [Aafff623/fork-zhouli-translator](https://github.com/Aafff623/fork-zhouli-translator) — fork 叙事 · Showcase 三列表 · 居中导航  
- [San-Y108/agent-cfo](https://github.com/San-Y108/agent-cfo) — 边界表 · for-the-badge · 演示分层  

---

## 致谢与许可

- 主题：[CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly) · 源自 [fuwari](https://github.com/saicaca/fuwari)  
- 行为准则：[andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)  
- License：MIT（见 `LICENSE`）。二次开发请保留上游版权声明。

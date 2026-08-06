# README 配图 Brief（契约层）

> **契约已落地归档（2026-08-04）**：下列文件名与状态已与 `assets/images/readme/` 实盘对齐。勿再按旧名 `banner.png` / `architecture.png` 找图。  
> 现行色锚见 `CONTEXT.md`（Kraken 主紫 hue 290）；下文青绿表仅保留作 Phase B 生图史档。  
> **状态刷新：2026-08-05** — README Polish 迭代：Integrations 小节落地；`tech-stack.svg` 节点对齐现行；Showcase 六张自 `localhost:4321` 重截。

- 项目：threetwoa's blog / fork-Firefly（standalone；仓名带 `fork-` 历史前缀）
- 日期：2026-07-30（契约起草）· 状态刷新：2026-08-05
- Phase：B · README Polish — **主资产已挂 README**；本轮为集成盘点 + 行文 + 重截
- 范文偏向：产品演示向 + standalone 声明 + 边界/徽章密度

## 风格参照（必读）

| 仓库 | 学什么 | 不学什么 |
|---|---|---|
| [fork-zhouli-translator](https://github.com/Aafff623/fork-zhouli-translator) | 居中链接行、Showcase `<table>` 三列、真机图+短说明+外链 | 周礼业务文案、Next/Workers 栈 |
| [agent-cfo](https://github.com/San-Y108/agent-cfo) | `for-the-badge`+深色 label、为什么+边界表、Showcase 分层 | 黑客松赛道叙事、团队表（本仓个人站不需要） |

## 定位与受众

| 项 | 值 |
|---|---|
| 一句话 | Firefly 主题二次开发的个人静态博客 |
| 受众 | 自己维护 · 访客 · 想复用治理范式的开发者 |
| 线上 | https://fork-firefly.vercel.app |

## 章节地图（与实盘一致）

| 章节 | 实盘文件 | 状态 |
|---|---|---|
| Header | `banner-pixel-garden.png` | 已挂 README；徽章 `for-the-badge` |
| Project / Key docs | — | Key docs **展开**（无 `<details>`）；声明无 Preview 壳 |
| Features | — | Integration 行加厚（Waline / Iconify / SpritePet / music / COS） |
| Integrations | — | **2026-08-05 新增**：现行 vs 备选表 |
| Showcase | `showcase-{home,post,dynamic,archive,about,gallery}.png` | **2026-08-05 重截**（源 `localhost:4321`；脚本隐藏桌宠与 `#gift-surprise-toast`） |
| 架构 | `architecture.svg` | 已挂；Runtime 表文字对齐 Waline / SpritePet / Iconify |
| 技术栈 | `tech-stack.svg` | **2026-08-05**：INTERACTION 加 Iconify；OPTIONAL → SITE INTEGRATIONS（Waline+GIF / SpritePet / Local music / COS）；正文补分层表 |
| 功能 / 主链路说明图 | （未出 `features.png` / `workflow.png`） | 可选；非阻塞 |

落盘目录：`assets/images/readme/`。生图史档 Prompt 见 [`readme-image-prompts.md`](./readme-image-prompts.md)（文件名可能仍写旧 `banner.png`，以本表实盘名为准）。

## Showcase 重截记录

| 项 | 值 |
|---|---|
| 日期 | 2026-08-05 |
| 源 | `http://localhost:4321`（`pnpm dev`） |
| 脚本 | `scripts/capture-readme-showcase.py` |
| 视口 | 1440×900 · light · DSF 1 |
| HIDE_CSS | `.sprite-pet-root` · `#pio-container` · `#gift-surprise-toast` / `.gift-surprise-toast` |

## 色板（Phase B 生图史档 · 4–6 色）

| 角色 | 建议（史） |
|---|---|
| 主色 | `#0D9488` |
| 辅色 | `#0F172A` |
| 中性 | `#FFFFFF` / `#F1F5F9` / `#94A3B8` |
| 强调 | `#F59E0B`（少用） |

站点运行时主题锚点以 `CONTEXT.md` / `siteConfig` 为准，勿把上表当成现行 UI 规范。

## Agent 边界

- README Polish **只改**：`README.md` · `docs/outputs/prd/readme-diagrams/**` · `assets/images/readme/**` · 必要时 `scripts/capture-readme-showcase.py`（HIDE_CSS）
- README 本地预览壳：根目录 `preview-readme.{html,css,js}` · `python -m http.server 8090` · http://127.0.0.1:8090/preview-readme.html
- **不改** `src/config` / layouts / 其他 plan 正在动的模块

## 验收

- [x] README 居中 Header + standalone/来源说明 + Showcase 三列表
- [x] Showcase 截图落盘并写入 README（2026-08-05 重截）
- [x] `banner-pixel-garden.png` 已挂 README Header
- [x] `architecture.svg` / `tech-stack.svg` 已挂；tech-stack 节点已对齐现行
- [x] Integrations 小节落地；Key docs 无折叠
- [x] 徽章 `for-the-badge`；声明无 Preview
- [ ] （可选）features / workflow 说明图
- [ ] push 后核 GitHub README 渲染（待用户指令）

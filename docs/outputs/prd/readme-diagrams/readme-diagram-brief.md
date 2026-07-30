# README 配图 Brief（契约层）

- 项目：threetwoa's blog / fork-Firefly
- 日期：2026-07-30
- Phase：B · README Polish（续：对齐参照仓版式）
- 范文偏向：**产品演示向** + **fork 叙事**（zhouli）+ **边界/徽章密度**（agent-cfo）
- Architecture 标杆：`three-tier-layered.png`

## 风格参照（必读）

| 仓库 | 学什么 | 不学什么 |
|---|---|---|
| [fork-zhouli-translator](https://github.com/Aafff623/fork-zhouli-translator) | Fork 声明、居中链接行、Showcase `<table>` 三列、真机图+短说明+外链 | 周礼业务文案、Next/Workers 栈 |
| [agent-cfo](https://github.com/San-Y108/agent-cfo) | `for-the-badge`+深色 label、为什么+边界表、Showcase 分层、可验证 Demo 链接 | 黑客松赛道叙事、团队表（本仓个人站不需要） |

## 定位与受众

| 项 | 值 |
|---|---|
| 一句话 | Firefly 主题二次开发的个人静态博客 |
| 受众 | 自己维护 · 访客 · 想复用治理范式的开发者 |
| 线上 | https://fork-firefly.vercel.app |

## 章节地图

| 章节 | 配图节点 | 状态 |
|---|---|---|
| Header | `banner.png` | 版式已对齐；图待出 |
| 为什么 | — | 边界表已写 |
| 功能 | `features.png` | 表已写；图待出 |
| Preview | README 壳 8090 | 声明无 Gallery |
| Showcase | `showcase-home/post/dynamic.png` | 三列表+线上链接；截图待补 |
| 快速开始 / 架构 / 主链路 / 目录 / 路线图 / 文档 | — | 已维护 |

## 色板（4–6 色）

| 角色 | 建议 |
|---|---|
| 主色 | `#0D9488` |
| 辅色 | `#0F172A` |
| 中性 | `#FFFFFF` / `#F1F5F9` / `#94A3B8` |
| 强调 | `#F59E0B`（少用） |

## Agent 边界

- README Polish **只改**：`README.md` · `preview-readme.*` · `docs/outputs/prd/readme-diagrams/**` · `assets/images/readme/**`
- **不改** `src/config` / layouts / 其他 plan 正在动的模块

## 验收

- [x] README 居中 Header + fork 说明 + Showcase 三列表
- [x] 参照仓链接写入文档节
- [ ] banner / showcase 真图落盘
- [ ] 本地 `8090` 预览壳 OK → push → 核 GitHub README 渲染

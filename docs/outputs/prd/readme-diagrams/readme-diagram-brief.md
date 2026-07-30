# README 配图 Brief（契约层）

- 项目：threetwoa's blog / fork-Firefly
- 日期：2026-07-30
- Phase：B · README Polish
- 范文偏向：**产品演示向**（xianghai / ResumeWise 结构意图）
- Architecture 标杆：`three-tier-layered.png`（内容/配置 → Astro SSG → 静态托管）

## 定位与受众

| 项 | 值 |
|---|---|
| 一句话 | Firefly 主题二次开发的个人静态博客：code less, architect more |
| 受众 | 自己维护 · 访客 · 想复用治理范式的开发者 |
| 线上 | https://fork-firefly.vercel.app |

## 章节地图

| 章节 | 配图节点 | 状态 |
|---|---|---|
| Header | `banner.png` | Prompt 已写；图待用户出 |
| 为什么 | — | 文案 |
| 功能 | `features.png` | Prompt 已写；图待出 |
| Preview | — | **本仓省略 Preview 站**（单产品博客）；仅 README 本地预览壳 |
| Showcase | `showcase-home.png` 等 | `method: screenshot`；占位 |
| 快速开始 | — | 命令 |
| 架构 | `architecture.png` + `tech-stack.png` | Prompt 已写 |
| 主链路 | `workflow.png` | Prompt 已写 |
| 目录 | Markdown 树 | 不出 structure 图 |
| 路线图 / 文档 / License | — | 表 |

## 色板（4–6 色）

| 角色 | 建议 |
|---|---|
| 主色 | Firefly 默认 hue≈165 青绿感 `#0D9488` |
| 辅色 | 墨蓝字 `#0F172A` |
| 中性 | 白 `#FFFFFF` / 浅灰 `#F1F5F9` / 灰线 `#94A3B8` |
| 强调 | 琥珀一点 `#F59E0B`（少用） |

## Preview 决策

- **无** `src/website-preview/` 类资产 Gallery → README 声明省略 Preview 站。
- **有** 根目录 `preview-readme.html`：本地渲染 README 本身（端口 **8090**）。

## Showcase 决策

推荐路径：首页 → 文章详情 → 动态（可选）。截图待补，README 先占位。

## 验收

- [ ] brief 与 prompts 路径在 `docs/outputs/prd/readme-diagrams/`
- [ ] README 章节齐全，图引用契约文件名
- [ ] Preview 省略已声明；README 壳可启动
- [ ] Showcase 槽位或真图
- [ ] 本地预览 → push → 核线上（交付闭环）

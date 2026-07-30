# Prompt Feed Catalog（Agent 直接喂）

出图任务时按行取用：`reference_image` + 对应 Prompt 文件。路径相对 skill 根 `readme-polish/`。

## Banner

| reference_image | 气质 | Prompt 文件 |
|-----------------|------|-------------|
| `references/banner/brand-system-creative-tim.png` | 品牌系统：几何 logo + 克制色板 + 字重层级 | `prompts/banner.md` § brand-system |
| `references/banner/saas-dark-hero-storm.png` | 暗色 SaaS hero：大标题 + 双 CTA + 克制背景 | `prompts/banner.md` § dark-saas-hero |
| `references/banner/saas-hero-jasper.png` | 浅色营销 hero：柔和渐变 + 抽象 3D 块（勿花） | `prompts/banner.md` § soft-saas-hero |

## Features

| reference_image | 气质 | Prompt 文件 |
|-----------------|------|-------------|
| `references/features/infographic-modules-pack.png` | 统一图标 + 分栏模块信息图 | `prompts/features.md` |
| `references/features/tree-flow-mindmap-trio.png` | 树 / 流程 / 思维导图三选一（Features 可用 mindmap 分支） | `prompts/features.md` |

## Architecture（任选一种，禁止混糊）

| reference_image | 气质 | Prompt 文件 |
|-----------------|------|-------------|
| `references/architecture/bytebytego-microservices.png` | 网关 + 多服务 + DB/服务 | `prompts/architecture.md` §1 |
| `references/architecture/bytebytego-client-server.png` | Client→LB→Server→DB | `prompts/architecture.md` §2 |
| `references/architecture/bytebytego-cdn-guide.png` | 高密度模块信息图 | `prompts/architecture.md` §3 |
| `references/architecture/clean-architecture-onion.png` | 经典洋葱圆 | `prompts/architecture.md` §4 |
| `references/architecture/clean-architecture-purple.png` | 单色洋葱 + 控制流 | `prompts/architecture.md` §4b |
| `references/architecture/c4-model-levels.png` | C4 Context/Container | `prompts/architecture.md` §5 |
| `references/architecture/aws-cloud-native.png` | 官方图标 + 边界 + 编号 | `prompts/architecture.md` §6 |
| `references/architecture/three-tier-layered.png` | Presentation / Business / Data 三层 | `prompts/architecture.md` §7 |
| `references/architecture/layered-architecture-pattern.png` | 水平层条 + Request/Service 流 | `prompts/architecture.md` §8 |

## Tech-stack

| reference_image | 气质 | Prompt 文件 |
|-----------------|------|-------------|
| `references/tech-stack/icon-wall-slidestack.png` | 统一图标墙 + 标签 | `prompts/tech-stack.md` |

## Workflow

| reference_image | 气质 | Prompt 文件 |
|-----------------|------|-------------|
| `references/workflow/sipoc-lanes.png` | 泳道 / SIPOC 五列 | `prompts/workflow.md` § sipoc |
| `references/workflow/stage-decision-sales.png` | 分阶段 + 菱形决策点 | `prompts/workflow.md` § stage-decision |
| `references/workflow/flowchart-standard.png` | 标准流程图（起止/决策） | `prompts/workflow.md` § flowchart |

## Structure

| reference_image | 气质 | Prompt 文件 |
|-----------------|------|-------------|
| `references/structure/folder-tree-quarters.png` | 目录树：色分层级 | `prompts/structure.md` |
| `references/structure/tree-org-chart.png` | 组织树（顶层目录映射） | `prompts/structure.md` |

**默认建议**：Structure 用 Markdown `<details>` 树，不出图。

## Preview / Showcase（截图，不生图冒充 UI）

| reference_image | 用途 | Prompt 文件 |
|-----------------|------|-------------|
| `references/preview/saas-dashboard-prodly.png` | 预览站 / Dashboard 密度气质 | `prompts/preview-showcase.md` |
| `references/preview/saas-dashboard-dark-tablet.png` | 暗色产品壳气质 | `prompts/preview-showcase.md` |
| `references/preview/saas-landing-with-shell-storm.png` | Landing + 壳预览同屏参考 | `prompts/preview-showcase.md` |
| `references/showcase/sniffnet-*.png` | 开源工具真机条 | 同上 |
| `references/showcase/saas-dashboard-*.png` | SaaS Dashboard 对标 | 同上 |

字段模板（写入项目 `readme-image-prompts.md`）：

```yaml
asset: architecture.png
style_key: three-tier-layered
reference_image: references/architecture/three-tier-layered.png
prompt_file: references/prompts/architecture.md#7
method: image-to-image   # or screenshot | markdown-tree | excalidraw
project_labels: [...]
avoid: [spider-web, >6 colors, fake text, neon glow]
```

# README 配图视觉标准（过关 / 否决）

## Agent 学习重点（硬约束）

1. **颜色**：控制在 **4–6 色**（主色 + 辅色 + 中性灰/黑白）  
2. **几何**：线条粗细统一、圆角一致、间距网格对齐  
3. **层级**：标题 > 模块 > 细节（可扫读）  
4. **Showcase / Preview**：必须是 **真实运行界面**（Playwright / 实机），不是画出来的  
5. **Banner**：宁简勿繁，优先气质与可读性  

## 总原则

专业 README 图应像：**设计系统板 / ByteByteGo / C4 / 官方分层图 / 真机 SaaS**。  
不是「看起来很复杂其实乱」的 AI 生成图。

## 全局硬约束（说明图类）

| 维度 | 过关 | 否决 |
|------|------|------|
| 背景 | 白 / 浅灰 / 克制暗色平面 | 噪点、炫光、无意义渐变堆叠 |
| 颜色 | 4–6 色功能色 + 中性 | 彩虹、每块一种高饱和 |
| 图标 | 同一描边 / 同一透视体系 | 3D 与扁平混用、贴纸风 |
| 连线 | 正交、箭头统一、少交叉 | 蜘蛛网、重叠无标注 |
| 文字 | 清晰标签 | 糊字、假文字、乱码 |
| 构图 | 主路径清晰 | 模块乱堆 |

## 分类型标准

### Banner
- 要：3:1；品牌感；最多一句价值主张；大留白  
- 标杆：`banner/brand-system-creative-tim.png`、`saas-dark-hero-storm.png`、`saas-hero-jasper.png`  
- 不要：胶囊生成器花活、堆角色插画、大段正文叠图  

### Features
- 模块卡或「图标 + 短标题 + 一行说明」；图标统一  
- 标杆：`features/infographic-modules-pack.png`  
- 单卡别写海报长文  

### Architecture
- 任选一种主风格（见 `architecture/`），禁止混成大杂烩  
- 分层 / 边界 / 依赖方向必须一眼可读  

### Tech-stack
- 统一图标墙 **或** 分层条；标签真实技术名  
- 标杆：`tech-stack/icon-wall-slidestack.png`  
- 与 `architecture.png` 分工：拓扑 vs 栈，勿重复同一张构图  

### Workflow
- 一条主路径；决策点用菱形等标准符号；分支 ≤ 2 且次要  
- 标杆：`workflow/sipoc-lanes.png`、`stage-decision-sales.png`  

### Structure
- **默认 Markdown 树**  
- 若出图：色分层级、文件夹 vs 文件区分、正交折线  
- 标杆：`structure/folder-tree-quarters.png`  

### Preview / Showcase
- 真实 UI；密度高但分区清晰；颜色统一  
- 气质条：`preview/`、`showcase/`（含 Sniffnet / SaaS Dashboard）  
- **禁止**说明图冒充  

## 验收清单

- [ ] 已选 `reference_image`（说明图）或 `method: screenshot`（Preview/Showcase）  
- [ ] Prompt 含 4–6 色 / 统一圆角线条 / no spider-web / no fake text  
- [ ] 节点名已替换为本项目真实名称  
- [ ] Structure 是否优先代码块树  
- [ ] Showcase 未用生图伪造产品 UI  

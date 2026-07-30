# Architecture / Tech-stack — 反推 Prompt（对齐 references/architecture）

Agent 必须：  
1. 打开对应标杆 PNG，提炼构图；  
2. 用本文件模板改写为 **本项目真实拓扑**；  
3. 在 `readme-image-prompts.md` 里写明 `reference_image:` 相对本 skill 的路径。

---

## 0. 全局系统指令（所有架构图共用）

```text
Create a professional software architecture diagram for a GitHub README.
Benchmark style: ByteByteGo / clean system-design infographic / C4-like clarity.
White or near-white background. Flat vector icons. Thin consistent black arrows.
At most 5 accent colors total. Rounded rectangles, clear labels in English (or project terms).
High information clarity, low decoration. Uniform icon stroke weight.
NO: isometric 3D clutter, neon glow, tangled spider-web lines, unreadable micro-text,
fake logos, photoreal servers, purple sci-fi backgrounds, random decorative shapes.
Every box must be a real component from the project description below.
```

---

## 1. ByteByteGo — Microservices 流

**标杆**：`references/architecture/bytebytego-microservices.png`

**从图反推的结构特征**

- 顶栏圆角标题胶囊  
- 左：Client（Web / Mobile）→ 中：API Gateway → 右：多个虚线框 Microservice，每框内 Service → DB  
- 颜色：品红标题/网关、粉 Service、绿 DB、浅褐分组底  

**Prompt**

```text
[系统指令见 §0]

Match the layout language of a ByteByteGo-style microservices diagram:
- Top center title pill: "[TITLE]"
- Left: client icons (web, mobile) labeled Client
- Center: API Gateway (or [PROJECT_GATEWAY_NAME]) as the hub
- Right: N dashed rounded groups, each "[SERVICE_NAME]" with inner Service box → DB cylinder
- Left-to-right arrows; one gateway to many services; no crossing mess

Project mapping:
[粘贴：真实服务名、网关、数据库、调用关系]

Output: clean wide diagram, README-ready, labels legible at 1200px width.
```

---

## 2. ByteByteGo — Client-Server 基础设施链

**标杆**：`references/architecture/bytebytego-client-server.png`

**结构特征**

- 标题胶囊  
- 主链：Client → Internet → Load Balancer → Server → Main DB  
- 支链：Internet → CDN；Server ↔ Cache；Main DB ↔ Backup  

**Prompt**

```text
[系统指令见 §0]

ByteByteGo-style client-server infrastructure diagram on white background.
Horizontal primary path left-to-right.
Title pill at top: "[TITLE]".
Nodes (replace with project names): Client → [Edge/Internet] → [LoadBalancer] → [AppServer] → [PrimaryDB].
Optional branches: CDN under edge; Cache above server (bidirectional); Backup under DB (bidirectional).
Flat icons: browser, globe, balancer, server rack, red cache stack, green/orange DB cylinders.
Sparse pastel accents; black thin arrows; generous spacing.

Project mapping:
[...]
```

---

## 3. ByteByteGo — 高密度模块信息图

**标杆**：`references/architecture/bytebytego-cdn-guide.png`

**结构特征**

- 分区虚线框（策略 / 类型）  
- 中部彩色模块横排 + 下方要点列表  
- 侧栏合规/约束卡片  
- 可用 `#Keyword` 短标签  

**适用**：Tech-stack 总览、能力地图（不是部署拓扑时用这个）。

**Prompt**

```text
[系统指令见 §0]

ByteByteGo educational infographic style (like a clean CDN guide):
- Soft off-white background
- Top dashed group of 4–6 small strategy/capability cards with simple flat icons
- Middle horizontal flow of 3–5 colored modules with short bullet lists under each
- Optional bottom taxonomy branches
- Optional side callout card for constraints/compliance
- Muted pastel palette, consistent icon set, thin connectors
- Hashtag-style short labels allowed (e.g. #RiskCheck)

Topic: [PROJECT] technology / capability map.
Modules to include: [list]
Do NOT invent vendors or products not in the list.
```

---

## 4. Clean Architecture 同心圆

**标杆**：`references/architecture/clean-architecture-onion.png`

**结构特征**

- 四层同心圆：Entities → Use Cases → Interface Adapters → Frameworks & Drivers  
- 依赖箭头向内；可附右下角控制流小图  

**Prompt**

```text
[系统指令见 §0]

Uncle Bob Clean Architecture onion diagram, professional textbook clarity.
Four concentric rings with soft distinct colors (yellow core → peach → green → blue outer).
Labels mapped to THIS project:
- Entities: [...]
- Use Cases: [...]
- Adapters: [...]
- Frameworks/Drivers: [...]
Arrows from outer rings inward (Dependency Rule).
Optional small "flow of control" inset: Controller → UseCase → Presenter.
White background, legend for ring colors, no clutter icons inside rings except short text.
```

---

## 5. C4 Model 分层

**标杆**：`references/architecture/c4-model-levels.png`

**结构特征**

- Context：人 + 系统 + 外部系统（灰）  
- Container：虚线系统边界内 Web/API/DB  
- Component：单一容器内部模块  
- 蓝灰配色、虚线关系、协议标注  

**Prompt**

```text
[系统指令见 §0]

C4 model diagram set OR single Container diagram for README (prefer one clear Container view if only one image).
Colors: dark blue = system under design; medium blue = containers; light blue = components; gray = external systems.
Person icon for users. Cylinder for databases. Dashed system boundary.
Labeled arrows with protocol hints where real (e.g. HTTPS, JSON).

Level: [Context | Container | Component]
System name: [...]
Containers: [...]
Externals: [...]
Relationships: [...]
```

---

## 6. AWS / 云原生官方图标风

**标杆**：`references/architecture/aws-cloud-native.png`

**结构特征**

- 嵌套边界（VPC / Cluster）  
- 官方风格服务图标  
- 编号步骤 1…n  

**Prompt**

```text
[系统指令见 §0]

Cloud architecture diagram in official-icon documentation style (AWS-like clarity), white background.
Nested boundaries with distinct border colors for [VPC/Project boundary] and [runtime cluster].
Use recognizable flat service icons ONLY for technologies actually used: [list real stack].
Numbered blue badges for the main request or deploy path (1..n).
Show users/dev actors on the left if relevant.
No decorative 3D. No invented AWS services.

Project mapping:
[...]
```

---

## 4b. Clean Architecture 单色洋葱（batch-2）

**标杆**：`references/architecture/clean-architecture-purple.png`

```text
[系统指令见 §0]

Monochrome purple Clean Architecture onion + legend + small flow-of-control inset.
Four rings: Entities → Use Cases → Controllers/Gateways/Presenters → Frameworks (UI/DB/Web).
White/light gray canvas. Dependency arrows inward.
Map ring labels to THIS project only.
```

---

## 7. Three-tier 分层盒（batch-2）

**标杆**：`references/architecture/three-tier-layered.png`

```text
[系统指令见 §0]

Three stacked rounded tier containers on light grid background:
1) Presentation Tier  2) Business Tier  3) Data Tier
Each tier has a soft tint (lavender / pink / peach) and darker component boxes inside.
Thin black arrows between related boxes; avoid crossings.
Replace box labels with real project modules:
Presentation: [...]
Business: [...]
Data: [...]
```

---

## 8. Layered Architecture Pattern 水平层条（batch-2）

**标杆**：`references/architecture/layered-architecture-pattern.png`

```text
[系统指令见 §0]

Minimal layered architecture: four identical horizontal blue bars stacked:
Presentation → Business → Persistence → Database
Inside each bar: 1–3 "Component" chips renamed to real modules.
Left downward arrows labeled Request; right upward arrows labeled Service/Response.
White background, high contrast, no decoration.
```

---

## Architecture 选型表

| 情况 | 用哪套 |
|------|--------|
| 运行时拓扑（网关/服务/DB） | §1 或 §2 |
| 能力地图信息图 | §3 |
| 洁净架构 / 依赖规则 | §4 或 §4b |
| C4 容器视图 | §5 |
| 云部署真实服务 | §6 |
| 经典三层 / N 层 | §7 或 §8 |

技术栈图标墙见独立文件 `prompts/tech-stack.md`（`tech-stack.png`）。  
`architecture.png` 与 `tech-stack.png`：**不要两张重复同一构图**。

## 产出时写入项目 brief 的字段示例

```yaml
asset: architecture.png
style: bytebytego-microservices
reference_image: references/architecture/bytebytego-microservices.png
aspect: 16:9
must_replace_labels:
  - API Gateway → Cobo CAW Adapter
  - Microservice A → Risk Check
```

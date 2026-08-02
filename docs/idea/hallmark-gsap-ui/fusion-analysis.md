# Hallmark × GSAP 融合分析

> Status: **step-1 complete** · 本篇只做结合部诊断，**不写 skill / MDC**  
> 后续：step-2 MiniMax 生图规范并入 · step-3 临时 HTML 实测 · step-4 才落 skill/rule  
> 日期：2026-08-02 · session: 灵感库

## 一句话

Hallmark 管 **「该不该动、动成什么样、看起来像不像人做的」**；  
GSAP 管 **「怎么按时序、可打断、可清理地把那一动做出来」**。  
二者交界在：**Hallmark 的运动语言（时长桶 / 缓动 token / 状态机 / 克制上限）→ 映射成 GSAP 的 vars / timeline / matchMedia**。

---

## 1. 各自职责（不重叠）

| 维度 | Hallmark | GSAP skills |
|---|---|---|
| 本体 | 反 AI-slop **设计纪律**（结构、token、状态、文案诚实） | **动画引擎用法**（tween / timeline / ScrollTrigger / 性能） |
| 输出 | 组件静态样式 + 8 态 + motion *意图* | 可执行的 JS 动画代码 |
| 决策 | 动多少、禁什么、何时 motion-cut | 用什么 API、如何 cleanup、如何 60fps |
| 对本站 | Astro + Svelte islands；先读现有 token | Firefly 交互岛 → 优先 **gsap-frameworks（Svelte）**，非 React |

Hallmark 已明确：单元素 fade → CSS；复杂编排 / scrub → 才值 GSAP 的 ~50KB（`custom-craft.md` Tier C）。

---

## 2. 规范对照：结合部地图

### 2.1 属性白名单（几乎 1:1）

| Hallmark | GSAP | 融合规则 |
|---|---|---|
| 只动 `transform` + `opacity` | `x/y/scale/rotation` + `autoAlpha` | 组件动效默认只允许这组；禁 width/height/top/left |
| `autoAlpha` 优于裸 opacity | 同左 | 淡出用 `autoAlpha: 0`，避免幽灵点击层 |
| 禁预置全站 `will-change` | 同左 | 仅在 tween 期间挂、结束 `clearProps` |

### 2.2 时长桶 → GSAP duration

| Hallmark token | 语义 | GSAP 建议 |
|---|---|---|
| `--dur-micro` ~120ms | 按下、勾选 | `duration: 0.1–0.12` |
| `--dur-short` ~220ms | hover、菜单开 | `duration: 0.18–0.22` |
| `--dur-long` ~420ms | modal、区块 reveal | `duration: 0.35–0.45` |
| Exit ≈ Enter × 0.6–0.75 | 离场更快 | timeline 第二段更短，或 `duration` 显式打折 |

**融合点：** skill 应强制「先读 Hallmark 时长桶，再写 GSAP duration」，禁止随手 `duration: 1`。

### 2.3 缓动 token → GSAP ease

| Hallmark CSS | 语义 | GSAP 近似（禁 bounce/elastic UI） |
|---|---|---|
| `--ease-out` `cubic-bezier(0.16,1,0.3,1)` | 入场减速落位 | `"power3.out"` / `"power4.out"`（接近）或 CustomEase 对齐 |
| `--ease-in` | 离场加速 | `"power2.in"` / `"power3.in"` |
| `--ease-in-out` | 状态切换 | `"power2.inOut"` |
| 禁 `ease` / `linear`(除 loader) / bounce UI | — | 禁 `"bounce"` / `"elastic"` 用于按钮卡片；物理拖拽才谈 spring |

**张力：** Hallmark 的 cubic-bezier 与 GSAP 命名 ease 不完全等价。融合策略二选一（后续 skill 定死其一）：

- **A（简）**：文档映射表 power* ≈ token，允许轻微偏差  
- **B（严）**：`CustomEase.create("--ease-out", "M0,0 C0.16,1 0.3,1 1,1")` 与 CSS token 同曲线  

对本站博客组件，**推荐 A**；营销向 hero 叙事再用 B。

### 2.4 状态机（Hallmark 8 态）× GSAP 职责边界

| 8 态 | 谁负责 | GSAP 是否上场 |
|---|---|---|
| default / hover / focus / active / disabled | **CSS**（`:hover` / `:focus-visible` / `.is-*`） | 一般不上；hover 用 CSS transition 更轻 |
| loading / error / success | CSS 视觉 + 可选短 tween | 仅「图标 scale-in / check 出现」一类短编排 |
| modal / drawer / accordion 开合 | Hallmark 配方 | **timeline**：backdrop fade + content scale；关场更短 |
| 列表 stagger reveal | Hallmark：IO + 一次 | **gsap.from + stagger**，或 ScrollTrigger `once: true` / `batch` |

**关键融合纪律：**  
「常驻微交互 = CSS；多步编排 / 需 pause·reverse·seek = GSAP」。  
Hallmark 禁「每张卡都 lift」→ GSAP 不得给每个 `.card` 挂无限 hover timeline。

### 2.5 编排上限（Hallmark 克制）× Timeline / Stagger（GSAP 能力）

| Hallmark 硬上限 | GSAP 实现时的闸 |
|---|---|
| 每页 ≤ **3** 种动效原语 | timeline 里标签分组；超出则砍 |
| 总 stagger ≤ ~500ms | `stagger: { each: 0.06, amount: 0.5 }` 封顶 |
| 默认-on 原型才主动加动效 | Bento / Stat / Workbench / Marquee / FAQ → 可开 GSAP；Editorial / Quote-Led → 默认静止 |
| 禁「每节 scroll fade」 | ScrollTrigger 默认 `toggleActions: "play none none none"` + `once: true`；**默认不开 scrub** |
| 禁 parallax / 自定义光标 / 无限装饰循环 | 不注册无必要插件；marquee 仅装饰条且可 pause |

Hallmark 对 scroll：**倾向 IntersectionObserver、禁 scrub**，除非有明确叙事理由。  
GSAP ScrollTrigger 的 `scrub` / `pin` 是强力工具，但对本站组件美化场景 → **默认关闭 scrub**；仅「叙事工作流 / 全屏章节」才开。

### 2.6 无障碍（最硬的汇合处）

| Hallmark | GSAP |
|---|---|
| `@media (prefers-reduced-motion: reduce)` 必写 | `gsap.matchMedia()` + `"(prefers-reduced-motion: reduce)"` 分支 |
| 空间运动 → 仅 opacity ≤150ms | reduce 分支：`gsap.set` 终态或极短 `autoAlpha` |
| 功能态（spinner）可保留 | 不 kill 功能性 loader |

**融合必写模板（未来 skill 核心片段）：**

```js
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // 完整 timeline / stagger
  return () => { /* cleanup */ };
});
mm.add("(prefers-reduced-motion: reduce)", () => {
  gsap.set(".reveal", { autoAlpha: 1, y: 0 });
});
```

与 Hallmark 的 CSS `@media` 双轨并存：CSS 管静态态，GSAP 管编排；reduce 时两边都塌缩。

### 2.7 性能交界

两边同词：transform/opacity、少同时 tween、清理泄漏。  
GSAP 补充：`quickTo`（跟随类）、`ScrollTrigger.refresh` 防抖、离屏 kill。  
Hallmark 补充：bundle 决策——单 fade 禁止拉 GSAP。

**融合闸：** skill 入口先问「CSS 能不能？」→ 不能再读 gsap-*。

### 2.8 组件 scope（本站最常用）

Hallmark Component-scope：跳过宏结构，强制 8 态 + preview.html。  
GSAP frameworks：`onMount` + `gsap.context(root)` + `onDestroy → ctx.revert()`。

**汇合交付物（未来）：**

1. 组件文件（Svelte/Astro）— Hallmark token + 8 态 CSS  
2. 可选 `*.motion.ts` — GSAP context（仅当需要编排）  
3. `*.preview.html` — 8 态静态 + 可选「Play motion」按钮跑一次 timeline  

---

## 3. 创意点（各自独特、可互相借力）

| 来源 | 创意点 | 融合用法 |
|---|---|---|
| Hallmark | 结构多样性、genre、主题目录、反 slop 清单 | 决定组件「声音」；动效不得盖过结构 |
| Hallmark | 微交互食谱（button / modal / toast / number tick） | 每条食谱 = 一份 GSAP 或 CSS 实现卡 |
| Hallmark | default-on / default-off 原型 | 控制何时允许引入 GSAP |
| GSAP | position 参数、label、嵌套 timeline | 把「入场三拍」做成可读编舞，而非 delay 堆叠 |
| GSAP | Flip / SplitText / Draggable | **高级样式场景**按需；日常组件美化默认不用 |
| GSAP | `matchMedia` 响应式断点 | 与 Hallmark 320/375/414/768 校验对齐：窄屏减动效 |

---

## 4. 冲突与裁决（写进未来 skill 的「冲突表」）

| 冲突 | Hallmark | GSAP 本能 | 裁决（建议） |
|---|---|---|---|
| Scroll scrub | 默认反对 | ScrollTrigger 主打 | **组件美化默认 off**；用户明确要叙事 scroll 才 on |
| Bounce/elastic | 禁用于 UI | 文档示例常见 | **UI 禁用**；拖拽释放可用受控 spring |
| 每卡 hover lift | 算 slop | 易批量加 | 仅 primary CTA / 定价推荐档 |
| 时长自由 | 三桶 | 任意秒数 | **强制映射时长桶** |
| 图片/装饰动效 | 克制；imagery kit 偏静态层 | 可 tween 一切 | 图是层，动的是层的 opacity/轻微 float，禁乱晃 |

---

## 5. 推荐管线（未来 skill 执行流草案）

```text
0 意图分流
  · 美化静态样式 → Hallmark component-scope（可不动 GSAP）
  · 优化/增加动画 → Hallmark motion 意图 + GSAP 实现
  · 高级组件样式（含氛围图）→ + MiniMax（step-2）

1 Pre-flight（Hallmark）
  · 读站点 token / 色相 290 / 壳层中性灰
  · motion-on?（本仓装 GSAP skill ≠ 已装 gsap 包）

2 设计卡（Hallmark）
  · genre · 8 态 · 动效原语 ≤3 · reduced-motion 文案

3 实现分流
  · 单属性微交互 → CSS transition（token）
  · 多步 / 可控制 → GSAP timeline + context + matchMedia

4 自检
  · Hallmark pre-emit 六轴 + slop gates（动效相关）
  · GSAP：cleanup、无 layout thrash、时长桶合规
```

---

## 6. MiniMax 接入预告（step-2，本稿只钉接口，不展开实现）

本仓已有 `firefly-minimax-media`：额度门禁 → 艺术 prompt → `text_to_image` → `fetch_media`。

与 Hallmark×GSAP 的接缝：

| 层 | 谁定 | MiniMax 角色 |
|---|---|---|
| 组件结构/态 | Hallmark | 不参与 |
| 动效 | GSAP/CSS | 不生成视频当微交互（贵且慢） |
| 氛围/封面/装饰层 | Hallmark imagery 纪律 + MiniMax prompt-craft | 生静态图；GSAP 只做入场 `autoAlpha` / 轻视差（若允许） |
| 概率与门禁 | quota-routing · 用户授权 | skill 必须先 `check_quota`，禁裸调 |

Hallmark `custom-craft` Tier E：生成图必须后处理、忌对称、忌紫蓝廉价渐变——与 MiniMax `prompt-craft` 禁蓝紫渐变 **同向**，可直接并表。

---

## 7. Step-1 结论（给后续 session）

**值得做成独立 skill/MDC 的原因：**  
两边文档都很厚，Agent 容易「只念 Hallmark 用 CSS」或「只拉 GSAP 上全套 scrub」。需要一层 **编排器**：Hallmark 出规格，GSAP 出实现，MiniMax 出可选像素层。

**Skill 核心不该重复粘贴两份原文**，而应：

1. 强制阅读顺序与分流闸  
2. 一张「token → GSAP vars」映射表  
3. 冲突裁决表  
4. 本站约束（Astro/Svelte、hue 290、壳层中性）  
5. MiniMax 可选支路（额度 + prompt）  
6. 交付物模板（组件 + preview + 可选 motion）

**暂不落盘 skill。** 下一步（step-2）：深读 MiniMax `prompt-craft` / `quota-routing`，写成融合规范第三节；再（step-3）用临时 HTML 验证映射表是否「看起来贵、动得克制」。

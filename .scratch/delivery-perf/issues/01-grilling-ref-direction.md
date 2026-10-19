# 参考站方向取舍：跟框架，还是只抄纪律

Type: grilling
Status: resolved（2026-10-19；选 A，依据见下）

## Question

参考站 2x.nz 当前是 **Rolldown + Preact 的 SPA 壳**（每路由预渲染可读回退），而 Firefly 是 Astro SSG 预渲染。实测显示差距的主因是**装饰资产与 CSS/JS 纪律**，不是框架：

- 首页传输 5,137 KB vs 896 KB；解压 10,313 KB vs 3,444 KB
- CSS 解压 ~582 KB vs 84 KB
- 单个宠物 spritesheet 2,538 KB、10 张横幅 ~2,479 KB、11 张氛围图 ~1,602 KB

**要决定的**：本次改造的定位是
(A) 只吸收参考站的「资产纪律 + 内容分仓 + 交付规范」，渲染模式保持 Astro SSG 不动；还是
(B) 真的要把渲染架构往 SPA 壳方向改。

选 (B) 需要说明它如何解决 5.1MB 传输的主因，以及如何补偿被放弃的 island / Swup / 发文流水线。

## Answer

### 决议：选 (A) —— 只抄纪律，渲染模式保持 Astro SSG

这不是新决策，是把本图 `map.md`「Out of scope」段与 2026-10-18 侦察结论正式化。证据链：

1. **参考站作者本人反对为博客换 SPA**：其 B 站投稿标题《博客就得 prerender，整那 CSR 干鸡毛》——2x.nz 的 SPA 壳是「应用平台」（AI 生图 8 入口 / 5 工具 / 3 游戏 / LLM 中转）的产物，博客只是其中一区；它是每路由预渲染 HTML + 可读回退，**输出形态与 Firefly 的 SSG 同类**。向它「靠齐」不等于把 Firefly 改成 CSR 壳。
2. **框架不是差距主因，数据已证实**（02/03 票实测）：
   - CSS：gzip 传输口径 Firefly 102KB vs 参考站 84KB，只差 1.2 倍；解压 585 vs 166 的 3.5 倍里，287KB 是自研样式的功能面积累，与框架无关。
   - JS：首页冷加载静态闭包 39 chunk / 237KB，结构健康（按需分发已成立），不存在「分包策略落后」。
   - 真正的大头是装饰资产：宠物 2.5MB + 横幅 2.5MB + 氛围图 1.6MB + 视频 1.3MB ≈ 8MB，占解压总量 80%。这是资产预算问题（04 票），换任何框架都要面对。
3. **(B) 的代价不可补偿**：换 SPA 壳需放弃 island（按需 hydration 已成立且工作良好）、Swup（页面过渡与发文预览依赖）、以及 `post-publish` 发文流水线的构建期集成（vault → 成帖 → validate → cascade 全链挂在 Astro 内容层上）。参考站自己从 Fuwari/Astro 出走的原因是「island 没用起来」，与 Firefly「island 是主力」的现状相反——它的踩坑史恰恰是警告，不是样板。
4. **Firefly 是纯内容站 + 多 agent 内容生产管线**，渲染层的确定性（构建期产物可审计、`check-delivery-budget` 可门禁）比运行时灵活性重要。

### 从参考站吸收什么（按可移植性排序，侦察结论）

1. 资产纪律：首屏装饰资产预算化、图片构建期转 avif + CDN 格式协商 → 归 04 票。
2. 第三方脚本同意门控（`type="text/plain" data-src` + CSP sha256 白名单）→ Firefly 的 GA/Clarity/Umami/51la 当前全空，等园主给 ID 后作为独立小项。
3. 可读回退 + 看门狗 → 仓内已有 `BootLoader.astro`（未提交的在制品），是否对齐 12s 看门狗归渲染策略细节，不阻塞本图。
4. 内容与代码分仓 → 归 05 票，本票只定方向：**值得评估，不作为渲染改造的前置**。
5. `modulepreload` 关键 chunk（参考站 head 里 15 个，Firefly 0 个）→ 可增量加（宠物/时钟/主题三件），归 03 票已记录。

### 什么情况下重开 (B)

若未来 Firefly 要长「应用平台」能力（在线工具商店、LLM 交互产品化），应作为**新的 effort 重新开图**，不在 delivery-perf 图内续命；届时先回答「新应用形态需要什么渲染特性」再谈框架。

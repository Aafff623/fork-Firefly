# ADR-0005 · Firefly Bot 纯黑圆润视觉重制

- Status: accepted（extends ADR-0004）
- Date: 2026-08-20

## Context

ADR-0004 的自研外壳沿用了 hue 290 紫系（palette.black 实为 #4C3A8C/#C9B8FF，dark 模式呈亮紫团子），形状族含 squircle / gem / shield / leaf 等带尖角或压扁变方的成员。园主对观感不满意，要求向 Grok 官方「纯黑圆润团子 + 白眼」的极简风格靠拢：纯黑、以圆形为主、偶尔变圆润形状（如圆角六边形）。

## Decision

1. **颜色解耦**：`palette.black` 的 `light/dark` 语义改为「前景线条色」（overlay 点线、铅笔、感叹号等，dark 模式需亮色才可见）；新增 `palette.black.body = { light, dark }` 专管身体填充。`character.js` 的 body `fill` 改用 `var(--body, var(--fg, #000))`，`setColor()` 三分支统一派生 `--body`。取值：
   - 身体：light `#141414` / dark `#212121`（近纯黑；dark 留一点亮度防融背景）
   - 线条：light `#141414` / dark `#E6E1D8`（亮暖白）
   - 眼底 `EYE_BG`：`var(--disk, #FAF8F4)` 近白，两模式一致
2. **形状族圆润化**：`geometry-data.js` 的 shapes 由参数化生成器整体重产（生成器留档 `.scratch/gen_ffly_round.py`，gitignore，可重跑调参；断言圆度 CV ≤ 0.09、相邻段转角 ≤ 14°）：
   - `blob` 正圆基线（±1.3% 谐波微扰）；`pebble` 圆润横鹅卵石；`egg` 卵形；`hex` 圆角六边形（多边形-圆逐角度插值，顶点圆弧化、边中平直）；`teardrop` 圆润水滴（哭特技）。
   - 移除 `squircle`（tiltScale 0.55 压扁变方）、`gem` / `shield` / `leaf`（尖角）；`SHAPE_ZOOM` 同步清理死键（tablet/wedge/cloud）。
3. **巡演权重**：carousel `SHAPES = [blob, blob, pebble, egg, hex]`——正圆双权重占主导，偶尔切鹅卵石/卵形/圆角六边形。
4. **彩带中性化**：`fx.js` 粒子色改黑白灰四档 + 一份站点紫 `#8B5CF6` 点缀；星星 `light-dark(#2E2E2E, #F2EFE9)`。粒子 fill 改走 `style.fill`（`light-dark()` 需 CSS 解析）。
5. **死数据同步**：`INK.black` 渐变、`starColor` 同步黑系（当前无消费者，防未来接线误用紫色）。
6. **眼型实心重产（v2.1，2026-08-20 晚）**：初版参数化超椭圆眼型呈空心月牙（实心度 0.38–0.62），观感与 Grok 相差大。重产流程：本机对照 replica（gitignore）仅提取**宏观形态参数**（每眼宽/高/中心，`.scratch/grok_eye_specs.json`），由超椭圆图元按参数重算 48 点实心眼型（实心度 ≥0.78）——原版标志性的大号白竖椭圆、横胶囊眯眼、圆睁变体与左右眼姿态差全部保留，坐标不逐点拷贝。眼型语义仍按既有 25 索引 playlist 对齐情绪。
7. **交互人性化（v2.2，2026-08-20 晚）**：① 眼神跟随鼠标——开启引擎既有 pointer→gaze 通道（carousel `followPointer: true`，Bot 面激活时补 `setFollowPointer(true)`，渲染时 pointer 优先于随机注视，远近按椭圆轨迹映射）；② 变身提速——`SPRINGS.shape` 10→16、`overlay` 14→18、`overlayMix` 11→15、眼型 morph 刚度 7/8/10→11/12/14；③ 彩带常态化——桶切换时 25% 概率自发 `burstOnce()`（黑白灰 + 站点紫粒子），不再只依赖点击。
8. **首屏头像与眼神持续跟随（v2.3，2026-08-20）**：引擎预热后**不立刻切 Bot**，首屏停在站点头像 6–8s（既有 `FACE_MS.avatar`），并播一次轻晃 + 👋 招手（`is-hello`，`prefers-reduced-motion` 跳过；硬刷新重来，Swup 不重播）。宏切隐藏与 pointerleave **不再** `setFollowPointer(false)`——该调用会清空 `pointerRaw`，Bot 面回来且鼠标静止时眼神必失跟；`paused` 已停渲染，跟随保持开着继续采全局鼠标。

## License 立场（对「1:1 复刻观感」的合规边界）

- **idea 不受版权保护**：黑白配色、圆润形状语言、吉祥物白眼属于风格概念；受保护的是具体表达（xAI 的精确多边形数据、帧曲线、代码）。本仓延续 ADR-0003/0004 红线：xAI replica 仅本机 gitignore 对照，不入库不分发。
- **表达独立**：全部形状路径由本仓参数化生成器产出（顶点数 132、采样密度、谐波参数均自定，与 xAI 抽出数据无逐点对应）；眼型为超椭圆图元按**宏观参数**（宽高/位置/类别）重算的实心多边形——参数级参考、坐标级独立，属「规格对齐」而非「数据拷贝」；动画算法为通用弹簧/关键帧。本站为个人非商用博客（记录文章、对外展示），无商业利用事实，进一步压低权利主张的现实动因。
- **可区分识别点（内部创新）**：①基线是正圆而非 squircle 团子；②圆角六边形等「类圆多边形」巡演形状族为自有形状语言；③庆祝彩带带一份站点紫；④编舞（1:4 宏切、六桶情绪表）为站点原创。若权利方主张 trade dress，以上差异点 + 参数化生成过程可作独立创作证据。
- **残留风险**：整体观感「神似」极简黑白团子。观感相似本身不构成侵权，但若收到权利方异议，按 ADR-0004 风险预案整体下线替换。

## Consequences

### 正面

- 观感对齐园主要求：黑团白眼、圆润为主、偶尔圆角六边形。
- 身体与线条颜色解耦后，dark 模式不再「亮紫团子」。
- 形状族更小（9 → 5），巡演池语义清晰。

### 负面 / 风险

- `palette.black` 语义变化（线条色）；若未来新增色 id 需同时给 `body` 字段，缺省回落 `light/dark`。
- `squircle` 等形状名从数据中消失；外部若有按名引用（当前无）会静默回落 blob。
- dark 模式身体 #212121 与槽底对比度低，靠白眼与亮线条勾形；如需增强可后续加 1px 亮描边（本次不做）。

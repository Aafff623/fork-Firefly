# ADR-0004 · Firefly Bot 自研外壳入库，取代 grok replica

- Status: accepted（supersedes ADR-0003）
- Date: 2026-08-20

## Context

ADR-0003 把 grok replica 的 `geometry-data.js` 与 `src/*.js` 判为 xAI 资产、gitignore 本机拷贝，导致生产（Vercel / EdgeOne / Cloudflare / GitHub Pages 全走 git CI）永远没有引擎文件，`vendorPresent()` 探测失败，侧栏锁死静态头像——线上「头像 ↔ Bot 1:4 轮播」实际从未生效。园主要求线上效果与本地一致，且不入库 xAI 文件。

## Decision

1. **自研外壳入库**：新增 `public/vendor/firefly-bot/`，全局命名空间 `FFLY_*` / `FireflyCharacter`。
   - `geometry-data.js` 全原创：形状路径为参数化极坐标扰动生成（非 xAI 多边形拷贝）；25 组眼型由参数化超椭圆生成器产出，锚点对称重排；palette 改用站点 hue 290 紫系；star/彩带配色同步换。
   - `src/{math,tables,pose,tricks,fx,eyes,character}.js` 为通用动画算法（弹簧、姿态机、关键帧、overlay 程序化绘制，零品牌几何），机械重命名全局符号后保留；`tables.js` 的 INK 墨色表重建为紫系渐变，`POSE_HOME.turn` 22 修正 3D 投影眼位对称。
2. **编舞切换**：`profile-grok-carousel.ts` / `profile-grok-timing.ts` 更名为 `profile-firefly-carousel.ts` / `profile-firefly-timing.ts`，`Profile.astro` 的 data 属性与类名同步（`data-profile-ffly*` / `profile-ffly-bot`）。
3. **原 replica 保留本机**：`public/vendor/grok-bot/` 仍 gitignore，仅作对照参考，不参与构建与分发。
4. 时序表不变（宏面 1:4：头像 6–8s / Bot 24–32s），行为规格与原编舞一致。

## Consequences

### 正面

- 引擎随 git 入库，所有 CI 平台构建后线上即跑 Bot 轮播，与本地一致。
- 不再夹带 xAI 抽出几何；外观（紫色团子 + 参数化眼型）与原 Grok 视觉可区分。

### 负面 / 风险

- 算法文件仍属「照抄行为规格」的衍生代码；若权利方对代码本身（而非几何）主张权利，需整体下线替换为完全重写实现。
- 眼型为参数化生成，表情语义靠索引对齐原 playlist；个别眼型的「神态」与原 replica 有差异属预期。
- 无 solids 旋转体数据，整圈旋转的 3D 轮廓降级为 2D 圆柱投影（代码自动降级，可接受）。

# Firefly Bot 引擎（自研外壳，已入库）

侧栏头像 ↔ Bot 轮播的运行时引擎。**本目录全部入库**，随 CI 分发到各部署平台。

## 构成

- `geometry-data.js` — 自研几何 v2（ADR-0005 纯黑圆润）：形状族 5 个（正圆 blob / 鹅卵石 pebble / 卵形 egg / 圆角六边形 hex / 水滴 teardrop），25 组眼型（参数化超椭圆生成器），纯黑 palette（`black.light/dark` 为线条色，`black.body` 为身体填充）。非 xAI 资产。
- `src/*.js` — 通用动画算法（弹簧 / 姿态机 / 特技关键帧 / overlay 程序化绘制 / 眼睛渲染管线），行为规格复刻原 grok replica，全局符号已改为 `FFLY_*` / `FireflyCharacter`。

## 加载顺序（消费方 `src/scripts/profile-firefly-carousel.ts` 按此注入）

```text
geometry-data.js → src/math.js → src/tables.js → src/pose.js → src/tricks.js → src/fx.js → src/eyes.js → src/character.js
```

## 对照与回归

- 本机仍保留 gitignore 的原 replica：`public/vendor/grok-bot/`（仅供对照，禁止入库分发，见 ADR-0003/0004）。
- 编舞预览：`.scratch/preview-grok-avatar/`（原 replica 版）；新引擎回归可直接跑站点 dev server 看侧栏。
- 决策记录：`docs/adr/0004-firefly-bot-self-geometry.md`。

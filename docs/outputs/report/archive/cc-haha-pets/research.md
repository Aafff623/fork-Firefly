# 调研报告：cc-haha 桌宠 → Firefly 博客适配

> 状态：research complete（2026-08-01）  
> 源仓：https://github.com/NanmiCoder/cc-haha（本地浅克隆：`blog/__tmp__/cc-haha`）  
> 目标仓：本仓 Firefly（Astro 7 静态博客）

## 1. 目标仓现状（Firefly）

| 项 | 事实 |
|---|---|
| 栈 | Astro 7 + Svelte 5 岛屿 + Tailwind 4 + Swup + pnpm |
| 已有看板娘 | Spine（`SpineModel.astro`）+ Live2D（`l2d-widget` / `Live2DWidget.astro`） |
| 配置入口 | `src/config/pioConfig.ts` · 类型 `src/types/pioConfig.ts` |
| 挂载点 | `MainGridLayout.astro` 底部 fixed 区（与 Spine/Live2D 同层） |
| 默认状态 | Spine / Live2D **均 `enable: false`** |
| 静态资源 | `public/pio/`（模型 + spine-player） |
| 治理门禁 | PRD 未批准不写大规模功能代码（`AGENTS.md`） |

结论：博客侧已有「角标看板娘」管线；缺口是 **spritesheet 风格、状态驱动的桌宠层**，与 Live2D/Spine 是不同技术族。

## 2. 源项目桌宠架构（cc-haha）

### 2.1 分层

```text
Electron 透明置顶窗 (petWindow.ts + pet-preload)
        ↓
PetApp.tsx（偏好 / 拖拽 / 任务面板 / 点击唤起主窗）
        ↓
PetRenderer.tsx（CSS background-position 播 spritesheet）
        ↓
petAnimation.ts（8×11 atlas 网格 + 状态→帧序列）
        ↓
petSessionModel.ts（Agent 会话状态 → idle/waiting/running/failed…）
```

### 2.2 可移植核心 vs 桌面专用

| 模块 | 路径 | 博客可复用？ |
|---|---|---|
| 动画状态机 / atlas 几何 | `desktop/src/features/pets/petAnimation.ts` | **是**（纯 TS） |
| CSS spritesheet 渲染 | `PetRenderer.tsx` | **是**（需改写为 Svelte/原生） |
| 内置四宠资源 | `desktop/src/assets/pets/*/spritesheet.webp` | **是**（约 6.1 MB 合计） |
| 静图预览 / 引导图 | `agent-mascots/*` · `action-sheet-guide.*.png` | 可选（文档/设置用） |
| 会话→状态映射 | `petSessionModel.ts` | 需 **语义重映射**（博客无 Agent） |
| 自定义宠物导入 | `petSheetImport` / `petAtlasNormalize` / Electron `pets.ts` | **暂缓**（依赖本机 FS + IPC） |
| 透明置顶窗 / 多显示器 | `petWindow.ts` | **否**（Electron 专有） |
| 文档 | `docs/desktop/pets.md` (+ en) | **是**（需改写为博客语境） |

### 2.3 动画规格（运行时事实）

- Atlas v2：`columns=8, rows=11, cell=192×208, sheet=1536×2288`
- 状态：`idle | running-right | running-left | waving | jumping | failed | waiting | running | review`
- 视线：16 方位量化（hover 跟指针）
- 已支持 `prefers-reduced-motion`
- 自定义导入文档写「8×9」动作表；运行时 atlas 为 **11 行**（含镜像跑与视线行）——移植时以代码常量 `PET_ATLAS_V2` 为准

### 2.4 许可证

MIT（Copyright 2026 cc-haha）。移植代码与资源需保留版权声明（建议落 `THIRD_PARTY` 或组件头注释 + `docs` 致谢）。

## 3. 取证：克隆 / 安装 / 测试

| 步骤 | 结果 |
|---|---|
| `git clone --depth 1` → `__tmp__/cc-haha` | 成功 |
| `desktop`：`bun install --frozen-lockfile` | 成功（718 packages） |
| `vitest --run src/features/pets` | **99/99 pass** |
| `bun test electron/services/pets*.ts` | 100 pass / **7 fail**（symlink 拒绝用例，Windows 环境差异；与渲染核心无关） |
| 完整 Electron 打包运行 | **未做**（体积大、需 sidecar；桌宠核心已由单元测试覆盖） |

本地临时仓路径：`d:\OneDrive\Desktop\blog\__tmp__\cc-haha`（可在功能合入后删除）。

## 4. 与博客适配的关键冲突面

| 冲突 | 影响 | 应对方向 |
|---|---|---|
| Electron 置顶窗 vs 页面 fixed 组件 | 不能「飘在系统桌面」 | 改为站内 fixed 悬浮宠 |
| Agent 会话状态 vs 静态站 | 无 running/waiting 真源 | 博客语义：idle 氛围 + 点击/路由弱状态 |
| React 18 vs Svelte 5 | 不宜引入 React 运行时 | 移植为 Svelte island 或轻量 vanilla |
| 与 Live2D/Spine 并存 | 角标抢位、性能、z-index | 配置互斥或分层开关 |
| Swup 页面过渡 | 脚本重复挂载 / 丢失 | `data-swup-ignore` 或挂 Layout 持久层 |
| 资源体积 ~6 MB | 首屏与移动端 | 默认单宠 + lazy；移动端可关 |
| 紫系主题 vs 宠角色 accent | 视觉冲突 | accent 仅点缀；壳层保持中性灰 |

## 5. 推荐产品形态（博客）

**「站内桌宠」**：固定角悬浮 spritesheet 角色，默认关闭；可切换四只内置宠；交互含 hover 转头、点击挥手/跳转、拖拽记位（`localStorage`）；**不做** Electron 置顶、**不做** Agent 任务面板、**首期不做**自定义动作表导入。

与现有 Pio 的关系：新增第三条渲染管线（Sprite Pet），配置并列于 `pioConfig` 或独立 `petConfig`，三者默认互斥只开其一。

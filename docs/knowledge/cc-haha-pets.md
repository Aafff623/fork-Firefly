# 站内桌宠（cc-haha spritesheet）

> 来源：[NanmiCoder/cc-haha](https://github.com/NanmiCoder/cc-haha) · MIT  
> 配置：`src/config/petConfig.ts` · 组件：`src/components/features/SpritePet.svelte`

## 和原版差在哪

| cc-haha 桌面端 | 本博客适配 |
|---|---|
| Electron 透明置顶窗 | 页面 `position: fixed` 悬浮 |
| Agent 任务状态驱动动画 | 默认 idle；点击挥手；拖拽跑步 |
| 设置页开关 / 自定义导入 | 作者改 `petConfig`；自定义导入 backlog |
| React + IPC | Svelte 5 island |

## 内置角色

| ID | 名称 |
|---|---|
| `dada-code` | 搭搭 Dada |
| `huhu-plan` | 弧弧 Huhu |
| `bubu-fix` | 补补 Bubu |
| `huihui-build` | 回回 Huihui |

## 怎么开

1. `src/config/petConfig.ts` → `enable: true`
2. 确认 `spineModelConfig.enable` 与 `live2dWidgetConfig.enable` 为 `false`
3. `pnpm dev` 查看左下角（默认）

可调：`petId` · `position` · `size` · `motionEnabled` · `draggable` · `hideOnMobile`

## 交互

- 悬停：视线跟随指针（`lookFollow`）
- 单击：挥手（`clickWave`）
- 拖拽：改位置，写入 `localStorage`（`firefly-sprite-pet-pos`）
- `prefers-reduced-motion`：停动画，保留静帧
- 移动端：默认隐藏

## 技术要点

- Atlas v2：`8 × 11`，格 `192×208`，整图 `1536×2288`
- 动画核：`src/lib/pets/petAnimation.ts`
- 挂载：`MainGridLayout.astro`（与 Swup 共存；根节点带 `data-swup-permanent`）
- 互斥优先级：桌宠 → Spine → Live2D

## 致谢

Copyright (c) 2026 cc-haha · MIT。完整许可见上游仓库 `LICENSE`。

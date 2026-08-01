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
- 点头部：打招呼（`waving` / `review`）
- 点身体：思考/等待（`review` / `waiting`）
- 点脚部：跳跃/小跑（`jumping` / `running`）
- 双击：开心跳（`jumping`）
- 拖拽：按瞬时方向跑步，松手小跳；位置写入 `localStorage`（`firefly-sprite-pet-pos`）
- 入场：自动挥手一次
- 场景联动（`reactToSiteUi`）：
  - 打开文章 → `review`；404 / 搜索无结果 / 表单校验失败 → `failed`
  - 读文持续滚动 → `waiting`；空闲约 45s → `waiting`
  - 主题切换 → `review` → `waving`；Swup 切页离开 → `running`
  - 抵达页脚 → `waving`；背景播放开始 → `jumping`
  - 搜索/设置/回顶/导航/复制/GitHub/点赞类按钮见 `SpritePet.svelte`
- 自定义场景可派发：`window.dispatchEvent(new CustomEvent('firefly:pet-scenario', { detail: { scenario: 'search-empty' } }))`
- `prefers-reduced-motion`：停动画，保留静帧
- 移动端：默认隐藏

## 技术要点

- Atlas v2：`8 × 11`，格 `192×208`，整图 `1536×2288`
- 动画核：`src/lib/pets/petAnimation.ts`
- 挂载：`MainGridLayout.astro`（与 Swup 共存；根节点带 `data-swup-permanent`）
- 互斥优先级：桌宠 → Spine → Live2D

## 致谢

Copyright (c) 2026 cc-haha · MIT。完整许可见上游仓库 `LICENSE`。

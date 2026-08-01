# PRD：cc-haha 桌宠适配 Firefly（approved）

> 状态：**approved**（2026-08-01）  
> 主题：`cc-haha-pets`  
> 依据：`docs/outputs/report/cc-haha-pets/research.md`

## 已拍板

| # | 决策 |
|---|---|
| 1 | 与 Spine/Live2D **互斥**（运行时优先桌宠） |
| 2 | 默认角色暂定 **`dada-code`（搭搭）**，可换 |
| 3 | 独立配置 **`petConfig.ts` / `spritePetConfig`** |
| 4 | 访客设置面板：**首期不做** |
| 5 | 自定义动作导入：**首期不做**，进 backlog |

## 范围（首期）

- Phase 0：资产 + 文档 + MIT 致谢
- Phase 1：动画核 + 配置 + 挂载 + 互斥
- Phase 2：视线 / 点击挥手 / 拖拽记忆 / 移动端 / reduced-motion / Swup

## 非目标（backlog）

- Electron 置顶窗
- Agent 任务面板
- 自定义动作表导入
- 访客设置面板开关

## 成功标准

`spritePetConfig.enable = true` 时桌面端可见搭搭；文档齐全；不破坏 Pio；`pnpm check` / `type-check` 通过。

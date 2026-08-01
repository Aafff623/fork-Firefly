# 会话纪要：cc-haha 桌宠接入与打磨（2026-08-01）

> 范围：本对话内完成事项。不含同工作区其它未提交改动（阅读 UI / TOC / about 等）。

## 1. 目标与决策

| 项 | 结论 |
|---|---|
| 形态 | 站内 fixed 悬浮宠（非 Electron 置顶窗） |
| 与 Pio | 互斥：桌宠 → Spine → Live2D |
| 配置 | 独立 `petConfig.ts` / `spritePetConfig` |
| 默认角色 | `dada-code`（搭搭） |
| 设置面板 / 自定义导入 | 首期不做 |

## 2. 时间线（做了什么）

1. **调研**：分析 Firefly；浅克隆 `NanmiCoder/cc-haha`；跑通 desktop pets 单元测试（99/99）；拆解 spritesheet 动画核。
2. **Phase 0–1（已入库 `0444b972`）**：复制四宠 spritesheet；移植 `petAnimation`；新增 `SpritePet`；挂载互斥；文档/PRD/report。
3. **启用与预览页**：`enable: true`；`__tmp__/pet-preview` 临时 HTML 调参/台账服务（8765）。
4. **交互丰富**：分部位点击、双击、拖拽、站点控件联动。
5. **悬停丝滑尝试 → 回滚有害部分**：去掉 `background-position` 过渡（残影元凶）；保留粘滞/rAF；修指针捕获导致拖拽卡死。
6. **SSR 修复**：`window` 守卫 + `client:only="svelte"`。
7. **拖拽朝向**：瞬时方向转向；图集朝向与屏幕方向映射校正。
8. **场景台账接线**：文章/404/滚动/空闲/主题序列/Swup/页脚/背景播放/搜索无结果/表单 invalid/点赞选择器；`firefly:pet-scenario` 事件。

## 3. 关键文件（本轮未提交部分）

| 文件 | 性质 |
|---|---|
| `src/components/features/SpritePet.svelte` | 交互、拖拽、场景、SSR 安全 |
| `src/config/petConfig.ts` / `src/types/petConfig.ts` | 开关与新配置项 |
| `src/layouts/MainGridLayout.astro` | `client:only` |
| `src/pages/404.astro` | `data-page="404"` |
| `src/components/controls/Search.svelte` | 无结果派发 pet 事件 |
| `docs/knowledge/cc-haha-pets.md` | 交互说明更新 |

## 4. 明确非本对话产物（勿混进 pets commit）

工作区另有未提交改动：`PostCard` / TOC / `about` / `reading-ui-polish` PRD 等——与桌宠无关，应另开提交或暂存。

## 5. 验证

- `pnpm type-check` 通过（实施过程中多次）
- 本地拖拽/朝向/场景：对话中目视验收通过（用户确认 OK）

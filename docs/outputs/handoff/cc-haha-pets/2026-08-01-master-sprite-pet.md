# Handoff：cc-haha 站内桌宠（终态）

## Status

done（交互打磨 + 场景联动已提交；未 push）

## Decisions（已定）

互斥 · `petConfig.ts` · 默认 `dada-code` · 无访客设置面板 · 无自定义导入

## 已交付

- 资产：`public/pets/**`（`0444b972`）
- 核：`src/lib/pets/*`（`0444b972`）
- 组件：`SpritePet.svelte`（`23a6f45b` 交互增强）
- 场景：文章/404/滚动/空闲/主题/Swup/页脚/背景播放/搜索空/表单失败（第二提交）
- 文档：`docs/knowledge/cc-haha-pets.md` · report/prd/session-changelog

## 使用

`src/config/petConfig.ts` → `enable: true`  
换角色改 `petId`。  
扩展场景：`firefly:pet-scenario` CustomEvent。

## 回测清单

- [ ] 桌面端可见搭搭；移动端隐藏
- [ ] 拖拽瞬时转向；松手落地记位
- [ ] 悬停无残影；无拖拽卡死
- [ ] 打开文章 → review；404 → failed
- [ ] `pnpm type-check` / 关键页目视

## Backlog

- 访客设置面板开关
- 自定义动作表导入
- 其余 8 张 Agent 静图做成完整桌宠（需新 atlas）

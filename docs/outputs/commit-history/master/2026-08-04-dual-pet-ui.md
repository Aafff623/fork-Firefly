# master · 2026-08-04

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-04 | master | 6fb0b158 | feat | 双 DeepSeek 桌宠 | 资产替换旧四宠；Maid/OpenPet 双实例；外侧留白游走与拖拽计时 |
| 2026-08-04 | master | a715450c | feat | sticky 顶栏显隐 | 下滑收起、上滑滑出 |
| 2026-08-04 | master | accfa9e9 | feat | 标签墙 /tags | 侧栏折叠 + 全页砖墙 |
| 2026-08-04 | master | c5620ca0 | refactor | 关于页扁平化 | 去嵌套卡片，bio 网格 |
| 2026-08-04 | master | 70cf5e7f | feat | 双宠迁移文 | 成帖 + 动态；恢复首页自动置顶 |
| 2026-08-04 | master | 160d4843 | docs | 双宠知识库 | idea/PRD/handoff + CONTEXT |
| 2026-08-04 | master | 18ebc04c | docs | README showcase | 截图与 capture 脚本 |
| 2026-08-04 | master | fb9d3aa6 | chore | knowledge skills | extract/output 对齐 |
| 2026-08-04 | master | 95dfa991 | docs | idea 灵感 | interface-lab / zhuzhiliao |

## 做了什么
站内桌宠换成双 DeepSeek（浏览 Maid、文章 OpenPet），游走改到卡片外侧留白并朝向内容。顺手做了 sticky 顶栏随滚显隐、标签砖墙、关于页扁平化，并补齐双宠成帖与文档资产。

## 关联
- `docs/outputs/prd/dual-pet-deepseek/prd.md`
- `docs/outputs/handoff/dual-pet-deepseek/2026-08-04-master-dual-pet.md`
- `docs/knowledge/dual-pet-deepseek.md`

## 回滚
- 桌宠：`git revert 6fb0b158`；或 `spritePetConfig.enable = false`
- 顶栏显隐：`git revert a715450c`
- 标签墙：`git revert accfa9e9`

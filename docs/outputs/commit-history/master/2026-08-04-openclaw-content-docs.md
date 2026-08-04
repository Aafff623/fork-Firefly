# master · 2026-08-04 · OpenClaw 索引与发文路径

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-04 | master | d9835072 | docs | 厘清甲乙发文路径与级联上游 | vault / Knowledge 双路径、site-cascade 上游；归档 cc-haha 过时产出 |
| 2026-08-04 | master | efc1aa1e | docs | 索引帖信息图 checklist 与已知坑 | MiniMax / knowledge-output 配图规范：尺度、参照物、禁复读章节名 |
| 2026-08-04 | master | 65648d09 | feat | OpenClaw 教程索引帖与章节配图 | 鱼皮目录索引摘要 + 章节小长条信息图挂原文 |

## 做了什么
把发文从「仅 ob2blog」改成甲（vault）/ 乙（Knowledge）双路径写进 workflow 与 skills。试水 OpenClaw 保姆级教程索引帖：精炼摘要 + cite 信息图（先不整组返工）。把本轮生图踩坑收成 checklist，供后续索引帖复用。

## 关联
- `docs/agents/workflow.md`
- `.cursor/skills/{knowledge-extract,knowledge-output,site-cascade,firefly-minimax-media}/`
- `src/content/posts/openclaw-tutorial-index/`
- Knowledge：`D:\OneDrive\Desktop\Knowledge\2026-08-04_OpenClaw保姆级教程索引摘要\`（仓外）

## 回滚
- 文档：`git revert efc1aa1e d9835072`
- 成帖：`git revert 65648d09`
- 配图继续迭代时覆盖 `images/cite-*.jpg` 即可，不必整帖回滚

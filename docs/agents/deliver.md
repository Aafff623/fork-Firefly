# 交付（deliver）

## 交付前清单

- [ ] **本地** `pnpm dev`（或 `preview`）目视关键改动
- [ ] `pnpm check`（涉及 TS/Astro）
- [ ] 你确认后才 `git push`
- [ ] **线上** https://fork-firefly.vercel.app 再核一遍
- [ ] 无密钥入库；diff 无无关格式化

## 交付物位置

| 类型 | 路径 |
|---|---|
| 代码 | `src/` 等产品目录 |
| handoff | `docs/outputs/handoff/{theme}/` |
| 说明 | PR / 对话摘要（中文，短） |

闭环细则见 `workflow.md`「Phase / 交付闭环」。

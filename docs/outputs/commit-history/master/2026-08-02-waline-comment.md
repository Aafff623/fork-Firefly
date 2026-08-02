# master · 2026-08-02 · Waline / COS

## Status
partial（代码已合入；COS PutObject 仍待确认 CAM 写权限后验收）

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-02 | master | c4a2c641 | feat | Waline 切换 | 评论改 Waline，清理 Giscus 主题/鉴权与导航入口 |
| 2026-08-02 | master | 2315d08f | feat | COS 附图 | `/api/comment-image` 服务端代理腾讯云 COS |
| 2026-08-02 | master | 7b602d8e | docs | ADR-0001 | 记录 Waline 替代 Giscus 与附图约束 |

## 做了什么
个人站评论从 Giscus 迁到 Waline，保留表情选项卡与 Giphy 搜索。大图上传改为腾讯云 COS 服务端代理，弃用 ImgBB。架构决策写入 ADR-0001；旧 Giscus UI 合入摘要仅作历史参考。

## 关联
- ADR：`docs/adr/0001-waline-over-giscus.md`
- 配置：`src/config/commentConfig.ts`、`.env.example`（`COS_*`）
- 代理：`src/pages/api/comment-image.ts`、`src/components/comment/Waline.astro`

## 回滚
- `git revert 7b602d8e 2315d08f c4a2c641`（自新到旧）
- 或关闭附图：不配 `COS_*`；评论改回需重配 `giscus` 并恢复组件

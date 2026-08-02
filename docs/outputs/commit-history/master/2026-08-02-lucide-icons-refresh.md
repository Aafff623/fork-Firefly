# master · 2026-08-02

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-02 | feat/lucide-icons-refresh | 57de650e | chore | Lucide 依赖 | 接入 `@iconify-json/lucide`、配置与离线子集 |
| 2026-08-02 | feat/lucide-icons-refresh | ace58ee2 | feat | 顶栏导航图标 | 导航配置与 Navbar chrome 统一 Lucide outline |
| 2026-08-02 | feat/lucide-icons-refresh | 412c53bc | feat | 搜索/徽章/动态关闭 | 搜索、置顶徽章、Dynamic 关闭钮跟进 Lucide |
| 2026-08-02 | feat/lucide-icons-refresh | a6a08a90 | fix | Navbar 编码 | 修复 PowerShell 写入导致的 UTF-8 损坏 |
| 2026-08-02 | feat/lucide-icons-refresh | 5033cb1b | feat | 音乐与悬浮钮 | MusicPlayer 与浮动按钮图标统一 |
| 2026-08-02 | feat/lucide-icons-refresh | 0f0c07a7 | feat | 侧栏控件 | 侧栏控件与公告图标统一 |
| 2026-08-02 | feat/lucide-icons-refresh | 2ad621b3 | feat | 硬页面 | Gallery、归档、显示设置图标统一 |
| 2026-08-02 | feat/lucide-icons-refresh | b7d9ed94 | feat | Footer/置顶芯片 | Footer 与 PostPinAdmin 收尾 |
| 2026-08-02 | feat/lucide-icons-refresh | 8a6aa452 | feat | 全站收尾 | Anime/评论/站点页图标收尾 |
| 2026-08-02 | feat/lucide-icons-refresh | d2c462a0 | fix | gallery/friends 编码 | 恢复乱码并保留 Lucide 图标名 |
| 2026-08-02 | feat/lucide-icons-refresh | 4bd1b85f | fix | 壁纸淡入 TDZ | 提前定义 `isCurrentPagePost`，避免脚本中断 |
| 2026-08-02 | master | d70399e0 | merge | 合入 master | `feat/lucide-icons-refresh` 整支合并 |

## 做了什么
全站 UI chrome 图标迁到 Lucide（`astro-icon` + `@iconify-json/lucide`），品牌图标仍用 fa7/simple-icons。侧栏 SiteStats/Recommend/Tags 保持纯文字不动。收尾修了 PowerShell 编码损坏导致的编译失败，以及 Layout 脚本 TDZ 导致壁纸永久透明。

## 关联
- 分支：`feat/lucide-icons-refresh` → `master`（`d70399e0`）
- 依赖：`@iconify-json/lucide`、`src/constants/icons-data.json`
- 关键：Navbar / MusicPlayer / 侧栏 / Gallery / Footer / Anime / 评论空态等

## 回滚
- 整批：`git revert -m 1 d70399e0`
- 仅热修：`git revert 4bd1b85f d2c462a0`（逆序）

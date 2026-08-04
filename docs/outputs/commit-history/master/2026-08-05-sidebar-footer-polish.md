# master · 2026-08-05 · 侧栏页脚与内容 UI 抛光

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-05 | master | dfbe765e | feat | Profile | 招呼气泡、社交品牌色、顶缘壁纸渐隐/轻玻璃 |
| 2026-08-05 | master | 1e68c435 | feat | Footer | 少网名数字花园文案 + 专业四栏底栏收束 |
| 2026-08-05 | master | 63978969 | feat | Sidebar | 礼盒开后淡出、园记便签、时钟斥力移除、侧栏编排 |
| 2026-08-05 | master | 1228056f | feat | Content UI | 列表卡/标签墙/动态闪烁/导航强调/设置收束 |
| 2026-08-05 | master | TBD | docs | commit-history | 本批次摘要 |

## 做了什么
侧栏头像卡对壁纸做顶缘柔和过渡；页脚改为数字花园话语并扩成品牌/漫步/园径/连结四栏，树木与法律行降权。惊喜礼盒开启后定时淡出并记 localStorage；新增左栏园记便签。内容区补列表卡留白与荧光笔、标签墙强调、动态首条闪烁，以及导航/显示设置的小幅收束。

## 关联
- `src/components/widget/Profile.astro` · `GardenNote.astro` · `Announcement.astro`
- `src/components/layout/Footer.astro` · `src/styles/site-footer.css`
- `src/styles/announcement-press.css` · `post-card.css` · `dynamic.css`
- `src/config/sidebarConfig.ts` · `src/data/avatar-greetings.ts` · `src/utils/accent-from-label.ts`

## 回滚
- 配置：侧栏去掉 `gardenNote`；礼盒相关 localStorage key 可清
- 或按上表 hash 依次 `git revert`

# master · 2026-08-04（标签墙 / Footer / 分页）

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-04 | master | 881984fd | feat | 立体标签球与 themeTags | TagCloud 球；一级/二级标签；分类软木便利贴 |
| 2026-08-04 | master | 1f1b4f4b | feat | Footer 混搭 | V1 三栏 + 浇水胶囊 + 邮戳；透明全宽 |
| 2026-08-04 | master | 652c5b70 | feat | 分页 Lucide | 双箭头导航；去粉紫外壳 |

## 做了什么
标签墙从砖墙演进为白卡片立体球，并引入不计全站统计的二级 `themeTags`。Footer 按选型画廊混搭落地（产品三栏 + 花园浇水文案 + 印刷邮戳）。分页补齐 Lucide 首末页图标，并去掉主色混边带来的淡紫 AI 壳。

## 关联
- frontmatter：`tags` / `themeTags`（`content.config.ts`）
- 组件：`TagChalkSphere.astro`、`Footer.astro`、`Pagination.astro`

## 回滚
- 标签：`git revert 881984fd`
- Footer：`git revert 1f1b4f4b`
- 分页：`git revert 652c5b70`

# master · 2026-08-06

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | 36fb7735 | style | 关于页去 LinkedIn 腔 | 拉句/bio/description/公告/友链本站 desc 人味化；subtitle 品牌键保留 |
| 2026-08-06 | master | 8e0480f3 | style | 动态作者批注去 AI 味 | 15 条 `>` 批注按 humanizer-tta 改第一人称口语 |
| 2026-08-06 | master | c7d36277 | fix | 幕布残影 | curtain-focus 解开 onload forwards 锁住的 opacity/transform |
| 2026-08-06 | master | 07392d6e | style | 亮暗开关液态玻璃 | LightDarkSwitch 外壳对齐 navbar-liquid-glass，场景降噪后再回补色度 |
| 2026-08-06 | master | 2a5129a2 | fix | 动态侧栏闪烁 | 仅 `index === 1` 软闪，最新一条静止 |

## 做了什么
本会话：关于页与站点表面去产品白皮书腔；动态笔记旁白说人话；修动态/相册侧栏「只剩模糊」的幕布 bug；亮暗开关去塑料贴片感；动态侧栏闪烁减噪。暗色 Waline 正文可读见同日 `71e14ecb`（他批已记）。Footer 深色树木提亮已随 `bcf7c8df` 一带入库。工作树里其它 Agent 的 README/帖文/桌宠等改动未并入。

## 关联
- Plan：关于页去 AI 味 · 亮暗开关材质对齐 · 深色 Footer 树木提亮
- Skill：humanizer-tta
- 关键文件：`about.astro`、`about.md`、`curtain-focus.css`、`LightDarkSwitch.svelte`、`DynamicSidebar.svelte`、`src/content/dynamic/*`

## 回滚
- `git revert` 本批 hash（或按主题分别 revert）；勿误 revert 他 Agent 的 README/帖文

---
title: 前端别再 AI 紫：设计向 Skill 怎么叠
published: 2026-08-11
description: Taste 反模板、四技网页线、ui-styles 风格库——三层叠用法，不是三份购物清单。
image: ./cover.jpg
tags: [Taste Skill, 前端审美, UI, Anti-Slop]
category: skill 测评
draft: false
lang: ''
slug: design-skills-anti-ai-look
pinned: false
comment: true
updated: 2026-08-11T01:39:19
---

Cursor / Claude Code / Codex 写前端，功能往往能跑，脸却总像同一张：紫蓝渐变、100vh 居中 Hero、三等分 Feature 卡、Inter 一把梭。行业叫这 AI Slop——不是「丑」，是「默认」。

这周手头三份素材其实在讲**同一条审美流水线的三层**，不是三个互抢的安装包：

| 层 | 管什么 | 代表 |
|---|---|---|
| 约束 | 反模板规则、三旋钮、起飞前自检 | Taste Skill（`design-taste-frontend`） |
| 串技 | 参考图落地 → 拧品味 → Vercel 规则钉到 `file:line` | 设计美化四技里的网页三连 |
| 词库 | 点名美学家族（79 风格 × 中英 Prompt） | `ui-styles-skill` |

别四个 skill 一锅扔进同一轮对话，也别把「风格名」和「品味旋钮」当成同一把刀。

![四技总览图卡](./images/fig-four-overview.jpg)

## Taste：把「别出那张脸」写成可执行规则

[Taste Skill](https://github.com/Leonxlnx/taste-skill)（Leonxlnx，官网 [tasteskill.dev](https://tasteskill.dev)，MIT）不是 UI 库、不是 CSS 框架、没有运行时。本质是一堆 `SKILL.md`：读 brief → 调旋钮 → 硬禁常见模板 → 起飞前自检。

默认安装名 `design-taste-frontend`，当前是 **v2 experimental**（要钉死旧行为就装 `design-taste-frontend-v1`）。骨架可以记成四段：

**§0 Brief Inference**——碰代码之前先读房间：页面种类、vibe 词、参考 URL/截图、受众、品牌资产、安静约束。输出一行 Design Read 再开干。brief 真含糊时只问**一个**澄清问题，不连环审问。

**三旋钮（1～10）**：

| 旋钮 | 默认 | 低 → 高 |
|---|---|---|
| `DESIGN_VARIANCE` | **8** | 对称干净 → 不对称实验 |
| `MOTION_INTENSITY` | **6** | 静态 / hover → 电影级 / 磁吸 / 滚动 |
| `VISUAL_DENSITY` | **4** | 画廊留白 → 座舱密铺 |

Baseline `8 / 6 / 4`。覆盖靠对话，不靠让用户去改 skill 文件。

**Hard Bans（节选）**：默认紫蓝渐变 / Lila glow（品牌明确要紫另说）、`100vh` 居中 Hero 当万能开场、三等分等宽 Feature 墙、滥用 Inter、em-dash 当装饰、半截交付和假数据文案。

**Pre-Flight**：交付前大约 60 项自检。过不了就返工，不当「差不多」。体积提醒：单份 SKILL 大约 87KB / ~2 万 token——装了就会占上下文，不是免费午餐。

仓库里还有 image-to-code、redesign、图像 comps、brutalist 等十来个安装名。不必一次全装；默认一个 `design-taste-frontend` 往往就够起步。

落地页 / 作品集 / 营销站是主场。仪表盘、数据表、多步产品后台，官方自己划了「不是它的菜」。

![Floria 落地页气质样张](./images/fig-floria.jpg)

## 四技网页线：先锚点，再旋钮，再审查

瑭宋元那篇「设计美化专题」把四技并排推。装机量、星数先当宣传数字看（作者称，本轮未核）。宿主兼容按作者口径：WorkBuddy / Codex / QoderWork / Trae。

| # | Skill | 角色 | 你真正拿走的 |
|---|---|---|---|
| 01 | `web-design-guidelines` | 审查 · Vercel | 18 类规则扫 UI；吐 `file:line` |
| 02 | `design-taste-frontend` | 品味 · 反 AI 味 | 就是上一节那套旋钮 |
| 03 | `image-to-code` | 图像落地 | 参考图 → 拆解 → React / Next / Tailwind |
| 04 | `baoyu-comic` | 知识漫画 | 6 风格；知识 → 多页漫画 |

**网页线（推荐）**：`image-to-code` → `design-taste-frontend` → `web-design-guidelines`。  
先有视觉锚点，再拧品味，最后用 Vercel 规则钉到具体行。

**漫画线**：`baoyu-comic` 单独跑。它解决的是「知识怎么变成可翻页漫画」，跟落地页审美不是一条流水线。

安装命令（作者文内，本机未实测）：

```bash
curl -fsSL vercel.com/design/guidelines/install | bash
npx skills add Leonxlnx/taste-skill --skill design-taste-frontend
npx skills add jimliu/baoyu-skills --skill baoyu-comic
```

`image-to-code` 原文图卡没给独立一行安装命令；串进网页线时按你宿主里实际包名再补。

## ui-styles：别只会喊「好看一点」

Ant Design 看腻了，跟 Agent 又只会喊「好看一点」——等于没给审美词条。[ui-styles-skill](https://github.com/chrzamz/ui-styles-skill) 干的事很窄：把开源 UI 风格 Prompt 装进 Claude Code Skill，写前端时能**点名风格**（离线读本地 catalog）。

![ui-styles 封面：79 风格 · 离线 · 中英](./images/fig-ui-styles.jpg)

2026-08-11 核对：README 写 **79** design styles × bilingual prompts；GitHub 显示 ★10；上游 Prompt 致谢 [TonnyWong1052/UI-Prompt](https://github.com/TonnyWong1052/UI-Prompt)。封面图写 79、公众号正文常见 70+——以仓库 79 family 为准；其中 9 个只有 `style.md`（理解用），没有可直接生成代码的 `custom.md`。

能带走的用法：按场景筛候选；点名风格（如 claymorphism）再出页；两个风格名直接对比各自 `style.md`。作者例：出入库项目用 Shadcn/ui + Tailwind 做黏土风——风格词有了，组件库才是落地层，不是互斥。

## 三层怎么叠，别搅成一锅

| | Taste / 四技品味层 | ui-styles |
|---|---|---|
| 管什么 | 反模板约束 + 审查落点 | 风格 Prompt 库 |
| 典型动作 | brief → 三旋钮 / `review my UI` | 「用 claymorphism 做登录页」 |
| 适合先上 | 已经「能跑但一眼模板」 | 知道要某种美学家族、缺词条 |

推荐串法：先从 ui-styles 点风格名（或从参考图走 image-to-code），再用 Taste 收口，最后 guidelines 钉行号。漫画需求单独开 baoyu-comic，别跟网页三连搅。

## 适合谁，别硬套谁

适合：落地页、作品集、营销站、活动页；已经一眼模板的改版；想把审美判断沉淀成可复用 Agent 约束的人。

不太适合：后台表格、高密度仪表盘、多步产品工作台；brief 糊却指望旋钮救命；上下文很紧、不想喂进约 2 万 token 规则的会话；把 v2 experimental 当生产契约却拒绝回退到 v1。

作者声明（Taste）：没有官方代币 / 币 / 加密项目；蹭名发币的一律无关。

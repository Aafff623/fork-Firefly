---
title: 装了插件 skill，一个都不显示？问题在目录层级，不在安装
published: 2026-08-05
updated: 2026-08-06T00:04:45
description: Claude Code 装了插件 skill 却不显示？/reload-skills 不管插件、插件只认一层目录、显式数组撞文档盲区——三层原因叠一起。附排查五步与 junction 解法。
image: ./cover.jpg
tags: [Claude Code, 插件, Skill, 排查, marketplace, junction]
category: Agentic Coding
draft: false
lang: ''
slug: claude-plugin-skill-loading
pinned: false
comment: true
---

遇到个挺典型的坑：在 Claude Code 里装了个插件（mattpocock-skills，打包了他一整套方法论 skill），marketplace 加了、enabledPlugins 也启用了，可 `/grilling` 就是死活不出现。跑 `/reload-skills` 也没用，永远显示 "no changes"。查了一圈，最后发现是三层原因叠在一起，而且全都不在「安装步骤」上。

## 最反直觉的一点：reload-skills 不管插件

`/reload-skills` 只重载本地 `~/.claude/skills/` 和项目里的 skills 目录，**根本不碰插件**。这个命令官方文档甚至没收录（就是个本地扫描器）。要重载插件，正解是 `/reload-plugins`——而且在 2.1.220 上装了新插件必须手动跑它或重启才生效，2.1.221 起才安装即自动生效。

还有个隐藏坑：reload 后摘要写 "0 skills"，不代表插件 skills 没加载——那个计数只统计插件的 `commands/` 目录，不算 `skills/` 目录。看到 0 别慌，直接看 `/skills` 的实际列表。

## 主因：插件 skill 只认一层目录

Claude Code 发现插件 skill 的规则是死的：插件根下 `skills/<skill名>/SKILL.md`，只扫一层。mattpocock 的仓库把 skills 放在 `skills/<分类>/<skill名>/`，比如 `skills/productivity/grilling/`，多套了一层分类目录，默认扫描直接 miss。

对照实验很直观：同环境里 claude-mermaid 插件的 skill 是 `skills/mermaid-diagrams/SKILL.md`（一层），正常显示；mattpocock 全是两层，一个都不出。

## 再叠一层：显式数组 + source 指向根 = 文档盲区

mattpocock 的 plugin.json 显式声明了 24 个 skills 路径（形如 `./skills/engineering/xxx`）。按文档，显式路径指向含 SKILL.md 的目录本应注册成功。但它 marketplace 条目的 `source` 指向 marketplace 根，触发了「显式数组替换默认扫描」的分支——这个组合官方文档没覆盖，2.1.220 实测就是加载不出来。这更像插件作者踩了 Claude Code 的文档盲区（疑似 bug），不是你安装姿势的问题。

## 一条铁证

同样这批 skills，只有 `strategic-compact` 和 `ralph-loop` 两个出现在列表里——因为它们被作者自带的 `scripts/link-skills.sh` 软链进了 `~/.claude/skills/`（本地一层路径，能被扫到）。同插件、同布局，链进本地的能显示，没链的 grilling 就消失。「装了却路由不到」这事，证据全在这。

## 排查五步（下次直接照抄）

| 步骤 | 做什么 | 判读 |
|---|---|---|
| 1 | 看 `~/.claude/skills/` | 本地没有 ≠ 没装，别急着结论 |
| 2 | 看 `~/.claude/plugins/cache/<plugin>/` | 插件缓存是否完整、skills 目录是否都在 |
| 3 | 看 plugin.json 的 `skills` 字段 | 路径是 `skills/<名>` 还是 `skills/<分类>/<名>` |
| 4 | 对比例子：同环境哪个插件的 skill 显示正常 | 一层 vs 多层，差别一眼可见 |
| 5 | 跑 `/reload-plugins`（不是 /reload-skills） | 仍不显示 → 基本坐实布局问题，走解法 |

## 解法：绕开插件加载，链进本地

官方 troubleshooting 是清缓存（`rm -rf ~/.claude/plugins/cache`）重启重装，治标不治本，且缓存里带版本号，重装后 junction 又得重建。对二级目录的插件，作者自己的推荐是 `scripts/link-skills.sh`，把每个 skill 软链到 `~/.claude/skills/`。Windows 上等价物是 **junction**（目录联接，免管理员权限、对应用透明）：

> 把 plugin.json 声明的每个 skill 路径，以 junction 建到 `~/.claude/skills/<skill名>`，指向 `插件缓存/.../skills/<分类>/<skill名>`。一次 24 个，`/grilling` 立刻出现。

## 长期建议

这不是环境问题，是插件作者侧的兼容问题。正解两个方向：作者把布局压平成一层 `skills/<名>/SKILL.md`（对齐文档标准），或去掉显式 `skills` 数组走默认扫描。在那之前，junction 链进本地是最省事的 workaround。记得 junction 指向带版本号的缓存路径，插件升级后要重建一遍（一条命令的事）。

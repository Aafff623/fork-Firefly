---
title: OpenCode 也想记住你：把 Claude Code 的 AutoMemory 接过来
published: 2026-08-07
updated: 2026-08-07T14:45:00
description: OpenCode 原生没有 Claude Code 同款 AutoMemory？用 opencode-claude-memory 直接复用同一套 Markdown 记忆，Windows 下还要处理一次项目路径错位。
image: ./cover.jpg
tags: [OpenCode, Claude Code, AutoMemory, 记忆管理, Agentic Coding]
category: Agentic Coding
draft: false
lang: zh-CN
slug: opencode-claude-memory-sharing
pinned: false
comment: true
---

如果你同时用 Claude Code 和 OpenCode，迟早会遇到一个很烦的问题：Claude 记得项目历史，OpenCode 却像第一次见面。

最省事的解法不是再建一套 SQLite，也不是把记忆迁移到某个云服务，而是让两个工具读写同一份 Claude Code AutoMemory。

## compaction 不是 AutoMemory

这两个概念很容易混在一起。

OpenCode 的 session persistence 和 context compaction，解决的是当前会话太长之后如何继续；Claude Code AutoMemory 解决的是哪些信息值得跨会话保留下来。一个负责压缩上下文，一个负责沉淀长期记忆，不是一回事。

OpenCode 核心目前没有 Claude Code 同款的自动记忆提取机制。想让它跨会话召回和写回，就需要插件或其他扩展层。

## 选兼容层，不另起炉灶

这次接入的是 `opencode-claude-memory`。它的定位不是新建一个记忆系统，而是把 OpenCode 接到 Claude Code 已有的本地 Markdown 目录上：

| 项目 | 做法 |
|---|---|
| 存储 | 继续使用 Claude Code 的 `~/.claude/projects/<project>/memory/` |
| 格式 | 沿用 Markdown 与 YAML frontmatter |
| 迁移 | 不迁移，旧文件原样保留 |
| 数据库 | 不增加 SQLite、worker 或云端服务 |
| 工具 | 提供 `memory_list`、`memory_search`、`memory_read`、`memory_save`、`memory_delete` |

说白了，这不是复制记忆，而是接同一个文件入口。

## 实际接入只需要三步

先安装插件：

```bash
npm install -g opencode-claude-memory
```

再安装会话结束后的 wrapper：

```bash
opencode-memory install
```

最后在全局 `opencode.json` 里追加插件：

```json
{
  "plugin": ["opencode-claude-memory"]
}
```

已有其他插件时只追加，不要覆盖整个配置。改完后要完全退出并重启 OpenCode，配置不会在当前进程里热加载。

## Windows 下真正容易卡住的是路径

我的 blog 工作区有两个层级：

```text
D:\OneDrive\Desktop\blog
└── Firefly    # 真正的 Git 仓库
```

Claude Code 旧记忆已经落在：

```text
C:\Users\Lenovo\.claude\projects\D--OneDrive-Desktop-blog\memory\
```

而插件按照 Firefly 的 Git 根目录解析出了另一条路径：

```text
C:\Users\Lenovo\.claude\projects\D--OneDrive-Desktop-blog-Firefly\memory\
```

如果不处理这个差异，插件虽然能加载，`memory_list` 也能调用，但看到的是一个空目录。这个状态最容易被误判成“插件没有记忆”。

解决方式是把空的目标目录改成 Windows junction，指向已有的 Claude memory：

```text
D--OneDrive-Desktop-blog-Firefly\memory
        ↓ junction
D--OneDrive-Desktop-blog\memory
```

这样没有复制文件，也没有迁移真源；两个路径只是指向同一份内容。以后如果项目根目录或 Git worktree 变化，要重新检查插件解析出的路径。

## 验证不能只看配置文件

“配置写进去了”和“共享记忆真的能用”至少是三层证据：

1. `opencode debug config` 能识别 `opencode-claude-memory`。
2. 独立重启的 OpenCode 进程能调用 `memory_list`、`memory_search`、`memory_read`。
3. OpenCode 写入一条临时记忆后，Claude Code 在同一个项目里也能读到。

本次验证结果是：

| 验证项 | 结果 |
|---|---|
| 插件版本 | `opencode-claude-memory@1.7.3` |
| OpenCode memory 工具 | 可用 |
| 现有 blog memory | 可读 |
| OpenCode 写入 | 成功 |
| Claude Code 读取 OpenCode 写入 | 成功 |
| 临时测试条目 | 已清理 |
| 原有 memory 文件 | SHA-256 已恢复一致 |

最后一项很重要。测试写入时，插件会同步更新 `MEMORY.md` 索引；如果只删测试主题文件、不恢复索引，记忆库仍然会留下脏引用。验证脚本或工具如果没有帮你做回滚，必须再检查一次索引。

## 记忆、项目规则和文章素材各归其位

共享记忆很有用，但它不是整个知识系统：

| 内容 | 适合的位置 |
|---|---|
| 稳定的项目规则与命令 | `AGENTS.md`、`CLAUDE.md`、`CONTEXT.md` |
| 用户偏好、工作习惯、跨会话决策 | Claude Code AutoMemory |
| 调研结论和文章素材 | `D:\OneDrive\Desktop\Knowledge\` |
| 可发布正文 | blog 的 `src/content/posts/` |

把所有东西塞进 AutoMemory，最后只会得到一间很难找东西的杂物间。记忆应该保存“以后还会影响决策的事实”，文章素材则应该进入自己的写作流水线。

## 还有一个 Skill 入口误会

OpenCode 的 Skill 不等于斜杠命令。它由 Agent 的 `skill` 工具按需加载，所以在 `/skills` 菜单里看不到，不代表文件没有安装。

正确的触发方式是直接告诉 Agent：

```text
用 knowledge-extract 提炼这次会话。
```

如果 Skill 已被当前 CLI 的 available skills 发现，Agent 就可以加载它。模型 variants 是 API 推理参数问题，Skill 则是 Agent 工具入口问题，这两件事不要混成一个“索引失败”。

## 最后留一条边界

共享方案解决的是存储一致性，不保证所有 shell 的 wrapper 行为都一样。Windows 下 Git Bash 更容易让 `opencode-memory install` 生效；PowerShell 仍能加载插件和 memory 工具，但会话结束后的自动提取是否触发，要按实际运行环境验证。

真正稳妥的判断顺序是：先看插件有没有被 OpenCode 解析，再看工具能不能读已有条目，最后做一次跨工具写读。三层都通过，才算真的把两套记忆接成了一套。🧠

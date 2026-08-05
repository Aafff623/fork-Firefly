---
title: 把 CLI 爬虫封装成 MCP Server，AI 一句话就能让它去小红书采数据
published: 2026-08-05
updated: 2026-08-05T21:46:40
description: 把 MediaCrawler 的 CLI 爬虫封装成 MCP Server，AI 一句话就能采小红书/抖音等平台数据。核心取舍：子进程隔离、提交加轮询、复用登录态，外加四个比方案更值钱的坑。
image: ./cover.jpg
tags: [MCP, 爬虫, MediaCrawler, 小红书, Claude Code, Python, 子进程, Agent]
category: Agentic Coding
collections: [mcp-recommend]
draft: false
lang: ''
slug: cli-crawler-mcp-server
pinned: false
comment: true
---

MediaCrawler 是个挺能打的爬虫项目，七个平台（小红书 / 抖音 / 快手 / B 站 / 微博 / 贴吧 / 知乎）都能采公开内容和评论，但日常使用得手动跑命令行：`python main.py --platform xhs --type search --keywords "xxx"`，登录态、翻页、存库全得自己伺候。

我的想法很直接：既然 Claude Code、Cursor 这些 AI 编程工具能读文件、能跑命令，为什么不把采集能力直接交给它们？让 AI 说一句「去小红书搜 AI 编程最近的热帖」，它自己就能把数据采回来、做分析、写报告。

中间缺的是一座桥：MCP Server。

## 最核心的取舍：子进程隔离，不搞进程内驱动

整个项目最关键的设计决策，根子在一个历史包袱上——MediaCrawler 的配置全挂在全局 `config` 模块上。CLI 解析完直接改写 `config.KEYWORDS`、`config.PLATFORM` 这些全局变量，平台采集代码内部也直接读它们。

这意味着什么？**一个进程里跑两个任务，全局配置互相污染。** 你给任务 A 设的关键词，任务 B 也跟着变。而 MCP Server 恰恰要支持多任务、要并发，跟「全局单例」天然冲突。

三条路摆面前：

| 方案 | 思路 | 代价 |
|---|---|---|
| 子进程隔离 | 每个任务独立 `subprocess` 跑 `main.py` CLI | 每次冷启动浏览器，慢几秒 |
| 进程内驱动 | import 后改 config 再跑 async 任务 | 全局状态共享，并发=数据竞争，只能退化成串行 |
| 常驻 worker 池 | 预登录 N 个子进程排队分发 | 要自己管进程池、崩溃回收，复杂度最高 |

我选了子进程隔离。理由特别实在：MediaCrawler 自带完整 CLI，子进程方案**零改动复用源码**，进程边界天然把 config 污染问题解决了，代价只是每次冷启动 Chromium 那几秒——完全可接受。为快那么一点去背进程池的复杂度，不划算。

MCP 侧最终暴露六件工具：`search_posts` / `get_post_detail` / `get_comments` 负责提交采集任务，`get_task_status` 轮询进度，`get_login_state` / `list_platforms` 查状态。

## 长任务必须拆成「提交 + 轮询」

采集是分钟级的活：一个关键词搜 20 条帖子带评论，三到五分钟很正常。而 MCP 工具调用是有超时约束的，同步阻塞不可行。

所以接口拆两类：

- **快操作**（查登录态、列平台、查任务状态）→ 同步返回
- **采集动作** → 提交后返回 `task_id`，AI 自己轮询 `get_task_status`

AI 拿到的是一套能自主编排的流程：提交 → 轮询 → 拿到 `save_dir` → 按需读文件。数据量大时绝不能整包塞回 MCP 返回值——会直接撑爆 agent 上下文，只回摘要和落盘路径。

## 登录态这关，直接复用它自己的机制

MediaCrawler 的登录态不是存个 cookie 文件，而是用 Playwright 的 `launch_persistent_context(user_data_dir="browser_data/{platform}")`——**整个 Chromium 用户目录落盘**。扫码登录一次，之后每次启动浏览器自动带上 cookie。

所以 MCP 侧根本不用管登录流程，只做两件事：

1. 让用户手动跑一次 `main.py --lt qrcode` 扫码，登录态落到 `browser_data/`
2. `get_login_state` 探测该目录在不在，就能判断有没有登录态

比自己在 MCP 里重新实现一遍登录流程省事得多，也稳得多。

## 四个坑，比方案本身值钱

### 坑一：CLI 参数名必须跟上游 arg.py 对齐

照着自己的命名习惯拼了 `--crawler_max_comments_count_singlenotes`，结果子进程一启动就 `NoSuchOption` 崩溃。MediaCrawler 真实的参数名是 `--max_comments_count_singlenotes`——**没有 crawler 前缀**。拼参数前老老实实 grep 一眼上游 `cmd_arg/arg.py`，别猜。

### 坑二：小红书 search 最小一页 20 条，max_notes 有硬下限

以为传 `--crawler_max_notes_count 3` 就只采 3 条，实际 `core.py` 里写死 `if CRAWLER_MAX_NOTES_COUNT < 20: 强制抬到 20`。于是 search 最少采一整页 20 条加评论，一个任务三到五分钟。想「只采几条试试」在 search 模式做不到，得用 detail（指定帖子）模式。这也意味着测试脚本的轮询超时得设得比服务器超时长，否则任务还在采，脚本先放弃了。

### 坑三：Python 包结构影响类型检查

一开始 `config.py` 放在项目根，`core/` 子目录里 `import config`。运行时没问题（sys.path 能找到），但 Pyright 会把 `config` 解析成 `core.config`（包内同名模块优先），满屏红线。解法是把代码收进正式 package（`mediacrawler_mcp/`），用相对导入 `from .. import config`。注意 IDE 的语言服务器可能缓存旧解析，命令行 pyright 已经 0 错误了 IDE 还飘红，重启一下就好。

### 坑四：Windows GBK 控制台打 emoji 会崩

测试脚本里 `print("✅ 通过")`，中文 Windows（代码页 936/GBK）控制台直接 `UnicodeEncodeError`。不是业务 bug，是测试打印的锅。要么启动时设 `PYTHONIOENCODING=utf-8`，要么打印内容别用 emoji。

## 防封号：少量、多类型、单并发

爬虫最怕封号，测试策略必须克制：**每种采集类型各测一次、量调到最小、严格串行**。

- 三种采集类型（search / detail / comments）各跑一次
- search 受平台限制最小 20 条，detail / comments 就 1 帖 5 评论
- 并发永远为 1（信号量控制），任务之间留间隔，绝不堆请求

验证到这一步，三条采集路径全部真实跑通：search 采到「AI编程」关键词的 20 条帖子加评论；detail / comments（指定帖子、指定帖子评论）在修好参数 bug 后也都成功，单个任务三到四分钟。

## 项目长这样

```
mediacrawler-mcp/
├── server.py                # MCP 入口，注册 6 个工具
├── mediacrawler_mcp/core/   # 子进程编排 + 任务状态机（并发/超时/回收）
├── tests/                   # 协议层冒烟 + 编排链路 + 场景 loop 测试
└── README.md                # 安装 / 登录 / 挂载到 Claude Code 的说明
```

整套做下来最大的感受：**CLI 项目封装成 MCP 的难度不在写工具，而在摸清上游的架构约束**——全局状态、参数命名、平台行为，每个都可能是坑。先把这些摸清楚，剩下就是把「拼参数、起进程、收日志」这种机械活写对而已。

---
title: MCP 实战手册：边界、分工与 Windows 配置坑
published: 2026-08-05
updated: 2026-08-12
description: MCP 与 Skills/Plugin/CLI 边界、Windows mcp.json，以及必装与爬虫封装实战。
image: ./cover.jpg
tags: [MCP, Skills, Plugin, Windows, 配置]
category: 指南
collections: [review-skill-mcp, agentic-coding-core]
draft: false
lang: ''
slug: mcp-handbook
pinned: false
comment: true
---

规范专篇之四：**MCP**。Claude「先装哪三件」等工具口味保留为旁证章。

---

## MCP、Skills、Plugin 不是三选一

> 合并自原帖 `mcp-handbook`

很多人把 MCP、Skills、Plugin 当成并列扩展手段，选型时硬选一个。其实它们叠了三层：MCP 管「能否触及」，Skill 管「用得是否像样」，Plugin 只管「怎么打包给人装」。

### 谁解决什么

| 层 | 解决啥 | 类比 |
|---|---|---|
| MCP | 连外部工具/数据 | USB-C |
| Skills | 流程手册，按需加载 | 操作说明书 |
| Plugin | 打包分发 | 应用商店安装包 |

Plugin 是容器，里面可以塞 Skills、`.mcp.json`、commands、hooks；Skill 读手册；MCP 开通道。缺一层事就做不全，但单干一个 Skill 时没必要硬套插件壳。

### MCP：连接层

- 传输：**stdio**（本地）+ **Streamable HTTP**（远程）。独立 SSE 已废弃，新接入别再写 `sse`。
- 配置：`claude mcp add` 或手写 `.mcp.json`。
- 作用域：`local` / `project` / `user`。

MCP 只负责接通；怎么用好那条连接，是 Skill 的事。

### Skills：能力层

- 一个文件夹 + `SKILL.md`（YAML + 正文）。
- **`description` 决定会不会被自动唤起**：写糊了等于白装。
- slash command 已并入 Skills：`.claude/commands/deploy.md` 与 `.claude/skills/deploy/SKILL.md` 都会注册 `/deploy`。
- 可手动 `/skill-name`；只想手触、别自动：`disable-model-invocation: true`。
- 路径：`~/.claude/skills/` · `.claude/skills/` · 插件内 `skills/`。
- 渐进披露：元数据常驻，正文与脚本用到才加载。

Skill ≠ 子代理：子代理另起上下文；Skill 是塞给当前 agent 的说明书。

### Plugin：分发层

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json    # 只有清单在这里
├── commands/
├── skills/
├── agents/
├── hooks/
└── .mcp.json
```

何时上 Plugin：已经攒了一组 Skill + MCP，要给团队一键装。单个 Skill 或一条 MCP，直接放就行。

### 选型怎么判

1. 要摸外部系统 → MCP  
2. 要固定流程、恰当时机自己上 → Skill  
3. 只要手动快捷 → Skill（命令式轻量写法）  
4. 要整包交付 → Plugin  
5. 要独立上下文/工具集 → 子代理，别拿 Skill 硬顶  

常见误会：Skills 与 MCP 二选一（其实常并用）；Skill 只能自动触发；slash 与 Skill 两套机制；还在用已废弃 SSE；插件目录放错。

### 相关阅读

- [Skill 装不上，多半是目录或多套了一层](/posts/agent-skills-handbook/)
- [Claude Code 必装 MCP：先三件，再慢慢加](/posts/claude-code-handbook/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/qq_44202160/article/details/161696233)

---

## MCP 和 Skills 不是一层

> 合并自原帖 `mcp-handbook`

「都是给 AI 加能力，所以二选一」——这句把人带沟里了。加能力没错，**层位**才是坑：一个管接进来，一个管怎么做。

![MCP 和 Skills 不是一层](./images/mcp-vs-skills-layers/fig-01-overview.jpg)

### MCP：统一怎么接外面

MCP（Model Context Protocol）是**开放连接标准**：AI 应用用同一套规矩发现、暴露、传递和调用外部能力——数据源、工具、工作流、外部应用。

官方说法（2026-08-11 核对）：开源标准，用来把 AI 应用接到外部系统；类比就是 AI 侧的 USB-C——值钱的是统一插头，不是某一个外设。见 [modelcontextprotocol.io/introduction](https://modelcontextprotocol.io/introduction)。

![MCP 负责把能力接进来](./images/mcp-vs-skills-layers/fig-02-plug-in.jpg)

记住这句就够：**重点不是某个工具，而是统一连接方式。**

### Skills：把「做得对」打包带走

Skills 是**可复用能力包**：说明、知识、脚本、模板……把领域里怎么把事做稳的经验捆好，任务来了直接调用。

| | MCP | Skills |
|---|---|---|
| 偏什么 | 连接 | 组织 |
| 回答 | 怎么接外部世界 | 怎么把任务做好 |
| 对 AI | 接进来 | 按方法做 |
| 互替？ | 否 | 否 |

### 周报：接得上 × 做得对

别空谈互补，看一张销售周报怎么叠。

![周报任务里它们怎么配合](./images/mcp-vs-skills-layers/fig-03-weekly-report.jpg)

1. **MCP**：数据库 / 文件系统 / 搜索——原料接得上
2. **Skills**：先查哪些表、周报结构、风险检查、脚本模板——方法复用
3. **产出**：像样的销售周报

只有插头没有菜谱，会乱炖；只有菜谱接不上库，是纸上谈兵。

### 三层栈：模型 · 连接 · 任务组织

把 MCP / Skills 塞进成熟 AI 的分层里，误会基本消掉。

![成熟 AI 系统的三层结构](./images/mcp-vs-skills-layers/fig-04-three-layers.jpg)

| 层 | 干什么 | 落点 |
|---|---|---|
| 模型 | 推理 / 生成 / 理解 | 脑子 |
| 连接层 | 数据 · 工具 · 系统 · 工作流 | **MCP** |
| 任务组织层 | 拆解 · 领域流程 · 复用规范 · 资源打包 | **Skills** |

公式六个字：**模型 + 连接 + 任务组织。**  
选型时先问「我缺的是插头还是菜谱」，别再问「MCP 和 Skills 哪个更强」。

### 跟旁边那张三件套卡别搅

本篇不讲 CLI，也不讲具体怎么配某个 Host。若要「连接 / 方法 / 执行」三件一起看，站内已有：[一张图讲清 MCP、Skills 和 CLI 怎么分工](/posts/mcp-handbook/)。彼=三件选型；本篇=两概念层位 + 三层栈，别硬并成一篇。

---

## 一张图：MCP / Skills / CLI

> 合并自原帖 `mcp-handbook`

MCP、Skills、CLI，分别解决「连接、方法、执行」三类问题。MCP 让 AI 接入知识库、数据库和外部系统；Skills 沉淀流程与经验，提升复用性；CLI 负责具体命令执行与落地操作。三者并非替代关系，而是协同关系，组合使用效果最佳。

它们分别是什么？彼此什么关系？怎么选？下面按图四段展开，文案尽量跟图面走，不当完整教程。

![MCP、Skills、CLI 分工图](./images/mcp-skills-cli-relationship/fig-01-01-mcp-skills-cli-one-image.jpg)

### 三件东西，各管一块

| 件 | 图面定义 | 典型能力 | 像 AI 的… |
|---|---|---|---|
| **CLI** | 命令行入口：直接操作电脑和终端 | 安装部署 / 执行命令 / 调试排错 | **手和脚** |
| **Skills** | 能力包：把经验、流程、脚本打包复用 | 标准流程 / 重复任务 / 稳定输出 | **经验和方法** |
| **MCP** | 连接协议：让 AI 接入外部工具和数据 | 知识库 / 第三方服务 / 系统集成 | **外部接口** |

分不清时先对号：要不要**动手**、要不要**按套路做事**、要不要**连外面**。

### 不是替代，是叠在一起用

图中间是 AI Assistant，三件分别贴到不同部位：

- **Skills** → 教它怎么做
- **CLI** → 帮它动手执行
- **MCP** → 帮它连外部世界

图脚那句够用：**Skills 管方法，CLI 管执行，MCP 管连接。**

不是谁取代谁。缺方法会瞎干，缺手脚落不了地，缺连接就困在本地沙盒。

### 先想清楚你要哪种能力

| 优先 | 触发条件 |
|---|---|
| **优先选 CLI** | 安装软件、运行脚本、操作文件、排查环境问题 |
| **优先选 Skills** | 沉淀 SOP、复用成熟流程、让团队反复调用同一能力 |
| **优先选 MCP** | 接知识库、数据库、邮箱、网页、业务系统或 API |

选型顺序可以很粗暴：本地命令/文件/环境 → CLI；要稳定复用同一套做法 → Skills；要跨系统拿数据/调服务 → MCP。

### 实战里怎么叠

图上三块是叠着的，不是三选一：

1. **Skills** = 告诉 AI 怎么做
2. **CLI** = 让 AI 真正去执行
3. **MCP** = 让 AI 连上更多工具和数据

**最佳实践：通常不是三选一，而是组合使用。**

例：用 Skills 固化流程 + 用 CLI 执行命令 + 用 MCP 连接知识库。

页脚快速记忆也顺手背掉：

| 件 | 记法 |
|---|---|
| CLI | 会动手 |
| Skills | 会做事 |
| MCP | 会连接 |

---

## Windows mcp.json

> 合并自原帖 `mcp-handbook`

官方明确说过：Windows 用 `npx` 起 MCP 时，要用 `cmd /c` 包一层，否则 stdio 管道会被命令解释器截断。这是本机最常见的「装了但连不上」。

### 传输与 scope

| 传输 | 场景 |
|---|---|
| stdio | 本地进程（默认，本文重点） |
| SSE | 远程长连接（旧路径，新接入慎用） |
| HTTP / streamable-http | 远程无状态 / 规范推荐名 |

| scope | 落盘 | 是否进 Git |
|---|---|---|
| local | 项目 `.mcp.json` | 通常不提交 |
| project | 项目 `.mcp.json` | 可提交共享 |
| user | `~/.claude/settings.json` → `mcpServers` | 仅本机 |

user：`claude mcp add / list / remove`；`-e` 传环境变量，`-H` 传 HTTP 头。

### 八件实用 MCP（Windows 命令形态）

| 名 | 要点 |
|---|---|
| filesystem | 白名单根目录，别给 `C:\` |
| memory | 跨会话知识图谱；和 `CLAUDE.md` 分工：规则 vs 事实 |
| git | `uvx mcp-server-git` 或 `python -m mcp_server_git` |
| github | Token 进 `env`，权限收紧到 repo/read:org |
| postgres | 连接串；只读 SELECT，别接生产写库 |
| puppeteer | 首次拉 Chromium，国内可能慢 |
| fetch | HTML→Markdown |
| brave-search | API Key；旧包可能归档，可换 `@anthropic-ai/brave-search-mcp-server` |

### 手写 `.mcp.json` 何时划算

批量改多台机器、或 CLI 一行写烦时，直接编 JSON 与 `claude mcp add` 等价。注意逗号/引号；密码与 token **只放本机**，入库前打码。

路径速查：

- 项目：`项目根\.mcp.json`
- 用户：`C:\Users\<用户>\.claude\settings.json` 的 `mcpServers`

### 和「必装推荐」怎么拼

清单选型看 [Claude Code 必装 MCP：先三件，再慢慢加](/posts/claude-code-handbook/)；Windows 可跑命令形态以本篇表格为准。

### 相关阅读

- [Claude Code 必装 MCP：先三件，再慢慢加](/posts/claude-code-handbook/)
- [Codex 想长期好用，得同时拴两根绳子](/posts/codex-handbook/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/weixin_63132747/article/details/160740050)

---

## 必装 MCP 旁证（Claude）

> 合并自原帖 `claude-code-handbook`

别一口气装二十个 MCP。先全局挂三件基础，跑稳了再按技术栈加第二、三批。命令侧统一 `-s user` + `npx -y`，装完 `claude mcp list` 验一遍。

### 管理命令

```bash
claude mcp list
claude mcp add <名> -s user -- <启动命令>
claude mcp remove <名>
```

### 第一批（建议先装）

| 服务器 | 命令要点 | 干什么 |
|---|---|---|
| filesystem | `@modelcontextprotocol/server-filesystem` + 目录白名单 | 本地读写，别给整盘 |
| Context7 | `@upstash/context7-mcp@latest` | 库/框架最新文档 |
| Git/GitHub | 官方/社区 GitHub MCP | Issue/PR/协作 |

### 第二批 / 第三批

- **增强**：Sequential Thinking、mcp-run-python、数据库 MCP  
- **按需**：Playwright、Figma、Repomix/DeepWiki、Task Master  

Playwright 用 `@executeautomation/playwright-mcp-server`；Sequential Thinking 用 `@modelcontextprotocol/server-sequential-thinking`。

### 为啥这几件值得先装

| MCP | 值得装的理由 | 原文评分 |
|---|---|---|
| Filesystem | 全栈/数据几乎绕不开 | 5/5 |
| Context7 | 少翻墙查文档，像实时 API 字典 | 5/5 |
| Git/GitHub | 协作与托管项目 | 5/5 |
| Playwright | 前端测/截图/爬取 | 4/5 |
| Sequential Thinking | 复杂规划拆步 | 4/5 |
| 数据库 MCP | 查结构、出 SQL（注意只读/非生产） | 4/5 |
| Figma / Task Master | UI 对齐、脑暴规划 | 3/5 |

### 坑

- 一次装太多 → 资源占满、工具列表噪音大。  
- Windows 上裸 `npx` 可能截断 stdio；要 `cmd /c` 包一层（见 [Windows 上 MCP：先记住 cmd /c](/posts/mcp-handbook/)）。  
- 密钥走 `env`，别写进仓库；token 打码后再分享配置。

### 相关阅读

- [Windows 上 MCP：先记住 cmd /c](/posts/mcp-handbook/)
- [MCP、Skills、Plugin 不是三选一](/posts/mcp-handbook/)

> 素材来源：[CSDN 原文](https://channing.blog.csdn.net/article/details/151584549)

---

## CLI 爬虫 MCP 实战

> 合并自原帖 `claude-code-handbook`

MediaCrawler 是个挺能打的爬虫项目，七个平台（小红书 / 抖音 / 快手 / B 站 / 微博 / 贴吧 / 知乎）都能采公开内容和评论，但日常使用得手动跑命令行：`python main.py --platform xhs --type search --keywords "xxx"`，登录态、翻页、存库全得自己伺候。

我的想法很直接：既然 Claude Code、Cursor 这些 AI 编程工具能读文件、能跑命令，为什么不把采集能力直接交给它们？让 AI 说一句「去小红书搜 AI 编程最近的热帖」，它自己就能把数据采回来、做分析、写报告。

中间缺的是一座桥：MCP Server。

### 最核心的取舍：子进程隔离，不搞进程内驱动

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

### 长任务必须拆成「提交 + 轮询」

采集是分钟级的活：一个关键词搜 20 条帖子带评论，三到五分钟很正常。而 MCP 工具调用是有超时约束的，同步阻塞不可行。

所以接口拆两类：

- **快操作**（查登录态、列平台、查任务状态）→ 同步返回
- **采集动作** → 提交后返回 `task_id`，AI 自己轮询 `get_task_status`

AI 拿到的是一套能自主编排的流程：提交 → 轮询 → 拿到 `save_dir` → 按需读文件。数据量大时绝不能整包塞回 MCP 返回值——会直接撑爆 agent 上下文，只回摘要和落盘路径。

### 登录态这关，直接复用它自己的机制

MediaCrawler 的登录态不是存个 cookie 文件，而是用 Playwright 的 `launch_persistent_context(user_data_dir="browser_data/{platform}")`——**整个 Chromium 用户目录落盘**。扫码登录一次，之后每次启动浏览器自动带上 cookie。

所以 MCP 侧根本不用管登录流程，只做两件事：

1. 让用户手动跑一次 `main.py --lt qrcode` 扫码，登录态落到 `browser_data/`
2. `get_login_state` 探测该目录在不在，就能判断有没有登录态

比自己在 MCP 里重新实现一遍登录流程省事得多，也稳得多。

### 四个坑，比方案本身值钱

#### 坑一：CLI 参数名必须跟上游 arg.py 对齐

照着自己的命名习惯拼了 `--crawler_max_comments_count_singlenotes`，结果子进程一启动就 `NoSuchOption` 崩溃。MediaCrawler 真实的参数名是 `--max_comments_count_singlenotes`——**没有 crawler 前缀**。拼参数前老老实实 grep 一眼上游 `cmd_arg/arg.py`，别猜。

#### 坑二：小红书 search 最小一页 20 条，max_notes 有硬下限

以为传 `--crawler_max_notes_count 3` 就只采 3 条，实际 `core.py` 里写死 `if CRAWLER_MAX_NOTES_COUNT < 20: 强制抬到 20`。于是 search 最少采一整页 20 条加评论，一个任务三到五分钟。想「只采几条试试」在 search 模式做不到，得用 detail（指定帖子）模式。这也意味着测试脚本的轮询超时得设得比服务器超时长，否则任务还在采，脚本先放弃了。

#### 坑三：Python 包结构影响类型检查

一开始 `config.py` 放在项目根，`core/` 子目录里 `import config`。运行时没问题（sys.path 能找到），但 Pyright 会把 `config` 解析成 `core.config`（包内同名模块优先），满屏红线。解法是把代码收进正式 package（`mediacrawler_mcp/`），用相对导入 `from .. import config`。注意 IDE 的语言服务器可能缓存旧解析，命令行 pyright 已经 0 错误了 IDE 还飘红，重启一下就好。

#### 坑四：Windows GBK 控制台打 emoji 会崩

测试脚本里 `print("✅ 通过")`，中文 Windows（代码页 936/GBK）控制台直接 `UnicodeEncodeError`。不是业务 bug，是测试打印的锅。要么启动时设 `PYTHONIOENCODING=utf-8`，要么打印内容别用 emoji。

### 防封号：少量、多类型、单并发

爬虫最怕封号，测试策略必须克制：**每种采集类型各测一次、量调到最小、严格串行**。

- 三种采集类型（search / detail / comments）各跑一次
- search 受平台限制最小 20 条，detail / comments 就 1 帖 5 评论
- 并发永远为 1（信号量控制），任务之间留间隔，绝不堆请求

验证到这一步，三条采集路径全部真实跑通：search 采到「AI编程」关键词的 20 条帖子加评论；detail / comments（指定帖子、指定帖子评论）在修好参数 bug 后也都成功，单个任务三到四分钟。

### 项目长这样

```
mediacrawler-mcp/
├── server.py                # MCP 入口，注册 6 个工具
├── mediacrawler_mcp/core/   # 子进程编排 + 任务状态机（并发/超时/回收）
├── tests/                   # 协议层冒烟 + 编排链路 + 场景 loop 测试
└── README.md                # 安装 / 登录 / 挂载到 Claude Code 的说明
```

整套做下来最大的感受：**CLI 项目封装成 MCP 的难度不在写工具，而在摸清上游的架构约束**——全局状态、参数命名、平台行为，每个都可能是坑。先把这些摸清楚，剩下就是把「拼参数、起进程、收日志」这种机械活写对而已。

---

## 官方坐标与补强备注

配置纪律：密钥走环境变量；Windows 上注意 `cmd /c` 与 JSON 转义；少而精的 MCP 胜过一排僵尸服务器。

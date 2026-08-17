---
title: Kimi Code 完全手册：Workbench、Hook 校验与死循环刹车
published: 2026-08-04
updated: 2026-08-12
description: Kimi Workbench 搬迁、Hook 是否真拦、以及工具失败原参数死循环怎么掐断。
image: ./cover.jpg
tags: [Kimi, Kimi Code, Hook, Workbench, AI Coding]
category: Agentic Coding
collections: [tool-kimi-code, agentic-coding-core]
draft: false
lang: ''
slug: kimi-code-handbook
pinned: false
comment: true
---

这篇是 **Kimi Code 专题合订**（Keyme / Kimi 同一条线）。

---

## 99 块搬进 Workbench

> 合并自原帖 `kimi-code-handbook`

前两天把 `agentic-workbench` 这个项目丢给 Kimi Code CLI 维护，本来只想让它补个主题。结果它不光把主题加了，还顺手把整个工作台的规则、文档、预览壳全给理顺了。我回过神来看 git log，才发现这一整面 Workbench 都是它这轮搭起来的。有点被惊到，写下来记录一下它到底交付了什么。

### 一句话：一个能用的资产工作台

`agentic-workbench` 是「个人上下文优先的 UI 组件资产与视觉样式探索工作台」。说人话就是：**一堆散落的 UI 模板和设计素材，不该躺在 zip 里睡大觉，而是拆成能独立打开、能预览、能翻找的主题项目**。

这轮 Kimi 干的，是把散装素材整理成 17 个自包含主题：

| 类型 | 数量 | 例子 |
|---|---|---|
| 资产型 | 9 个 | aceternity / herouiv3 / hallmark / glass-ui / auroraqua / ui-ux-pro-max |
| 模板型 | 8 个 | shadcn-studio / tinyship / supastarter / mvpfast / vibecoding |

每个主题都是标准「五件套」：README + AGENTS + CLAUDE + CONTEXT + LANGUAGES，配 assets、docs、产品层。别的 Agent 进来照着 README 就能启动预览，不用再翻原始 zip。

### 它这轮新增的：glass-ui-assets

这次重点加的是 **glass-ui-assets**（玻璃拟态 UI 设计资产库）：

- **20 张组件参考图**：white-light 白光玻璃 11 张 + thin-glass 超薄玻璃 9 张，覆盖导航栏、按钮、图表、模态框、命令面板全系列
- **2 份设计规范**：ClauseOS 企业合规 SaaS 设计系统 v2.0 + WenXiBuddy 复刻提示词包 v1.0
- **画廊预览壳**：tab + iframe 的静态画廊，20 张图三个 tab 切换，端口 8879
- **SaaS 成品页**：一个 35KB 的 `dashboard.html`，把 ClauseOS 的 Token 直接落地成可交互后台（侧边导航、模态、⌘K 命令面板都能点）

这不是「把素材堆上去」那种敷衍，是真能打开看、能翻图、能抄 Token 的完成度。

### 真正让我服气的三个点

1. **规则的自觉性**：它主动对齐了仓库的 `port-registry`（端口唯一事实源）、ADR 0016 扁平主题布局、project-init 五件套骨架。不是我提醒的，是它自己查的。
2. **文档的克制**：上游素材只读，不擅自改图改规范；README 里不塞绝对路径不塞私钥；macOS 的资源叉文件主动剔除。
3. **收尾的规整**：461 个 commit 的仓库，这轮 commit 信息干净（`feat(glass-ui-assets)` / `docs(workbench)` / `docs(commit-history)` 分门别类），git log 读起来像正规开源项目。

### 99 元套餐，值不值

最让我意外的是：这是 **99 元/月的 Kimi 套餐**干出来的，不是 200 刀的 Claude 订阅，也不是开 API 按 token 烧。模型本身能不能打是一回事，**它有没有把「维护一个仓库该有的姿势」内化成习惯**是另一回事。这一轮它显然是会的。

当然不是无脑吹。中途它也有几次文档路径指错、计数对不齐，得我纠。但纠完它能记住，下一轮不再犯。这个「被纠正后不重复踩」的特质，比一次完美交付更难得。

### 收个尾

如果你也有个「素材越堆越多但没人整理」的仓库，丢给 Kimi 试试。它也许不能一次写对，但它的下限是「完整、自洽、可运行」，这个下限对整理型任务来说，恰恰是最稀缺的。

一句话：**99 块的 Kimi，干出了你按模板攒一星期才能攒出来的完成度。** 这轮我服。

---

## Hook 装好怎么证明真在拦

> 合并自原帖 `kimi-code-handbook`

前一阵 Kimi Code 会话里工具调用陷入过循环报错：模型拿 `Read` 去读图片，报错，再读，再报错。后来给 CLI 配了一个 PreToolUse hook，从入口把这种调用直接掐掉。

配置写完那天我没敢信。「文件里写着」和「真的拦得住」之间，隔着好几个会翻车的细节。这次把验证过程和顺带揪出的一个博客样式问题一起记下来。

### 这个 hook 在拦什么

规则本身很简单：模型对图片/视频文件调用 `Read` 时，hook 在工具执行前拦截，stderr 返回一句「改用 ReadMediaFile」，进程 exit 2 阻断这次调用。其它文件类型正常放行，stdin 解析失败时 fail-open 不误伤。

脚本本身没什么可说的，四十行不到。真正的坑在配置层。

### 配置里修掉的两个真问题

| 坑 | 错的写法 | 对的写法 | 为什么 |
|---|---|---|---|
| matcher 太宽 | `matcher = "Read"` | `matcher = "^Read$"` | 不锚定的话，任何工具名里含 Read 的都会被误伤 |
| 路径依赖 `~` | `node ~/.kimi-code/hooks/xxx.mjs` | `node C:/Users/.../xxx.mjs` | Windows 下 `~` 展开不可靠，hook 会直接哑火 |

第二个坑尤其阴：配置写错了 hook 不执行，但表面上一切正常——没有报错，只是「没拦」。这也是为什么必须做下面这套验证。

### 三层验证法

| 层 | 做什么 | 能证明什么 | 证明不了什么 |
|---|---|---|---|
| 配置层 | 对照配置历史（`.bak` 文件 diff），确认 hook 块语法、matcher、路径都正确 | 注册意图是对的 | CLI 真的加载了它 |
| 单测层 | 手动给脚本喂 JSON：`.png` 应拦截 exit 2，`.astro` 应放行 exit 0，大写扩展名、坏 JSON 各试一遍 | 脚本逻辑是对的 | 会话里真的接了这根线 |
| 实弹层 | 在真实会话里故意拿 `Read` 读一张图片 | 端到端真拦住了 | — |

实弹层是关键，也是最容易被跳过的一层。这次验证时翻了运行日志，里面只有启动记录，没有任何 hook 执行的痕迹——光看日志既证明不了它在工作，也证明不了它没工作。唯一的硬证据是在会话里故意犯一次规，看拦截信息是不是脚本里写的那句 stderr。

结果是拦住了，返回的就是脚本里那句提示。三层证据凑齐，这事才算闭环。

### 防循环其实有两道闸

hook 只是入口那道。配置里还有一层 `[loop_control]`：

```toml
[loop_control]
max_steps_per_turn = 300
max_attempts_per_step = 2
```

`max_attempts_per_step = 2` 和「同一调用失败两次就停手」的纪律是同一个思路：循环靠重试续命，把重试次数掐死，循环就起不来。一道闸拦错误的工具选择，一道闸拦无底线的重试，两层是互补的。

### 顺带揪出的卡片边框漂移

验证之余还排了一个博客（Astro/Firefly）的卡片边框问题，根因是典型的「两处公式漂移」：

| 位置 | 作用 |
|---|---|
| `src/styles/main.css:286-294` | 全局卡片边框，`.enable-card-border .card-base` |
| `src/styles/main.css:329-336` | 壁纸透明模式下把边框压淡 |
| `src/styles/dynamic.css:931-938` | 动态页又单独覆盖了一套边框颜色公式 |

同一个卡片，全局规则和动态页覆盖用的是两套不同的 `color-mix` 公式，视觉上自然不一致。最小修法二选一：直接删掉动态页那段覆盖回归全局，或者把覆盖里的公式对齐全局。改之前先在 `pnpm dev` 下切壁纸模式肉眼对比，再决定删还是对齐。

### 两个顺手的教训

**剪贴板管理器的截图路径会失效。** 这次两张截图里有一张路径已经不存在——剪贴板工具会清图。收到这类路径先确认文件还在，再决定用哪个工具读，能省一轮无效往返。

**「故意犯错」是验证防护机制最硬的证据。** 防护类配置（hook、拦截规则、权限门禁）静默时不产生任何痕迹，日志里也看不见。想知道它在不在岗，就得在安全范围内真的踩一脚红线。踩中了，才是真的。

之前还记过一次 Kimi CLI 工具调用陷进循环的事，[那篇在这里](/posts/kimi-code-handbook/)，这道 hook 就是防它的入口闸。

---

## 工具失败死循环：掐断重试

> 合并自原帖 `kimi-code-handbook`

用 Kimi Code CLI 做截图验证时，很容易撞上同一出戏：Read 一批 PNG 失败后，界面反复刷 "Read 4 files · failed"，参数纹丝不动，直到你手动 Esc。这不是偶发，换到 Claude Code 挂同一模型也会复现——根子不在宿主兼容，而在**工具失败后的策略**。

相关阅读：[对话与回路：Harness / Loop 笔记](/posts/vibe-coding-tips-index/)。同站还有一篇 Claude → OpenCode / Kimi 迁移笔记（`claude-migration-opencode-kimi`，目前仍是草稿，链接后补）。

### 现象：同一参数的死循环

典型触发是截图验证：

- 要读 `temp\…\*.png` 做视觉核对
- 临时文件生命周期、Windows 路径、权限或同步延迟 → Read 失败
- 模型收到失败后，**不更新「已失败」状态**，继续发完全相同的调用
- 界面连环 failed，直到人打断

同类变体还有：同一批文件反复 grep/sed；auto-compact 后「忘了」失败，又从头循环；长会话里默认循环上限太高，死循环能跑很久。

### 根因：模型策略 + 配置过松

#### 模型侧

对照 GitHub Issues（如 #2557、#2142、#1950、#640）和实操观察：

- 工具失败后，仍常发出**参数完全相同**的下一次调用
- 失败结果没进有效记忆，或被当成「再验证一次」的信号
- 上下文压缩后更容易失忆，重新开跑同一循环

官方 changelog 里有过「重复无效工具调用后停轮」一类修复，但模型侧的重复倾向并未消失。

#### 配置侧

默认循环控制偏宽：

| 项 | 大致默认 | 体感 |
|---|---|---|
| `max_steps_per_turn` | 已抬到约 1000 | 死循环能拖很久 |
| `max_retries_per_step` | 约 3 | 单步还能再撞几次 |

截图 + `temp\` 路径会放大问题：文件可能已不存在、路径/权限失败、图片字节预算踩线后无限重试；Ralph 循环（`--max-ralph-iterations`）若没停条件，会再放大一轮。

### 怎么掐：配置优先，提示词托底

#### 收紧循环控制（优先做）

在 `~/.kimi-code/config.toml`（或项目级配置）写明：

```toml
[loop_control]
max_steps_per_turn = 40          # 建议 30–60，默认 1000 太高
max_retries_per_step = 2         # 建议 1–2
max_ralph_iterations = 0         # 不需要 Ralph 就关掉
```

命令行临时覆盖：

```bash
kimi --max-steps-per-turn 40 --max-retries-per-step 2
```

或环境变量：

```bash
KIMI_LOOP_MAX_STEPS_PER_TURN=40
KIMI_LOOP_MAX_RETRIES_PER_STEP=2
```

改完 `/reload` 或重开会话。

#### 提示词写清「失败即停」

任务描述或 `/goal` 里直接写死：

- 同一工具（尤其 Read 图片 / 同一文件）连续失败超过 2 次：停止重试，报告原因并结束本轮，禁止同参再调
- 验证结束就输出结论，别继续啃已失败的截图或临时文件
- `Do not retry identical tool calls with the same arguments after failure.`

官方也建议用 `/goal` 给多步任务一条清晰 finish line；很多人反馈，加上「失败即停」后循环明显少。

#### 截图 / 临时文件习惯

- 先 `ls` / `dir` 确认存在，再 Read
- 验证图放到稳定路径，别赌 `temp\` 寿命
- 一旦连环 failed：立刻 Esc / Ctrl-C，新开一轮或明确说「这些已失败，跳过」

#### 长会话

- 主动 `/compact` 或开新会话，减轻压缩后遗忘
- CLI 保持较新版本（官方修过无效工具调用无限重试）

### 防循环 checklist

| 场景 | 操作 | 优先级 |
|---|---|---|
| 日常配置 | 收紧 `max_steps_per_turn` / `max_retries_per_step` | 高 |
| 任务提示 | 写入「失败即停」 | 高 |
| 撞上循环 | 立刻 Esc，告诉模型跳过 | 高 |
| 图片验证 | 先确认文件存在再 Read | 中 |
| 临时文件 | 用稳定路径 | 中 |
| 长会话 | `/compact` 或新会话 | 中 |
| 版本 | 升级 CLI 吃官方修复 | 低 |

### 边界

这不是「Kimi 和 Claude 工具不兼容」的单一锅。同一模型挂到别的宿主也会转圈，说明要**模型侧继续改策略 + 用户侧主动拧上限**。步数和重试压下来，再配退出指令与操作习惯，频率会明显下降。

### 出处与边界

| 项 | 说明 |
|---|---|
| 素材 | Knowledge「Kimi-Code-CLI-死循环问题」（仓外留档） |
| 配图 | 素材 `assets/` 当时未随目录落地；封面为本站生成，小节示意图从缺 |
| 非目标 | 不替代官方文档；具体默认值以你本机 CLI 版本为准 |

---

## 官方坐标与补强备注

补强：工具循环要在 agent 层设「同参失败即停」，不要只靠模型自觉；Hook 装上后要用可观测手段证明拦截发生过。

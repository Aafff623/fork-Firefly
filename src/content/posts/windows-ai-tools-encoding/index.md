---
title: 中文 Windows 上跑 AI 编程工具，编码这关怎么过
published: 2026-08-05
updated: 2026-08-05T20:55:00
description: 中文 Windows 跑 Claude Code、Cursor 的编码坑：代码页 936 和工具默认 UTF-8 打架，CC Switch 切模型还会冲掉配置。三层防护把编码钉在工具碰不到的地方。
image: ./cover.jpg
tags: [Windows, UTF-8, GBK, 编码, Claude Code, Git Bash, CC Switch]
category: 指南
collections: [windows-discipline]
draft: false
lang: ''
slug: windows-ai-tools-encoding
pinned: false
comment: true
---

中文 Windows 上跑 Claude Code、Cursor 这类 AI 编程工具，最烦的不是模型笨，是编码。系统默认代码页 936（GBK），工具默认 UTF-8，两边一打架就是终端乱码、写坏文件、git diff 满屏乱码。这篇是我实测后的一套解法，核心是三层防护，外加一个很多方案都没提到的坑：CC Switch 切模型会冲掉配置。

## 根因：代码页 936 vs 工具默认 UTF-8

中文 Windows 的系统区域是简体中文，控制台代码页 936（GBK）。而 Claude Code、Cursor 的读写工具、Python、Node、git 现代工具链，默认或强制 UTF-8。两个阵营碰一起，就两类事故：

- 已有 GBK 文件打开乱码
- 工具按 UTF-8 写入，或按系统默认（GBK）落盘，中文直接坏

「打开就乱码」具体发生在这层：同一串字节，按 GBK 解和按 UTF-8 解得到的是完全不同的字符。举个直观的例子，「编码」俩字 GBK 是 `E0 C2 C2 EB`，UTF-8 是 `E7 BC 96 E7 A0 81`——工具用哪套当真相，另一套读出来就是一堆不认识的字符或替换符 `�`。工具链默认 UTF-8，Windows 系统默认 GBK，真相永远对不上。

根本矛盾是**系统默认假设 vs 工具链假设不一致**。解决方向不是「改工具」，是「让编码统一到 UTF-8，并放在不会被工具搞丢的地方」。

## 为什么 Git Bash 比 PowerShell 稳

如果你在 Windows 上用了 Git Bash（装 Git for Windows 自带），Claude Code 检测到它，会把 bash 工具切到 Git Bash 执行。Git Bash 基于 MSYS2，locale 通常是 `zh_CN.UTF-8`，对 UTF-8 的处理比 PowerShell 5.1 和 CMD（默认 GBK）稳得多，终端输出中文不乱、POSIX 命令语法兼容性好。

PowerShell 5.1 的乱码根源在 Console API：程序往 stdout 写 UTF-8，终端却按 `[Console]::OutputEncoding`（默认跟系统代码页 936 走）显示，中文就被拆成两半。`chcp 65001` 能临时切到 UTF-8，但只管当前进程，换个会话又回到 936，管不长久。Git Bash 不做这套转换——MSYS2 的 locale 天生 UTF-8，stdout 写什么就显示什么，少一层心智负担。

所以第一原则：**优先让 AI 工具走 Git Bash**，而不是 PowerShell。Claude Code 通过 `CLAUDE_CODE_GIT_BASH_PATH` 指定 bash.exe 路径，hooks、bash 工具都会走它。

## 三层防护：把编码钉死在三个不会被搞丢的地方

我的核心结论：**编码变量不能只放一个地方，要放三层，层与层互补，哪一层被意外覆盖都还有兜底。**

### 第一层：进程级 —— Windows 用户环境变量

`PYTHONUTF8=1` 和 `PYTHONIOENCODING=utf-8` 设进 Windows 用户环境变量。这是进程级继承，所有新开的进程（Claude Code、bash 子进程、Python）都能拿到，而且没有工具会去动系统环境变量。

这两个变量分工不同：`PYTHONUTF8=1` 打开 Python 的 UTF-8 模式，管 `open()` 默认编码和字符串读写；`PYTHONIOENCODING=utf-8` 专管 stdin/stdout/stderr 三个流。只设一个会漏掉另一面——比如文件读写对了，但 print 进管道还是按系统编码。

```
setx PYTHONUTF8 "1"
setx PYTHONIOENCODING "utf-8"
```

`setx` 有两个坑：一是**只对之后新开的进程生效**，当前终端不变，得重开一个；二是它把值写进注册表的用户环境，部分工具是启动时读一次环境，改完记得重开 Claude Code 这类长驻进程，别指望热生效。

### 第二层：shell 级 —— .bashrc 固化 locale

Git Bash 的 `LANG=zh_CN.UTF-8` 默认是从系统区域「继承」来的，不是显式配置。一旦系统区域变动或换终端就退化。在 `.bashrc` 里显式固化：

```
export LANG=zh_CN.UTF-8
```

`.bashrc` 是 Bash **交互式会话**读的，Git Bash 登录时经 `.bash_profile` 里一句 `source ~/.bashrc` 带上。注意它管不了非交互脚本（工具直接 `bash -c '...'` 时不读 .bashrc），要兜住那类，靠第一层的环境变量继承就够。改完验证：`echo $LANG` 和 `locale` 都应是 `zh_CN.UTF-8`。

### 第三层：行为级 —— CLAUDE.md 纪律

前两层管环境，管不住 agent 的**行为**。要把「默认 UTF-8 读写、遇 GBK 先确认原编码、禁止无脑改写、禁止 `> nul`、禁止反斜杠路径」写进全局 CLAUDE.md（或项目规则），让每个会话都遵守。

这几条不是空话，每一条背后都有真实事故：`> nul` 在 Git Bash 里不是 cmd 的「丢弃输出」，而是创建一个叫 `nul` 的垃圾文件，删都删不干净；反斜杠路径在 bash 里是转义符，`C:\Users\foo` 会被拆得面目全非。写进规则，是让 agent 一上来就避开这两类手雷。

### git 补充

```
git config --global core.quotepath false
git config --global i18n.commitEncoding utf-8
git config --global i18n.logOutputEncoding utf-8
```

三条各管各的：`core.quotepath false` 让中文文件名在 git status/diff 里正常显示，而不是转成 `\346\226\207` 那种转义；`i18n.commitEncoding utf-8` 声明提交信息按 UTF-8 解释；`i18n.logOutputEncoding` 让 `git log` 输出也走 UTF-8。前一条影响最大，后两条补齐提交信息这一路的显示。

## 最大的坑：CC Switch 切模型会冲掉 settings.json

很多人把编码变量写进 `~/.claude/settings.json` 的 `env` 块，然后一切模型，配置没了，中文乱码又回来了。

原因是：**CC Switch（Claude Code 走三方模型的常用路由工具）的每个 provider 存一份 settings_config，切换时整文件覆写 `~/.claude/settings.json`**。你手写进去的 env 变量，切一次就被 provider 自己的配置顶掉。

这个坑的隐蔽性在于它不报错：settings.json 看起来还是那个文件，只是 env 块被换成了 provider 自带的那份，你写的 `PYTHONUTF8` 悄悄没了。想验证，切一次模型后 `cat ~/.claude/settings.json`，看 env 里还有没有你手写的那行。

所以关键纪律：**编码变量不能放 settings.json，要放上面三层里不被 CC Switch 触碰的地方**——Windows 用户环境变量、.bashrc、CLAUDE.md，CC Switch 一个都不碰。

CC Switch 数据在 `~/.cc-switch/`，provider 的 settings_config 存在它的 db 里（`config.json` / `db` 目录下）。真要动它自己的配置，去那里改，别往 settings.json 塞。

## 实测验证

新会话按顺序跑，都是几秒能出结果的命令：

```
echo $LANG                                        # 应为 zh_CN.UTF-8
python -c "import sys; print(sys.stdout.encoding)"   # 应为 utf-8
python -c "print('中文')" > /tmp/t.txt && cat /tmp/t.txt  # 中文不乱
git config --get core.quotepath                   # 应为 false
```

再加一条硬碰硬的：找个 GBK 编码的老文件让 Claude Code 读一次，确认它先识别原编码再展示，而不是直接按 UTF-8 读成乱码。前七步全过基本就能放心；唯一没法自测的是「切 provider 后复验」——需要手动切一次模型再开新会话。

## 我的判断

按投入产出排序：

- **新项目/可迁移代码**：全面统一 UTF-8，三层防护一次配好，一劳永逸
- **遗留 GBK 项目**：别硬改编码，用编辑器 `files.encoding` + 自动猜测 + 手动重开，或给 Claude Code 配 Pre/PostToolUse hooks 在读写文件时按需转码
- **系统 Beta UTF-8**（区域设置里的「使用 Unicode UTF-8 提供全球语言支持」）：能根治很多问题，但会影响依赖 GBK 的旧软件，别轻易开
- **别指望规则能根治写入问题**：CLAUDE.md/rules 是行为提示，管不住工具底层写文件的编码路径，真正稳的是环境变量那层

最值得带走的一点：**编码问题不是「配置一次就完」，是「要放在不会被工具重写的层」**。谁在覆写你的配置，谁的坑就要绕开谁。

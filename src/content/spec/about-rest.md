## 03.5 · Currently building

- **AgentOS**：企业向 AI coding harness（SDD × Harness Engineering on Claude Code）— Subagents、Hooks、Permission、Headless CI。
- **分布式延时投递服务**：Spring Cloud / 中间件练手，可靠性优先。
- **企业 Dify 定制**：把 Dify 接到真实业务工作流。

## 04 · Competitions

### Lead Cup · vLLM on Hygon DCU

2026 全国大学生计算机系统能力大赛 · 智能计算创新设计赛（先导杯）赛题 1 · Team **翻斗花园**

| 项 | 结果 |
| --- | --- |
| Best run | **87.7839 / 100** · **#26 / 132** · SLA 0 · precision 0 |
| 目标 | 固定国产 DCU、concurrency=1 下抬升长上下文 Qwen 吞吐（TTFT/TPOT P99 SLA） |
| 栈 | vLLM 0.18.1 · Qwen3.5-27B BF16 · Hygon DCU (gfx936) · SCNet |
| 我的焦点 | shared-gate fusion · SwiGLU HIP · GDN launch packing · Gather-FA · LPK prefetch |
| vs baseline | TTFT P99 −61%–87% · TPOT P99 ≈ −35% · throughput +7%–24% |

[提交仓](https://gitlab.eduxiji.net/T2026101109912321/vllm-cscc-leadcup3) · [源码镜像](https://github.com/Aafff623/vllm-cscc-leadcup)

<img class="about-banner" src="https://raw.githubusercontent.com/Aafff623/Aafff623/main/assets/comp-syscap-banner.webp" alt="先导杯横幅" loading="lazy" />

### AI4S · 书生国智科探挑战赛

2026 书生国智科探挑战赛暨飞翔杯 AI Agent/Skills 开发大赛 · Shanghai AI Lab × Biren · Track 5 模型与算子 · Team **翻斗花园**

| 项 | 结果 |
| --- | --- |
| Live board | public NS64 rel-L2 **0.035115** · tag `dualview_r2` · report **v9** · ranking pending |
| Spectral idle | **3.811 / 8.054 / 29.560 ms** @64/128/256 · worst rel ≈ **2.17e-7**（≤1e-4） |
| 问题 | Biren 原生 Spectral Convolution（SUPA / Extension），复用进 ≥4 层 FNO-NS（公开 64×64 NS，1000/128）；须交 Agent/Skills 日志（约 15%） |
| 栈 | Biren106B · SDK 1.11 · `device=supa` · fused suFFT + SUPA dual-corner mul · FNO width32/modes16 · Cursor Agent harness |
| 证据 | Spectral idle 冻结；CPU↔SUPA 链误差低于 1e-4；公开 NS64 Pred/GT；Agent 日志 35+ 段（abort / NO_SIGNAL，禁止静默 promote） |
| vs v8 | 相对 formal v8（0.035302）：公开 L2 约 **+0.53%** 误差下降；Spectral ms 有意保持不变 |

[源码](https://github.com/Aafff623) · [赛事主页](https://ai4scompetition.intern-ai.org.cn/)

<img class="about-banner" src="https://raw.githubusercontent.com/Aafff623/Aafff623/main/assets/comp-ai4s-ketan.webp" alt="书生国智科探挑战赛" loading="lazy" />

## 05 · Classic project

**AgentCFO** — DAO 金库助手（黑客松原型）。帮运营方在 Cobo Agentic Wallet 上准备并审批金库支出，而不是靠表格和黑盒转账。

| 项 | 说明 |
| --- | --- |
| Track | Cobo · Agentic Economy × CAW |
| 角色 | 前端负责人；落地页 + demo 用的运营控制台 |
| 流程 | 贡献记录与预算规则 → 支付计划 → 确定性校验 → 人工审批 → 打款与审计报告 |
| Proof | Sepolia / SETH 两笔（对外支付 + 内部划转） |
| 栈 | Next.js · TypeScript · FastAPI · Cobo CAW |

[Live demo](https://agentcfo-frontend.vercel.app/) · [Repository](https://github.com/San-Y108/agent-cfo)

::github{repo="San-Y108/agent-cfo"}

## 06 · Learning

- **NB 微服务全栈**：跟着 B 站小坏说 Java，把 Spring Cloud Alibaba、中间件与生产向后端练到手。
- **AI 辅助 E2E**：用 MCP 让模型驱动端到端流程，尽早抓住断掉的业务路径。
- **轻 CLI + 重 IDE**：Claude Code / Kimi Code 等做快探与小改；Cursor（浏览器、调试器、项目上下文）扛长维护。
- **范式迁移**：Prompt → Context → Harness → Loop Engineering。人的规则与纪律缩小人机差距，也倒逼更清楚的架构认知。
- **Custom Skills**：自写有时限的 Skills，或借用强公共库（如 Matt Pocock），守住项目边界，走向 Spec-driven Coding。
- **独立发货路径**：App / 小程序 + 海外支付跑通；用信息驱动开发，缺口用 AI 补。
- **Enterprise AI Coding**：SDD（Spec-Kit / OpenSpec）× Harness on Claude Code — Subagents、Hooks、Permission、Headless CI；练在 AgentOS、延时投递与 Dify 定制上。
- **Agent engineering（Python）**：LLM Gateway、Function Calling / Tool Runtime / MCP、带状态机与 checkpoint 的 Agent Loop、沙箱 Codebase Agent、混合检索 + rerank 的 Codebase RAG。
- **Multi-Agent · Eval · 运维**：Supervisor 式子代理与 Skill 生命周期；golden set、LLM-as-Judge（Ragas / DeepEval）、trace & replay、灰度、回滚与成本治理。
- **Agentic AI 产品**：PM → Builder — 4D Method、记忆与主动触达、Skill 打包、多 Agent 协作、评测飞轮与 Agentic UI。

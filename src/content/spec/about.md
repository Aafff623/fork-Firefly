<div class="about-bio">
  <div class="about-bio__copy">
    <p>我是 <strong>threetwoa</strong>（GitHub: <a href="https://github.com/Aafff623">Aafff623</a>）。中北大学软件工程<strong>即将升入三年级</strong>。</p>
    <p>这个夏天主要在做：Java 微服务、Python / Python AI，以及 Harness Engineering 语境下的 AI Coding。没有硬约束的纯 vibe coding 上手快、难养；我更在意架构、系统工作，以及<strong>还能被 review 的代码</strong>——少写一次性的行，多留判断与工作流。</p>
    <p class="about-reach">
      <a href="mailto:laiyif68@gmail.com">Email</a>
      <a href="https://github.com/Aafff623">GitHub</a>
      <a href="/">Blog</a>
      <a href="https://threetwoa-digital-garden.vercel.app/">Digital Garden</a>
      <a href="https://x.com/FanLaiyi26341">X</a>
      <a href="https://space.bilibili.com/549916339">Bilibili</a>
      <a href="https://t.me/threetwoa">Telegram</a>
    </p>
  </div>
  <figure class="about-bio__figure">
    <img
      class="about-bio__photo"
      src="/assets/images/about/hero-knight.webp"
      alt="threetwoa"
      loading="lazy"
      decoding="async"
      width="528"
      height="720"
    />
  </figure>
</div>

## 01 · Now

正在练的三件事：

| 方向 | 在做什么 |
| --- | --- |
| **全链路发货** | 从构建到上线；海外支付与独立开发闭环 |
| **开源折腾** | 挖自己的仓与热点项目；跟 B 站创作者（如 IT咖啡馆）学，clone / 改 / fork / 帮忙维护 |
| **模型评测** | 亲手评国产模型（DeepSeek、GLM）；海外侧主要看 OpenAI、Anthropic、xAI（Gemini 暂时跳过） |

技术之外：骑车 🚲、看公路赛；写博客、打理数字花园、记番剧，留一点不想被时间带走的青春。

## 02 · Agent workflow

> [!TIP] Harness > Prompt
> Coding Agent 擅长探索、调研、重复编辑和第一轮实现。日常主力是 **Cursor / Claude Code / Codex**；省钱栈会用 OpenCode Go 拼车等。轻量 CLI 做快探，重型 IDE（Cursor）扛长活。**约束层比提示词更重要**：scoped task、仓库规则、可复现命令、测试、文档、最终 diff review。设计决策和每一次 merge，都归我。

## 03 · Practice

- **Agent Engineering**：把 AI 工具锻成可复用、可上线的工作流；scoped task、仓库规则、可复现命令、测试与 diff review。
- **Java / Python 业务系统**：服务边界、持久化、缓存、部署与维护；微服务与中间件。
- **系统与推理**：vLLM、调度与吞吐；国产加速卡（Hygon DCU / Biren）上的工程优化。
- **前端与全栈**：React / Vue / UniApp / Next.js / TypeScript / Tailwind；Node 实时与 Prisma 等。

### 技术栈速览

| 层 | 关键词 |
| --- | --- |
| Frontend | React · Vue · UniApp · Next.js · TypeScript · Tailwind |
| Node / 实时 | Node.js · Socket.IO · Prisma · Vitest |
| Java / Spring | Spring Boot · Spring Cloud Alibaba · MyBatis-Plus · Nacos · Gateway · OpenFeign · Sentinel · Seata |
| AI / Agents | Spring AI · LangChain4j · LangGraph4j · RAG · MCP · Harness / Loop Agent · Qwen / DashScope |
| Data / 中间件 | MySQL · Redis · RabbitMQ · Elasticsearch · MinIO · PostgreSQL · Supabase |
| Python | FastAPI · Pydantic · SQLAlchemy · httpx · Celery · pytest · asyncio |
| Systems | vLLM · HIP / ROCm · Triton · Hygon DCU · Biren GPU |
| Web3 | Viem · Wagmi |
| DevOps | Docker · Kubernetes · Harbor · Nginx · Linux · ELK · SkyWalking · Grafana |

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

2026 书生国智科探挑战赛暨飞翔杯 · Shanghai AI Lab × Biren · Team **翻斗花园** · 赛道：模型与算子

面向 Biren GPU 上可复用的 AI4S 算子与科学模型（Intern Discovery / SCP）。交付 Agent 辅助的 PINN / GNN / FNO 类工具链，而不是一次性 notebook。**完赛结项**（2026-07-28）；收尾与主办方跟进中，暂无公开排名。

[赛事主页](https://ai4scompetition.intern-ai.org.cn/)

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

- **AI 辅助 E2E**：用 MCP 让模型驱动端到端流程，尽早抓住断掉的业务路径。
- **轻 CLI + 重 IDE**：Claude Code / Kimi Code 等做快探与小改；Cursor（浏览器、调试器、项目上下文）扛长维护。
- **范式迁移**：Prompt → Context → Harness → Loop Engineering。人的规则与纪律缩小人机差距，也倒逼更清楚的架构认知。
- **Custom Skills**：自写有时限的 Skills，或借用强公共库（如 Matt Pocock），守住项目边界，走向 Spec-driven Coding。
- **独立发货路径**：App / 小程序 + 海外支付跑通；用信息驱动开发，缺口用 AI 补。

## 07 · Stats

<p class="about-stats">
  <img
    src="https://github-readme-stats-sigma-five.vercel.app/api?username=Aafff623&show_icons=true&bg_color=ffffff&title_color=0969da&text_color=1f2328&icon_color=f59e0b&hide=prs,issues&count_private=true&hide_border=false&border_color=d1d9e0&card_width=500"
    alt="GitHub stats"
    loading="lazy"
  />
  <img
    src="https://github-readme-stats-sigma-five.vercel.app/api/top-langs/?username=Aafff623&layout=compact&bg_color=ffffff&title_color=0969da&text_color=1f2328&icon_color=f59e0b&hide=prs,issues&count_private=true&hide_border=false&border_color=d1d9e0&card_width=320"
    alt="Top languages"
    loading="lazy"
  />
</p>

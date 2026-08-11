## 02 · Agent workflow

> [!TIP] Harness > Prompt
> Coding Agent 是一支舰队，不是单一工具。**Grok** 侦察实时热点；**GPT** 深研需求；Go 拼车开 **Claude Code**（DeepSeek v4 Flash + 完整 MiniMax 能力包）；**Kimi Code**（拼车 K3）、中转 **OpenCode**（GPT-5.6）、**Pi / GLM** 走轻量道；**Cursor** 收尾与长维护。复用成熟 playbook，把自定义工作流接到真项目——Matt 的 Skill 流管资产，各 CLI 自带记忆与 slash，`.agent` 配置跨工具同步。**约束层比提示词更重要**：scoped task、仓库规则、可复现命令、测试、文档、最终 diff review。设计决策和每一次 merge，都归我。

<details class="about-stack">
<summary>技术栈速览</summary>

| 层 | 关键词 |
| --- | --- |
| Frontend | React · Vue · UniApp · Next.js · TypeScript · Tailwind |
| Node / 实时 | Node.js · Socket.IO · Prisma · Vitest |
| Java / Spring | Spring Boot · Spring Cloud Alibaba · MyBatis-Plus · Nacos · Gateway · OpenFeign · Sentinel · Seata |
| AI / Agents | Spring AI · LangChain4j · LangGraph4j · RAG · MCP · Harness / Loop Agent · Qwen / DashScope · MiniMax |
| Data / 中间件 | MySQL · Redis · RabbitMQ · Elasticsearch · MinIO · PostgreSQL · Supabase |
| Python | FastAPI · Pydantic · SQLAlchemy · httpx · Celery · pytest · asyncio |
| Systems | vLLM · HIP / ROCm · Triton · Hygon DCU · Biren GPU · SUPA |
| Web3 | Viem · Wagmi |
| DevOps | Docker · Kubernetes · Harbor · Nginx · Linux · ELK · SkyWalking · Grafana |

</details>

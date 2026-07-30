# threetwoa's blog

> code less, architect more

基于 [Firefly](https://github.com/CuteLeaf/Firefly)（Astro 静态博客主题）的个人二次开发。

**线上**：https://fork-firefly.vercel.app  
**作者**：[Aafff623](https://github.com/Aafff623) · threetwoa  
**数字花园**：https://threetwoa-digital-garden.vercel.app

---

## 快速开始

```bash
pnpm install   # 若镜像 404：pnpm install --registry https://registry.npmjs.org
pnpm dev       # http://localhost:4321
pnpm build
```

要求：Node ≥ 22 · pnpm ≥ 9

配置入口：`src/config/`。说明文档：工作区旁路 `Firefly_docs/`。

---

## Agent / 治理

| 文件 | 用途 |
|---|---|
| `AGENTS.md` | Agent 硬约束 |
| `CONTEXT.md` | 领域事实 |
| `LANGUAGES.md` | 共享用词 |
| `.cursor/rules/` | Cursor MDC |

> Phase B 将用 README Polish 补配图 / Preview / Showcase。当前为 init 初稿。

---

## 致谢与许可

主题基于 Firefly / Fuwari，MIT。详见 `LICENSE`。  
上游英文说明保留：`README.en.md`。

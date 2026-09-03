# Example — Getting-Started.md (fork-Firefly)

```markdown
# Getting-Started

## 环境

| 项 | 要求 |
|---|---|
| Node | ≥ 22 |
| 包管理 | pnpm 9（`preinstall` 强制） |
| 克隆 | `git clone https://github.com/Aafff623/fork-Firefly.git` |

若 npmmirror 个别包 404，安装时加：

```bash
pnpm install --registry https://registry.npmjs.org
```

## 常用命令

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 本地站点（默认 http://127.0.0.1:4321/） |
| `pnpm build` | LQIP → Astro → 字体子集 → Pagefind |
| `pnpm check` / `pnpm type-check` | 诊断 |
| `pnpm new-post` / `pnpm new-d` | 新文章 / 动态 |

## 双端口预览（别混）

| 端口 | 用途 | 启动 |
|---|---|---|
| **4321** | 站点本体 | `pnpm dev` |
| **8090** | README / Release 预览壳 | 仓库根 `python -m http.server 8090` |

8090 的 `preview-readme.html` / `preview-release.html` **不是** GitHub Wiki，也不是产品站。

## 改站顺序

1. 先改 `src/config/*.ts`
2. 内容进 `src/content/`
3. 非必要不拆 `Layout.astro` / `MainGridLayout.astro`

下一步：[Configuration-Overview](Configuration-Overview) · [Writing-Posts](Writing-Posts)
```

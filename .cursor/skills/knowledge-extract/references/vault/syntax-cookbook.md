# 语法（站点：github callouts；`!!!` 已关）

## Callout → 只留五类

`NOTE` · `TIP` · `IMPORTANT` · `WARNING` · `CAUTION`

| 源 | 目标 |
|----|------|
| `!!! note/tip/warning/danger` 及 `???` | 上五类（danger→CAUTION；info/abstract→NOTE） |
| `:::tip` / `:::danger` 等 | 同上 |
| Obsidian `[!bug]`/`[!success]` 等 | bug→WARNING；success→TIP；其余就近映射 |
| 折叠标记 `-`/`+` | 去掉，保留类型 |

```markdown
> [!TIP] 标题
> 正文
```

## 其它高频

| 源 | 目标 |
|----|------|
| `\|\|x\|\|` | `:spoiler[x]` |
| `![[a.png]]` | `![a](./images/a.png)`（附件查找见 obsidian-vault） |
| `![[a.png\|750]]` | `![a](./images/a.png)`（默认可丢宽度）；保宽→`public/posts/<slug>/` + 绝对路径 `<img>` |
| 列表项之间的图 | 缩进挂在当前 `li` 下，避免拆断 `ol`/`ul` |
| `::github{repo="o/r"}` | 保留；`:::github` 容器→叶指令 |
| `https://github.com/o/r` | 可升卡片 |
| `…/o/r/issues…` | **保持**普通链接 |
| 并排 TS+Python 等 | `::: code-group labels=[…]`（`:::` 后有空格） |
| `$` / `$$` / mermaid / plantuml / EC `title`/`{n}` | 保留；日志勿乱改 `ansi` |

## MD → MDX（仅需要时）

要 `<Icon>` / JSX / `export` → `index.mdx` +  
`import { Icon } from 'astro-icon/components'`  
集合：`fa7-solid|brands|regular`、`material-symbols`、`simple-icons`、`mdi`、`mingcute`。

# assets/

本目录是 **project-init 媒体约定**，不是 Astro 的 `src/assets`。

| 路径 | 用途 | 何时建 |
|---|---|---|
| `images/readme/` | README 配图：`banner-*.png` · `features.png` · `integrations.png` · `workflow.png` · `architecture.svg` · `tech-stack.svg` · `showcase-*.png`；README 本地预览壳见仓库根 `preview-readme.{html,css,js}`（端口 8090） | 默认 |
| `images/avatar/` · `icon/` | 文档用槽位 | 有图时 |
| `backup/` | 上游 zip 只读备份 | 有才建 |
| `video/` · `ppt/` · `speeches/` | 演示素材 | 有才建 |

禁止新建 `docs/images/` 作为新图库（上游主题已有 `docs/images/` 历史资源，保留不迁）。

官方配置文档在 `docs/official/`（gitignore），不整包拷入 `backup/`。

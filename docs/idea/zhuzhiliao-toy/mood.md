# 竹知了（zhuzhiliao）· 角落互动玩具构想

## 灵感来源

- 仓库：https://github.com/imsai-sh/zhuzhiliao（**竹知了**，传统竹玩具「一转就哇哇叫」的 Web 模拟器，638★）
- 在线试玩：https://zhuzhiliao.imsai.cc
- 技术形态：零依赖单文件 `index.html`（Canvas 2D 绳系质点物理甩动 + Web Audio 真实录音采样循环）+ Cloudflare Worker/Durable Object 实时计数（在线人数 / 全球哇数）
- 交互：按住画圈 → 转速越高叫得越响；支持自动甩 / 手机甩动传感器 / 合成音兜底

## 想要的感觉

- **角落彩蛋**：不打扰主浏览，像在数字花园里捡到的一个小玩具；发现路径半隐半显
- **真实感优先**：真实竹叫采样 + 绳系质点物理，比纯装饰更有「把玩」质感
- **低打扰**：进视口 / 点开才加载与出声；默认静音，须用户主动触发（浏览器音频策略同样要求）
- **与现站关系**：默认**故意冲突**——动效纪律（Hallmark 克制）豁免项，玩具可以放肆动；但色彩仍守壳层中性灰 + 紫点缀

气质关键词：`toy · craft · physical · surprise · 彩蛋`

## 可能落点

- 独立特殊页：`src/pages/spec/toy`（Content Collection `spec`，最省心、不碰布局内核）
- 或角落岛：404 页 / about / 侧栏底部小卡（Svelte island 懒加载，`src/components/`）
- 纯前端版可整进 `public/` 静态托管（去掉 worker 计数）；保留实时计数需 serverless（站已接 Cloudflare / vercel）
- 资产：`public/assets/` 下独立目录；图标 / OG 图仓库内已有现成

## 开放问题

- License 未标注（README 无 license），直接内嵌或重写需先确认
- 是否要实时计数（全球哇数等）——涉及后端，默认砍掉只留本地自嗨？
- 塞哪个犄角旮旯、如何被用户发现（404 / about / 侧栏 / 彩蛋入口）
- 桌面鼠标 vs 移动甩动：交互适配差异需处理
- Canvas 常驻开销 vs 懒加载激活策略

> 2026-08-04：本地 clone 已核过静置挂起音频、触屏锚点、DO 计数边界等，见 [`clone-notes.md`](./clone-notes.md)。

# 竹知了 · 本地 clone 补记（2026-08-04）

> 相对 [`mood.md`](./mood.md) 的外科手术补充；不改主条目结论。  
> 本地源：工作区 `temp/zhuzhiliao/`（origin: imsai-sh/zhuzhiliao）。

## 相对 mood 的新发现

| 可移植点 | 源路径（相对 `temp/zhuzhiliao/`） | Firefly 可能落点 | 风险 |
|---|---|---|---|
| 静置 8s 挂起 `AudioContext`，交互再唤醒 | `index.html`（idle 累计 + `AC.suspend`） | 任何带采样音效的彩蛋岛（含本玩具） | 挂起后需稳妥 resume；iOS `interrupted` 已有源侧处理可参考 |
| 触屏锚点上移，避免拇指挡住蝉 | `index.html`（触屏偏移逻辑） | 角落 Canvas / 拖拽玩具 | 与侧栏滚动、桌宠拖拽抢手势 |
| `devicemotion` 仅安全上下文显示入口 | `index.html` | 移动体感彩蛋（可选） | http 局域网无事件；iOS 需授权 |
| 个人哇数 / uid 存 localStorage，无痕降级 | `index.html`（`zzl_*` 键） | 与公告「已开启」胶囊同类：本机记忆、不强制登录 | 键名冲突；隐私说明 |
| Worker + Durable Object 实时计数（WS 合并广播、限速防刷） | `worker/` | **默认不做**；若要「全球哇数」才开调研 | 后端/费用/防刷；静态博客默认砍掉 |
| SEO：noscript 正文、真 404、OG 实拍图 | `index.html` · `404.html` · `og-image.jpg` | 若做独立 `spec/toy` 页可借鉴 | 特殊页仍应进站内导航/sitemap 策略 |

## 仍成立的约束（复述 mood，防漂移）

- README **无 License 声明** → 内嵌或重写前必须确认授权  
- 默认产品形态：**纯前端、默静音、用户手势后出声**；实时计数可选且偏后  
- 与站内桌宠（`petConfig` / `SpritePet`）互斥空间：角落玩具勿与桌宠同层抢拖拽  

## 结论

主构想仍以 [`mood.md`](./mood.md) 为准；本文件只补「clone 验证过的省电 / 触控 / 后端边界」。落地仍走 PRD，**禁止在灵感阶段改 `src/`**。

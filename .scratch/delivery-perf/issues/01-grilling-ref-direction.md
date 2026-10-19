# 参考站方向取舍：跟框架，还是只抄纪律

Type: grilling
Status: open

## Question

参考站 2x.nz 当前是 **Rolldown + Preact 的 SPA 壳**（每路由预渲染可读回退），而 Firefly 是 Astro SSG 预渲染。实测显示差距的主因是**装饰资产与 CSS/JS 纪律**，不是框架：

- 首页传输 5,137 KB vs 896 KB；解压 10,313 KB vs 3,444 KB
- CSS 解压 ~582 KB vs 84 KB
- 单个宠物 spritesheet 2,538 KB、10 张横幅 ~2,479 KB、11 张氛围图 ~1,602 KB

**要决定的**：本次改造的定位是
(A) 只吸收参考站的「资产纪律 + 内容分仓 + 交付规范」，渲染模式保持 Astro SSG 不动；还是
(B) 真的要把渲染架构往 SPA 壳方向改。

选 (B) 需要说明它如何解决 5.1MB 传输的主因，以及如何补偿被放弃的 island / Swup / 发文流水线。

## Answer

（待决议）

// DynamicTimelineFeed：原 DynamicTimeline.tsx + 星轨机制移植（行 reveal / stagger / 年份吸顶胶囊）。
// timeline-feed：原 timeline.tsx + whileInView 渐显 + Fragment 判别守卫。
// 两个旧文件名被 OneDrive 同步循环回滚（2026-08-29），换名后新路径同步正常。
export { default as DynamicTimeline } from "./DynamicTimelineFeed";
export * from "./timeline-feed";
export type * from "./types";

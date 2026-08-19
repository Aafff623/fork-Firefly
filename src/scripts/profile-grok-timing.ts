/**
 * 侧栏头像 ↔ Grok Bot 时间表。
 * 预览 `.scratch/preview-grok-avatar/timing.js` 必须同数。
 * 宏面 1:4（头像少、Bot 长）。只加长，不改比例。
 */
export const GROK_CAROUSEL_TIMING = {
	face: {
		avatar: [6000, 8000],
		bot: [24000, 32000],
	},
	fadeMs: 700,
	bucket: [12000, 18000],
	variant: [4000, 7000],
	joltVariant: [4000, 5500],
	joltBucket: [12000, 16000],
	shapeEvery: 4,
	leaveMs: 2200,
	greetMs: 4200,
	mottoGapMs: 1000,
	trick: {
		bounce: 1500,
		hop: 1500,
		spin: 2200,
		burst: 900,
	},
} as const;

export type GrokCarouselTiming = typeof GROK_CAROUSEL_TIMING;

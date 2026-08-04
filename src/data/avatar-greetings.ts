/**
 * 侧栏头像点击问候小词库
 * 三类混装：文言礼仪 · 时辰口语文言 · 园主/代码轻文
 */

export type AvatarGreeting = {
	/** ritual | hour | garden */
	kind: "ritual" | "hour" | "garden";
	text: string;
};

export const avatarGreetings: AvatarGreeting[] = [
	// 文言礼仪（周礼 / 书仪感）
	{ kind: "ritual", text: "客至，敢不肃容以迎。" },
	{ kind: "ritual", text: "承蒙过访，不胜欣幸。" },
	{ kind: "ritual", text: "有朋自远方来，不亦乐乎。" },
	{ kind: "ritual", text: "尊驾光临，蓬荜生辉。" },
	{ kind: "ritual", text: "揖让而进，敢请少安。" },
	{ kind: "ritual", text: "闻声知客至，整衣以候。" },
	{ kind: "ritual", text: "礼轻情意重，一语先问安。" },
	{ kind: "ritual", text: "君子之交，淡若清茶。" },

	// 时辰 / 天气口语文言
	{ kind: "hour", text: "良辰已至，且坐片时。" },
	{ kind: "hour", text: "夜深了，茶犹温。" },
	{ kind: "hour", text: "晨光初照，愿君一日清安。" },
	{ kind: "hour", text: "午窗正好，不妨小憩。" },
	{ kind: "hour", text: "雨声滴阶，客来正好听。" },
	{ kind: "hour", text: "暮色渐合，灯下且闲话。" },
	{ kind: "hour", text: "风过竹梢，问候先到。" },
	{ kind: "hour", text: "岁月不催人，客来自有时。" },

	// 园主 / 代码轻文
	{ kind: "garden", text: "少写一点代码，多留一点余白。" },
	{ kind: "garden", text: "花园有客，今日亦宜浇水。" },
	{ kind: "garden", text: "Code less, architect more — 先问安。" },
	{ kind: "garden", text: "枝叶未整，心意先到。" },
	{ kind: "garden", text: "园门半开，欢迎过访。" },
	{ kind: "garden", text: "把 AI 锻成工作流之前，先对你点点头。" },
	{ kind: "garden", text: "数字花园不关门，进来坐坐就好。" },
	{ kind: "garden", text: "余白留给架构，问候留给过客。" },
];

/** 随机取一句；可选避开刚说过的那句 */
export function pickAvatarGreeting(exclude?: string): AvatarGreeting {
	const pool = exclude
		? avatarGreetings.filter((g) => g.text !== exclude)
		: avatarGreetings;
	const list = pool.length ? pool : avatarGreetings;
	return list[Math.floor(Math.random() * list.length)];
}

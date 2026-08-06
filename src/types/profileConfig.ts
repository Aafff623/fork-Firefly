export type AvatarFrameKind = "css" | "svg";

export type AvatarFrameId =
	| "none"
	| "C3-conic-spin"
	| "C2-dual-soft"
	| "C6-metallic"
	| "C5-stars-css"
	| "S3-metallic"
	| "S6-laurel";

export type AvatarFrameOption = {
	id: Exclude<AvatarFrameId, "none">;
	kind: AvatarFrameKind;
	/** CSS class suffix on shell when kind=css，如 af-conic-spin */
	cssClass?: string;
	/** public 路径，kind=svg 时必填 */
	src?: string;
};

export type ProfileAvatarFrameConfig = {
	/** 是否启用头像框功能（关则侧栏永不装饰、设置项可仍隐藏） */
	enabled?: boolean;
	/** 访客未选择时的默认框；默认 S3-metallic */
	defaultId?: AvatarFrameId;
	/** 可选框目录（不含 none；none 由设置面板固定提供） */
	frames?: AvatarFrameOption[];
	/**
	 * @deprecated 旧单一 SVG 路径；保留兼容，优先用 frames + defaultId
	 */
	src?: string;
};

export type ProfileConfig = {
	avatar?: string;
	/** 侧栏头像装饰框；关闭则保持细边圆形头像 */
	avatarFrame?: ProfileAvatarFrameConfig;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
		showName?: boolean;
	}[];
};

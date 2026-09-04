/**
 * /ask 共享类型：来源、命中、思考链步骤、附件。
 * AskChat / AskThinking / AskMarkdown 共用，避免循环 import。
 */

export type AskHit = {
	title: string;
	url: string;
	snippet: string;
	score: number;
	/** YYYY-MM-DD，便于思考链展示 */
	date?: string;
	/** 来源 pill / 列表用图标（同源） */
	icon?: string;
};

/** 回答下方的可溯来源（站内命中 + MaxKB 知识库段落合并去重后） */
export type AskSource = {
	title: string;
	url: string;
	icon?: string;
	snippet?: string;
	date?: string;
};

/** 思考链步骤类别 → 决定图标（AskThinking 内映射） */
export type TraceKind = "parse" | "search" | "read" | "attachment" | "answer";

export type TraceStep = {
	id: string;
	kind: TraceKind;
	label: string;
	/** 纯文本摘要（说明性正文） */
	summary?: string;
	/** 本步产出的站内命中（read 步渐进填充） */
	hits?: AskHit[];
	status: "running" | "done";
};

/** 用户附件：文本注入 prompt；图片仅展示（诚实标注，不假装理解） */
export type AskAttachment = {
	id: string;
	name: string;
	size: number;
	mime: string;
	kind: "text" | "image";
	/** kind=text 时读入的纯文本（发送前截断由 API 层兜底） */
	text?: string;
	/** kind=image 时的本地预览 dataURL */
	dataUrl?: string;
};

/** 发给 /api/ask?action=chat 的附件载荷（已裁剪） */
export type AskAttachmentPayload = {
	name: string;
	kind: "text" | "image";
	text?: string;
};

export const ASK_TEXT_ACCEPT = ".txt,.md,.markdown,.csv,.json,.log";
export const ASK_IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

/** 文本附件读入上限：超过则截断并提示 */
export const ASK_TEXT_MAX_BYTES: number = 200 * 1024;
/** 图片附件预览上限：超过拒绝（避免 dataURL 撑爆内存/请求体） */
export const ASK_IMAGE_MAX_BYTES: number = 2 * 1024 * 1024;

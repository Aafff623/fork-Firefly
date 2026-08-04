/** 从光标前截取触发 token */ // 中文注释：中文/字母数字连续片段

export type QueryTokenSpan = {
	text: string;
	/** 在整段 value 中的起始下标（含） */ // 中文注释
	start: number;
	/** 在整段 value 中的结束下标（不含） */ // 中文注释
	end: number;
};

export function extractQueryToken(
	value: string,
	caret: number,
	minChars: number,
): QueryTokenSpan | null {
	const safeCaret = Math.max(0, Math.min(caret, value.length));
	const before = value.slice(0, safeCaret);
	const match = before.match(/[\u4e00-\u9fffA-Za-z0-9？?！!]{1,16}$/u);
	if (!match) return null;
	const raw = match[0];
	const stripped = raw.replace(/[？?！!]+$/g, "");
	if (stripped.length < minChars) return null;
	const end = safeCaret - (raw.length - stripped.length);
	const start = end - stripped.length;
	return { text: stripped, start, end };
}

import type { MermaidConfig } from "../types/mermaidConfig";

/**
 * Mermaid 图表渲染配置
 *
 * 使用 merman 在构建时将 mermaid 代码块渲染为静态 SVG，
 * 支持浅色/深色双主题，通过 CSS 自动切换。
 *
 * 正文出图约定（见 docs/agents/workflow.md「版式：横版优先」）：
 * 默认 flowchart LR；仅横版过长才允许整图 TB。
 *
 * @see https://github.com/Latias94/merman
 */
export const mermaidConfig: MermaidConfig = {
	/**
	 * 亮色模式主题。
	 * 可选：editor-light、gruvbox-light、ayu-light。
	 */
	lightTheme: "editor-light",

	/**
	 * 暗色模式主题。
	 * 可选：editor-dark、one-dark、gruvbox-dark、ayu-dark。
	 */
	darkTheme: "editor-dark",
};

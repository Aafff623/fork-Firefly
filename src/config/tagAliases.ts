/**
 * 标签同义词/别名表 —— /tags 页搜索匹配用。
 * key = 标签原名（与文章 frontmatter tags 一致），value = 别名数组。
 * 搜索时输入命中「标签名」或「任一别名」即显示；双向子串匹配（大小写不敏感）。
 * 维护：按需追加，别名覆盖中英文 / 缩写 / 近义。
 */
export const tagAliases: Record<string, string[]> = {
	"AI Coding": ["AI", "编程工具", "coding", "AI编程"],
	"Claude Code": ["CC", "Claude"],
	"AI Agent": ["Agent", "智能体", "代理"],
	Agent: ["智能体", "代理"],
	MCP: ["Model Context Protocol", "模型上下文"],
	MiniMax: ["MM", "大模型"],
	Pi: ["pi-coding-agent", "pi agent"],
	"Vibe Coding": ["氛围编程", "vibe"],
	Harness: ["框架", "脚手架", "外壳"],
	extension: ["扩展", "插件"],
	中转: ["relay", "代理", "proxy"],
	羊毛揭秘: ["羊毛", "灰市", "套利"],
	死循环: ["loop", "循环", "doom loop"],
	记忆机制: ["memory", "长期记忆", "记忆"],
	美化配置: ["theme", "主题", "美化"],
	thinking: ["思考", "推理", "reasoning"],
	Provider: ["供应商", "提供商"],
	极客时间: ["课程", "极客"],
	教程索引: ["索引", "目录", "导航"],
	Markdown: ["MD", "md"],
	视觉理解: ["识图", "图像理解"],
	多模态: ["multimodal"],
};

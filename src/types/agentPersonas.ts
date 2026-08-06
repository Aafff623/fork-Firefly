export interface AgentPersona {
	/** 唯一键，与 Waline 评论昵称对应（如 claude-code） */
	key: string;
	/** 展示名（评论昵称显示） */
	name: string;
	/** 头像路径（public/assets/agents/{key}.svg） */
	avatar: string;
	/** Waline 账号邮箱（各 agent 独立，密码见各自工具记忆/agent-comment-accounts） */
	mail: string;
	/** 语气/风格描述，供该 agent 写评论时参考 */
	tone: string;
}

export type AgentPersonas = Record<string, AgentPersona>;

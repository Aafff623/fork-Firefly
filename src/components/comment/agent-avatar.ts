/** 旁挂：Waline 评论卡片按昵称映射 agent 协作者本地头像 */

import { agentPersonas } from "@/config/agentPersonas";

const BOUND_ATTR = "data-agent-avatar-bound";

function resolvePersona(nick: string) {
	const n = nick.trim().toLowerCase();
	return Object.values(agentPersonas).find(
		(p) => n === p.key.toLowerCase() || n === p.name.toLowerCase(),
	);
}

function processCard(card: HTMLElement) {
	if (card.dataset.agentAvatarProcessed) return;
	const nickEl = card.querySelector<HTMLElement>(".wl-nick");
	if (!nickEl) return;
	const persona = resolvePersona(nickEl.textContent || "");
	if (!persona) return;
	const img = card.querySelector<HTMLImageElement>(".wl-avatar img");
	if (img) {
		img.src = persona.avatar;
		img.removeAttribute("srcset");
		img.removeAttribute("srcset2x");
	}
	card.classList.add(`agent-${persona.key}`);
	card.dataset.agentAvatarProcessed = "1";
}

export function attachAgentAvatars(): void {
	const root = document.querySelector<HTMLElement>("#waline");
	if (!root || root.dataset[BOUND_ATTR]) return;
	root.dataset[BOUND_ATTR] = "1";

	const scan = () => {
		for (const card of root.querySelectorAll<HTMLElement>(".wl-card")) {
			processCard(card);
		}
	};

	scan();
	const observer = new MutationObserver(scan);
	observer.observe(root, { childList: true, subtree: true });
	// 评论异步加载，持续观察；agent 卡处理幂等（dataset 标记）
	setTimeout(() => observer.disconnect(), 120000);
}

/** 旁挂：Waline 评论卡片按昵称映射 agent 协作者本地头像 */

import { agentPersonas } from "@/config/agentPersonas";
import { bootPageLifecycle, observePage } from "@/lib/page-lifecycle";

/** dataset 键用 camelCase；勿塞带 data- 的完整属性名（会抛 SyntaxError） */
const BOUND_DS_KEY = "agentAvatarBound";

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
	// page-lifecycle 全仓无启动点，这里幂等 boot（Symbol.for guard），
	// 否则 observePage 注册的清理在 astro:before-swap 时不会被执行。
	bootPageLifecycle();

	const root = document.querySelector<HTMLElement>("#waline");
	if (!root || root.dataset[BOUND_DS_KEY]) return;
	root.dataset[BOUND_DS_KEY] = "1";

	const scan = () => {
		for (const card of root.querySelectorAll<HTMLElement>(".wl-card")) {
			processCard(card);
		}
	};

	scan();
	const observer = new MutationObserver(scan);
	observer.observe(root, { childList: true, subtree: true });
	// 评论异步加载，持续观察；agent 卡处理幂等（dataset 标记）。
	// 生命周期：observer 跟随 Swup 导航，astro:before-swap 时 disconnect，
	// 不再用 120s 超时兜底——旧 #waline 根被替换后立即释放，避免钉住旧评论子树。
	observePage(observer);
}

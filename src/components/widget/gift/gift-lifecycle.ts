/**
 * 惊喜礼盒生命周期：toast / 开盖→全屏信封 / 我已阅读→收卡
 * 单例监听 Swup，防重复绑定
 *
 * DEV（pnpm dev）：不读写 localStorage，刷新/站内跳转后礼盒始终再出现，方便调试。
 * PROD（Vercel 等）：按 opened / seen / gone 三键走一次性惊喜。
 */
import {
	triggerConfettiBurst,
	triggerTsParticlesCelebrate,
} from "@/utils/ambient-fx";

const EXPAND_MS = 1050;
const LEAVE_MS = 720;
/** 包装盒快拆大致完成后再弹出全屏信封 */
const UNPACK_DELAY_MS = 1000;
/** 侧栏礼盒卡高度收合（须与 CSS transition 对齐） */
const CARD_COLLAPSE_MS = 420;

/** Vite 在生产构建时会替换为 false */
const GIFT_PERSIST = !import.meta.env.DEV;

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function lsGet(key: string): string | null {
	if (!GIFT_PERSIST) return null;
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function lsSet(key: string, val: string): void {
	if (!GIFT_PERSIST) return;
	try {
		localStorage.setItem(key, val);
	} catch {
		/* private mode */
	}
}

function storageKeys(giftId: string) {
	return {
		OPENED: `firefly-gift-opened:${giftId}`,
		GONE: `firefly-gift-card-gone:${giftId}`,
		SEEN: `firefly-gift-seen:${giftId}`,
	};
}

function getAnnouncementCard(from?: Element | null): HTMLElement | null {
	const el =
		from?.closest?.("widget-layout.announcement-widget") ||
		document.querySelector("widget-layout.announcement-widget");
	return el instanceof HTMLElement ? el : null;
}

function notifySidebarLayout(): void {
	try {
		document.dispatchEvent(new CustomEvent("firefly:sidebar-layout"));
	} catch {
		/* ignore */
	}
}

function markCardGone(giftId: string): void {
	lsSet(storageKeys(giftId).GONE, "1");
}

function removeAnnouncementCard(card: HTMLElement | null, giftId: string): void {
	if (!card) return;
	markCardGone(giftId);
	card.remove();
	notifySidebarLayout();
}

function fadeOutAnnouncementCard(card: HTMLElement | null, giftId: string): void {
	if (!card || card.dataset.giftFading === "1") return;
	card.dataset.giftFading = "1";
	markCardGone(giftId);

	const collapseMs = prefersReducedMotion() ? 50 : CARD_COLLAPSE_MS;
	const rect = card.getBoundingClientRect();
	const cs = getComputedStyle(card);
	card.style.boxSizing = "border-box";
	card.style.height = `${rect.height}px`;
	card.style.marginTop = cs.marginTop;
	card.style.marginBottom = cs.marginBottom;
	card.style.paddingTop = cs.paddingTop;
	card.style.paddingBottom = cs.paddingBottom;
	card.style.overflow = "hidden";
	void card.offsetHeight;

	card.classList.add("announcement-widget--fading");
	card.style.height = "0px";
	card.style.marginTop = "0px";
	card.style.marginBottom = "0px";
	card.style.paddingTop = "0px";
	card.style.paddingBottom = "0px";
	card.style.opacity = "0";

	let done = false;
	const finish = () => {
		if (done) return;
		done = true;
		card.removeEventListener("transitionend", onEnd);
		if (!card.isConnected) return;
		card.remove();
		notifySidebarLayout();
	};
	const onEnd = (ev: TransitionEvent) => {
		if (ev.target !== card) return;
		if (ev.propertyName !== "height" && ev.propertyName !== "opacity") return;
		finish();
	};
	card.addEventListener("transitionend", onEnd);
	setTimeout(finish, collapseMs + 80);
}

function lockBodyScroll(lock: boolean): void {
	document.body.classList.toggle("gift-envelope-open", lock);
}

function ensureOverlayOnBody(overlay: HTMLElement): void {
	if (overlay.parentElement !== document.body) {
		document.body.appendChild(overlay);
	}
}

function setOverlayOriginFromStage(overlay: HTMLElement, stage: Element): void {
	const sheet = overlay.querySelector(".gift-envelope-overlay__sheet");
	if (!(sheet instanceof HTMLElement)) return;

	const stageRect = stage.getBoundingClientRect();
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const stageCx = stageRect.left + stageRect.width / 2;
	const stageCy = stageRect.top + stageRect.height / 2;
	const ox = stageCx - vw / 2;
	const oy = stageCy - vh / 2;
	const startScale = Math.max(0.12, Math.min(stageRect.width / Math.min(448, vw - 32), 0.28));

	overlay.style.setProperty("--gift-ox", `${ox}px`);
	overlay.style.setProperty("--gift-oy", `${oy}px`);
	overlay.style.setProperty("--gift-os", String(startScale));
}

function closeOverlayImmediate(overlay: HTMLElement): void {
	overlay.classList.remove("is-open", "is-expanded", "is-ready", "is-leaving");
	overlay.hidden = true;
	overlay.setAttribute("aria-hidden", "true");
	overlay.dataset.giftOpening = "0";
	overlay.dataset.giftLeaving = "0";
	lockBodyScroll(false);
}

/** 收卡后卸掉挂在 body 上的 overlay，避免 Swup 双 id */
function disposeOverlay(overlay: HTMLElement | null): void {
	if (!overlay) return;
	closeOverlayImmediate(overlay);
	overlay.remove();
}

function openFullscreenEnvelope(
	root: HTMLElement,
	overlay: HTMLElement,
	giftId: string,
): void {
	if (overlay.dataset.giftOpening === "1" || overlay.classList.contains("is-open")) return;
	overlay.dataset.giftOpening = "1";

	const stage = root.querySelector(".gift-surprise__stage") || root;
	const delay = prefersReducedMotion() ? 0 : UNPACK_DELAY_MS;

	setTimeout(() => {
		ensureOverlayOnBody(overlay);
		setOverlayOriginFromStage(overlay, stage);

		overlay.hidden = false;
		overlay.setAttribute("aria-hidden", "false");
		overlay.classList.add("is-open");
		lockBodyScroll(true);

		const expand = () => {
			overlay.classList.add("is-expanded");
			const readyDelay = prefersReducedMotion() ? 0 : EXPAND_MS;
			setTimeout(() => {
				overlay.classList.add("is-ready");
				overlay.dataset.giftOpening = "0";
				const btn = overlay.querySelector("[data-gift-confirm]");
				if (btn instanceof HTMLButtonElement) btn.focus();
			}, readyDelay);
		};

		if (prefersReducedMotion()) {
			expand();
		} else {
			requestAnimationFrame(() => requestAnimationFrame(expand));
		}
	}, delay);

	void giftId;
}

function confirmAndDismiss(
	overlay: HTMLElement,
	root: HTMLElement,
	giftId: string,
): void {
	if (overlay.dataset.giftLeaving === "1") return;
	overlay.dataset.giftLeaving = "1";

	const keys = storageKeys(giftId);
	lsSet(keys.OPENED, "1");
	lsSet(keys.SEEN, "1");
	root.dataset.giftOpened = "true";
	const badge = root.querySelector(".gift-surprise__opened-badge");
	if (badge instanceof HTMLElement) badge.hidden = false;

	overlay.classList.add("is-leaving");
	overlay.classList.remove("is-ready");

	const leaveMs = prefersReducedMotion() ? 50 : LEAVE_MS;
	setTimeout(() => {
		const card = getAnnouncementCard(root);
		disposeOverlay(overlay);
		// E09：信封收起后再庆祝，避免特效落在侧栏空洞里
		void triggerTsParticlesCelebrate();
		fadeOutAnnouncementCard(card, giftId);
	}, leaveMs);
}

function playGiftToastChime(): void {
	try {
		const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!Ctx) return;
		const ctx = new Ctx();

		const ring = () => {
			const now = ctx.currentTime;
			const master = ctx.createGain();
			master.gain.setValueAtTime(0.0001, now);
			master.gain.exponentialRampToValueAtTime(0.2, now + 0.015);
			master.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
			master.connect(ctx.destination);

			[523.25, 784.99].forEach((freq, i) => {
				const osc = ctx.createOscillator();
				const g = ctx.createGain();
				osc.type = "sine";
				osc.frequency.value = freq;
				const t0 = now + i * 0.11;
				g.gain.setValueAtTime(0.0001, t0);
				g.gain.exponentialRampToValueAtTime(0.24, t0 + 0.018);
				g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.26);
				osc.connect(g);
				g.connect(master);
				osc.start(t0);
				osc.stop(t0 + 0.28);
			});
		};

		let played = false;
		const tryPlay = () => {
			if (played) return;
			const go = () => {
				if (played) return;
				if (!document.getElementById("gift-surprise-toast")) return;
				played = true;
				ring();
				setTimeout(() => ctx.close().catch(() => {}), 700);
			};
			if (ctx.state === "suspended") {
				ctx.resume().then(go).catch(() => {});
			} else {
				go();
			}
		};

		tryPlay();
		const unlock = () => {
			if (!document.getElementById("gift-surprise-toast")) {
				cleanup();
				return;
			}
			tryPlay();
			cleanup();
		};
		const cleanup = () => {
			document.removeEventListener("pointerdown", unlock, true);
			document.removeEventListener("keydown", unlock, true);
		};
		document.addEventListener("pointerdown", unlock, true);
		document.addEventListener("keydown", unlock, true);
		setTimeout(cleanup, 2500);
	} catch {
		/* ignore */
	}
}

function initGiftToast(giftId: string): void {
	if (document.getElementById("gift-surprise-toast")) return;
	const keys = storageKeys(giftId);
	if (lsGet(keys.OPENED) === "1") return;
	if (lsGet(keys.GONE) === "1") return;
	if (lsGet(keys.SEEN) === "1") return;

	const toast = document.createElement("div");
	toast.id = "gift-surprise-toast";
	toast.className = "gift-surprise-toast";
	toast.setAttribute("role", "status");
	toast.innerHTML = `
		<div class="gift-surprise-toast__inner">
			<p class="gift-surprise-toast__title">🎁 新的惊喜已送达</p>
			<p class="gift-surprise-toast__desc">点「去看看」打开左栏礼盒 🎀，随缘拆开。</p>
			<div class="gift-surprise-toast__actions">
				<button type="button" class="gift-surprise-toast__go">去看看</button>
				<button type="button" class="gift-surprise-toast__close">知道了</button>
			</div>
		</div>
	`;
	document.body.appendChild(toast);
	requestAnimationFrame(() => {
		toast.classList.add("is-visible");
		requestAnimationFrame(() => toast.classList.add("is-attention"));
	});

	playGiftToastChime();

	let dismissed = false;
	const dismiss = () => {
		if (dismissed) return;
		dismissed = true;
		clearTimeout(autoHide);
		lsSet(keys.SEEN, "1");
		toast.classList.remove("is-visible");
		setTimeout(() => toast.remove(), 320);
	};

	const autoHide = setTimeout(dismiss, 2000);

	toast.querySelector(".gift-surprise-toast__close")?.addEventListener("click", dismiss);
	toast.querySelector(".gift-surprise-toast__go")?.addEventListener("click", () => {
		lsSet(keys.SEEN, "1");
		const card = getAnnouncementCard(document.querySelector("[data-gift-card-id]"));
		const gift = document.querySelector(".gift-surprise");
		card?.scrollIntoView({ behavior: "smooth", block: "center" });
		card?.classList.add("announcement-widget--pulse");
		gift?.classList.add("gift-surprise--invite");
		setTimeout(() => {
			card?.classList.remove("announcement-widget--pulse");
			gift?.classList.remove("gift-surprise--invite");
		}, 1800);
		dismiss();
	});
}

function bindEscOnce(): void {
	if (document.documentElement.dataset.giftEscBound === "1") return;
	document.documentElement.dataset.giftEscBound = "1";
	document.addEventListener("keydown", (e) => {
		if (e.key !== "Escape") return;
		const overlay = document.getElementById("gift-envelope-overlay");
		if (!(overlay instanceof HTMLElement) || !overlay.classList.contains("is-open")) return;
		if (overlay.classList.contains("is-leaving")) return;
		const giftId = overlay.dataset.giftId;
		const root = document.querySelector(`.gift-surprise[data-gift-id="${giftId}"]`);
		if (!giftId || !(root instanceof HTMLElement)) return;
		e.preventDefault();
		confirmAndDismiss(overlay, root, giftId);
	});
}

function initGiftCardLifecycle(): void {
	const cardEl = document.querySelector("[data-gift-card-id]");
	const giftId = cardEl instanceof HTMLElement ? cardEl.dataset.giftCardId : null;
	if (!giftId) return;

	const keys = storageKeys(giftId);

	if (lsGet(keys.GONE) === "1") {
		const card = getAnnouncementCard(cardEl);
		if (card) {
			card.remove();
			notifySidebarLayout();
		}
		document.querySelectorAll("#gift-envelope-overlay").forEach((n) => n.remove());
		lockBodyScroll(false);
		return;
	}

	const root = document.querySelector(`.gift-surprise[data-gift-id="${giftId}"]`);
	const overlays = Array.from(document.querySelectorAll("#gift-envelope-overlay"));
	if (overlays.length > 1) {
		const keep =
			overlays.find((n) => n.closest("widget-layout.announcement-widget")) ||
			overlays[overlays.length - 1];
		overlays.forEach((n) => {
			if (n !== keep) n.remove();
		});
	}
	const overlay = document.getElementById("gift-envelope-overlay");
	if (!(root instanceof HTMLElement) || !(overlay instanceof HTMLElement)) return;

	if (root.dataset.giftBound === "1") return;
	root.dataset.giftBound = "1";

	const check = root.querySelector(".gift-surprise__check");
	const badge = root.querySelector(".gift-surprise__opened-badge");
	const hit = root.querySelector(".gift-surprise__hit");
	if (!(check instanceof HTMLInputElement) || !(badge instanceof HTMLElement)) return;

	const syncOpenedBadge = () => {
		const opened = lsGet(keys.OPENED) === "1";
		root.dataset.giftOpened = opened ? "true" : "false";
		badge.hidden = !opened;
	};

	check.addEventListener("change", () => {
		if (!check.checked) {
			// 不允许合盖：强制保持打开（全屏阅读中）
			check.checked = true;
			return;
		}
		if (hit instanceof HTMLElement) hit.style.pointerEvents = "none";
		// E08：开盖瞬间 canvas-confetti（与盒边 CSS 碎屑并存）
		void triggerConfettiBurst();
		openFullscreenEnvelope(root, overlay, giftId);
	});

	const confirmBtn = overlay.querySelector("[data-gift-confirm]");
	confirmBtn?.addEventListener("click", () => {
		confirmAndDismiss(overlay, root, giftId);
	});

	syncOpenedBadge();
	bindEscOnce();

	document.querySelectorAll("[data-announcement-dismiss]").forEach((btn) => {
		if (!(btn instanceof HTMLElement)) return;
		if (btn.dataset.dismissBound === "1") return;
		btn.dataset.dismissBound = "1";
		btn.addEventListener("click", () => {
			if (overlay.classList.contains("is-open") || overlay.parentElement === document.body) {
				disposeOverlay(overlay);
			}
			const card = getAnnouncementCard(btn);
			removeAnnouncementCard(card, giftId);
		});
	});
}

export function bootGiftUi(): void {
	initGiftCardLifecycle();
	const cardEl = document.querySelector("[data-gift-card-id]");
	const giftId = cardEl instanceof HTMLElement ? cardEl.dataset.giftCardId : null;
	if (giftId) initGiftToast(giftId);
}

let swupBound = false;

export function installGiftSurprise(): void {
	const run = () => bootGiftUi();
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", run, { once: true });
	} else {
		run();
	}

	if (swupBound) return;
	swupBound = true;
	document.addEventListener("swup:contentReplaced", run);
	document.addEventListener("swup:content:replace", run);
	document.addEventListener("swup:page:view", run);
}

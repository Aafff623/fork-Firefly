/**
 * 首访启动节奏：横幅先占网，停够再加载主栏，最后才加载次要资源。
 * 软导航不再重演这段等待。
 */

export type BootPhase = "banner" | "main" | "secondary";

const PHASE_RANK: Record<BootPhase, number> = {
	banner: 0,
	main: 1,
	secondary: 2,
};

/** 横幅已出、用户还停在顶部时，再留一会儿给壁纸，避免马上抢封面 */
const TOP_HOLD_MS = 2200;
/** 主栏开加载后再隔一会儿才放次要资源 */
const MAIN_GAP_MS = 1600;
const BANNER_WAIT_MS = 8000;
const SCROLL_TOP_PX = 48;

let phase: BootPhase = "banner";
let started = false;
const waiters: Array<{ min: BootPhase; resolve: () => void }> = [];

function emit(next: BootPhase) {
	if (PHASE_RANK[next] <= PHASE_RANK[phase]) return;
	phase = next;
	document.documentElement.dataset.bootPhase = next;
	if (next !== "banner") materialize(next);
	if (next === "secondary") materialize("main");
	window.dispatchEvent(
		new CustomEvent("firefly:boot-phase", { detail: { phase: next } }),
	);
	for (let i = waiters.length - 1; i >= 0; i--) {
		if (PHASE_RANK[phase] >= PHASE_RANK[waiters[i].min]) {
			waiters[i].resolve();
			waiters.splice(i, 1);
		}
	}
}

function visibleBannerImage(): HTMLImageElement | null {
	const imgs = document.querySelectorAll<HTMLImageElement>(
		"#wallpaper-wrapper img",
	);
	for (const img of imgs) {
		if (img.getClientRects().length > 0) return img;
	}
	return imgs[0] ?? null;
}

function bannerReady(): Promise<void> {
	const img = visibleBannerImage();
	if (!img) return Promise.resolve();
	if (img.complete && img.naturalWidth > 0) return Promise.resolve();
	return new Promise((resolve) => {
		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			resolve();
		};
		img.addEventListener("load", finish, { once: true });
		img.addEventListener("error", finish, { once: true });
		window.setTimeout(finish, BANNER_WAIT_MS);
	});
}

function atPageTop(): boolean {
	return (document.documentElement.scrollTop || window.scrollY || 0) < SCROLL_TOP_PX;
}

function waitWhileAtTop(ms: number): Promise<void> {
	if (!atPageTop()) return Promise.resolve();
	return new Promise((resolve) => {
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			window.removeEventListener("scroll", onScroll);
			window.clearTimeout(timer);
			resolve();
		};
		const onScroll = () => {
			if (!atPageTop()) finish();
		};
		const timer = window.setTimeout(finish, ms);
		window.addEventListener("scroll", onScroll, { passive: true });
	});
}

/** 用户已经开始往下看：不必再等横幅读完 */
function waitUntilScrolled(signal: AbortSignal): Promise<void> {
	if (!atPageTop() || signal.aborted) return Promise.resolve();
	return new Promise((resolve) => {
		const finish = () => {
			window.removeEventListener("scroll", onScroll);
			resolve();
		};
		const onScroll = () => {
			if (!atPageTop()) finish();
		};
		signal.addEventListener("abort", finish, { once: true });
		window.addEventListener("scroll", onScroll, { passive: true });
	});
}

export function materialize(target: "main" | "secondary") {
	document.querySelectorAll<HTMLTemplateElement>(`template[data-boot-defer="${target}"]`).forEach((tpl) => {
		const host = tpl.parentElement;
		if (!host) return;
		host.appendChild(tpl.content.cloneNode(true));
		tpl.remove();
	});
	document.querySelectorAll<HTMLImageElement>(`img[data-boot-defer="${target}"]`).forEach((img) => {
		if (img.dataset.bootSrcset) img.srcset = img.dataset.bootSrcset;
		if (img.dataset.bootSizes) img.sizes = img.dataset.bootSizes;
		if (img.dataset.bootSrc) img.src = img.dataset.bootSrc;
		img.removeAttribute("data-boot-defer");
	});
	document.querySelectorAll<HTMLElement>(`[data-boot-bg="${target}"]`).forEach((el) => {
		const src = el.dataset.bootBgSrc;
		if (!src) return;
		el.style.backgroundImage = `url('${src}')`;
		el.removeAttribute("data-boot-bg");
	});
}

export function whenBootPhase(min: BootPhase): Promise<void> {
	if (PHASE_RANK[phase] >= PHASE_RANK[min]) return Promise.resolve();
	return new Promise((resolve) => {
		waiters.push({ min, resolve });
	});
}

export function getBootPhase(): BootPhase {
	return phase;
}

function isHomePath(pathname: string): boolean {
	const baseUrl = import.meta.env.BASE_URL || "/";
	const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
	return pathname === baseUrl || pathname === trimmed || pathname === "/";
}

function isBannerHome(): boolean {
	return (
		isHomePath(window.location.pathname) &&
		!!document.getElementById("wallpaper-wrapper")
	);
}

export function startBootSchedule() {
	if (started) return;
	started = true;

	const marked = document.documentElement.dataset.bootPhase;
	if (marked === "main" || marked === "secondary") {
		phase = marked;
	} else {
		document.documentElement.dataset.bootPhase = "banner";
		phase = "banner";
	}

	document.addEventListener("swup:page:view", () => {
		if (PHASE_RANK[phase] >= PHASE_RANK.main) materialize("main");
		if (phase === "secondary") materialize("secondary");
	});

	void (async () => {
		if (isBannerHome()) {
			const abort = new AbortController();
			await Promise.race([
				bannerReady()
					.then(() => waitWhileAtTop(TOP_HOLD_MS))
					.finally(() => abort.abort()),
				waitUntilScrolled(abort.signal),
			]);
			emit("main");
			await waitWhileAtTop(MAIN_GAP_MS);
			emit("secondary");
			return;
		}
		emit("main");
		emit("secondary");
	})();
}

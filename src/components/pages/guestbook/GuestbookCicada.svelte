<script lang="ts">
/**
 * 留言卡右半 · 竹蝉交互岛（自研 Canvas2D）
 * 按住画圈甩；绳长按卡片尺寸标定，soft-clamp + overflow 防甩出。
 */
import { onDestroy, onMount } from "svelte";
import {
	type CicadaAudio,
	createCicadaAudio,
	disposeCicadaAudio,
	resumeAudio,
	suspendAudio,
	updateCicadaAudio,
} from "./cicada-audio";
import {
	TAU,
	clamp,
	createDriveState,
	followStick,
	integrate,
	sizeForCard,
	softClampTube,
	updateDrive,
	type Tube,
	type Vec2,
} from "./cicada-physics";

let rootEl: HTMLDivElement | undefined = $state();
let canvasEl: HTMLCanvasElement | undefined = $state();

let reducedMotion = $state(false);

let W = 0;
let H = 0;
let DPR = 1;
let ropeLen = 56;
let autoR = 20;

const stick: Vec2 = { x: 0, y: 0 };
const target: Vec2 = { x: 0, y: 0 };
const tube: Tube = { x: 0, y: 0, vx: 0, vy: 0 };
const pointer = { down: false, id: null as number | null, lift: 0 };
const auto = { on: false, rps: 0, phase: 0, cx: 0, cy: 0 };
const drive = createDriveState();

let audio: CicadaAudio | null = null;
let idleTime = 0;
let raf = 0;
let last = 0;
let visible = true;
let ctx: CanvasRenderingContext2D | null = null;
let ro: ResizeObserver | null = null;
let io: IntersectionObserver | null = null;

function setPetBusy(on: boolean) {
	try {
		if (on) document.documentElement.dataset.cicadaActive = "1";
		else delete document.documentElement.dataset.cicadaActive;
	} catch (_) {
		/* ignore */
	}
}

function ensureAudio() {
	if (!audio) audio = createCicadaAudio();
	resumeAudio(audio);
}

function localPoint(clientX: number, clientY: number) {
	const rect = canvasEl!.getBoundingClientRect();
	return {
		x: clientX - rect.left,
		y: clientY - rect.top,
	};
}

function resize() {
	if (!rootEl || !canvasEl || !ctx) return;
	W = Math.max(1, rootEl.clientWidth);
	H = Math.max(1, rootEl.clientHeight);
	DPR = Math.min(window.devicePixelRatio || 1, 2);
	canvasEl.width = Math.floor(W * DPR);
	canvasEl.height = Math.floor(H * DPR);
	canvasEl.style.width = `${W}px`;
	canvasEl.style.height = `${H}px`;
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

	const sized = sizeForCard(W, H);
	ropeLen = sized.ropeLen;
	autoR = sized.autoR;

	stick.x = target.x = W * 0.5;
	stick.y = target.y = H * 0.34;
	tube.x = stick.x;
	tube.y = stick.y + ropeLen * 0.85;
	tube.vx = tube.vy = 0;
	drive.prevTheta = drive.theta = Math.atan2(
		tube.y - stick.y,
		tube.x - stick.x,
	);
	auto.cx = stick.x;
	auto.cy = stick.y;
}

function draw(now: number) {
	if (!ctx) return;
	// 透明底：只清画布，不铺色块（对齐 extract，透出留言卡底）
	ctx.clearRect(0, 0, W, H);

	const active = drive.active;
	const dx = tube.x - stick.x;
	const dy = tube.y - stick.y;
	const d = Math.hypot(dx, dy) || 1e-6;
	const ux = dx / d;
	const uy = dy / d;

	// 红线：松垂紧直（extract 原色）
	ctx.strokeStyle = "rgba(216,74,53,0.92)";
	ctx.lineWidth = 1.6;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(stick.x, stick.y);
	if (d < ropeLen * 0.97) {
		const sag = (ropeLen - d) * 0.55;
		ctx.quadraticCurveTo(
			(stick.x + tube.x) / 2,
			(stick.y + tube.y) / 2 + sag,
			tube.x,
			tube.y,
		);
	} else {
		ctx.lineTo(tube.x, tube.y);
	}
	ctx.stroke();

	// 甩杆：extract 长杆量级（原 88px），卡片内按比例略缩
	const rodScale = clamp(Math.min(W, H) / 200, 0.72, 1);
	const sa = 1.15;
	const sdx = Math.cos(sa);
	const sdy = Math.sin(sa);
	const rod = 88 * rodScale;
	ctx.save();
	ctx.translate(stick.x, stick.y);
	ctx.strokeStyle = "#c9a96a";
	ctx.lineWidth = 5 * rodScale;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(sdx * 8 * rodScale, sdy * 8 * rodScale);
	ctx.lineTo(sdx * rod, sdy * rod);
	ctx.stroke();
	const bead = (bx: number, by: number, r: number) => {
		ctx!.fillStyle = "#c23324";
		ctx!.beginPath();
		ctx!.arc(bx, by, r, 0, TAU);
		ctx!.fill();
	};
	bead(sdx * 14 * rodScale, sdy * 14 * rodScale, 4.6 * rodScale);
	bead(sdx * 4 * rodScale, sdy * 4 * rodScale, 6 * rodScale);
	ctx.restore();

	// 竹蝉筒身：extract 几何与配色
	const bodyScale = 1.35 * rodScale;
	ctx.save();
	ctx.translate(tube.x, tube.y);
	ctx.rotate(Math.atan2(uy, ux) - Math.PI / 2);
	ctx.scale(bodyScale, bodyScale);

	ctx.fillStyle = "#dfd0a2";
	ctx.beginPath();
	ctx.roundRect(-12, 4, 24, 46, 6);
	ctx.fill();

	ctx.fillStyle = "#4c3d24";
	ctx.beginPath();
	ctx.ellipse(0, 49, 11, 4.2, 0, 0, TAU);
	ctx.fill();

	const spread = 0.3 + active * 0.38;
	const flutter = active * Math.sin(now * 46) * 0.22;
	const wing = (side: number) => {
		ctx!.save();
		ctx!.translate(side * 9, 13);
		ctx!.rotate(side * (spread + flutter));
		ctx!.beginPath();
		ctx!.moveTo(0, 0);
		ctx!.bezierCurveTo(side * 13, 9, side * 14, 30, side * 5, 42);
		ctx!.bezierCurveTo(side * -1, 33, side * -4, 12, 0, 0);
		ctx!.fillStyle = "rgba(243,235,211,0.88)";
		ctx!.fill();
		ctx!.restore();
	};
	wing(-1);
	wing(1);

	ctx.fillStyle = "#cf3b2a";
	ctx.beginPath();
	ctx.roundRect(-12.5, 2, 25, 10, 4);
	ctx.fill();

	ctx.fillStyle = "#f6eed8";
	ctx.beginPath();
	ctx.ellipse(0, 3, 10.5, 4.2, 0, 0, TAU);
	ctx.fill();
	if (active > 0.05) {
		ctx.globalAlpha = active * 0.85;
		ctx.shadowColor = "#ffcf8e";
		ctx.shadowBlur = 18 * active;
		ctx.fillStyle = "#ffe9bd";
		ctx.beginPath();
		ctx.ellipse(0, 3, 8.5, 3.4, 0, 0, TAU);
		ctx.fill();
		ctx.shadowBlur = 0;
		ctx.globalAlpha = 1;
	}

	ctx.fillStyle = "#17130c";
	ctx.beginPath();
	ctx.arc(-8.5, 7.5, 2.4, 0, TAU);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(8.5, 7.5, 2.4, 0, TAU);
	ctx.fill();

	ctx.restore();
}

function tick(nowMs: number) {
	const dt = Math.min(0.05, (nowMs - last) / 1000) || 0.016;
	last = nowMs;

	if (visible && !reducedMotion) {
		if (auto.on) {
			auto.rps += (3.2 - auto.rps) * Math.min(1, dt * 1.1);
			auto.phase += auto.rps * TAU * dt;
			target.x = clamp(auto.cx + autoR * Math.cos(auto.phase), 10, W - 10);
			target.y = clamp(auto.cy + autoR * Math.sin(auto.phase), 10, H - 10);
		} else {
			auto.rps *= Math.max(0, 1 - dt * 3);
		}

		followStick(stick, target, dt);
		integrate(tube, stick, dt, { ropeLen });
		softClampTube(tube, W, H, 8);
		updateDrive(drive, stick, tube, ropeLen, dt);
		updateCicadaAudio(audio, {
			active: drive.active,
			rps: drive.rps,
			drive: drive.drive,
			theta: drive.theta,
		});

		if (
			drive.active < 0.02 &&
			drive.rps < 0.15 &&
			!pointer.down &&
			!auto.on
		) {
			idleTime += dt;
			if (idleTime > 8) suspendAudio(audio);
		} else {
			idleTime = 0;
		}

		draw(nowMs / 1000);
	} else if (reducedMotion) {
		// 降动效：轻微呼吸摆，不自动狂甩
		const t = nowMs / 1000;
		tube.x = stick.x + Math.sin(t * 0.8) * 6;
		tube.y = stick.y + ropeLen * 0.8;
		drive.active = 0;
		drive.rps = 0;
		draw(t);
	}

	raf = requestAnimationFrame(tick);
}

function onPointerDown(e: PointerEvent) {
	if (pointer.down || e.button !== 0 || !canvasEl) return;
	e.stopPropagation();
	e.preventDefault();
	pointer.down = true;
	pointer.id = e.pointerId;
	pointer.lift =
		e.pointerType === "touch"
			? Math.min(ropeLen * 0.3, Math.max(0, stick.y - 12))
			: 0;
	setPetBusy(true);
	canvasEl.classList.add("is-holding");
	canvasEl.setPointerCapture(e.pointerId);
	if (auto.on) setAuto(false);
	ensureAudio();
	const p = localPoint(e.clientX, e.clientY);
	target.x = clamp(p.x, 8, W - 8);
	target.y = clamp(Math.max(8, p.y - pointer.lift), 8, H - 8);
}

function onPointerMove(e: PointerEvent) {
	if (!pointer.down || e.pointerId !== pointer.id) return;
	e.stopPropagation();
	const p = localPoint(e.clientX, e.clientY);
	target.x = clamp(p.x, 8, W - 8);
	target.y = clamp(Math.max(8, p.y - pointer.lift), 8, H - 8);
}

function onPointerUp(e: PointerEvent) {
	if (!pointer.down || (e && e.pointerId !== pointer.id)) return;
	pointer.down = false;
	pointer.id = null;
	setPetBusy(false);
	canvasEl?.classList.remove("is-holding");
}

function setAuto(on: boolean) {
	auto.on = on;
	if (on) {
		ensureAudio();
		auto.cx = clamp(stick.x, autoR + 8, W - autoR - 8);
		auto.cy = clamp(stick.y, autoR + 8, H - autoR - 8);
		auto.phase = 0;
	}
}

onMount(() => {
	reducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	ctx = canvasEl?.getContext("2d") ?? null;
	resize();
	last = performance.now();
	raf = requestAnimationFrame(tick);

	ro = new ResizeObserver(() => resize());
	if (rootEl) ro.observe(rootEl);

	io = new IntersectionObserver(
		(entries) => {
			visible = entries.some((en) => en.isIntersecting);
			if (!visible) suspendAudio(audio);
		},
		{ threshold: 0.05 },
	);
	if (rootEl) io.observe(rootEl);

	const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
	const onMq = () => {
		reducedMotion = mq.matches;
		if (reducedMotion) setAuto(false);
	};
	mq.addEventListener?.("change", onMq);

	return () => {
		mq.removeEventListener?.("change", onMq);
	};
});

onDestroy(() => {
	if (typeof cancelAnimationFrame !== "undefined" && raf) {
		cancelAnimationFrame(raf);
	}
	ro?.disconnect();
	io?.disconnect();
	if (typeof document !== "undefined") setPetBusy(false);
	if (typeof window !== "undefined") {
		disposeCicadaAudio(audio);
	}
	audio = null;
});
</script>

<div
  bind:this={rootEl}
  class="guestbook-cicada"
  data-guestbook-cicada
  role="img"
  aria-label="留言卡角落玩具：在右侧按住画圈可甩竹蝉"
>
  <canvas
    bind:this={canvasEl}
    class="guestbook-cicada__canvas"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></canvas>
</div>

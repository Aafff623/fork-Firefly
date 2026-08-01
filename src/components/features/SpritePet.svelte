<script lang="ts">
/**
 * 站内桌宠：cc-haha spritesheet 渲染核的 Svelte 移植（MIT）。
 * 不含 Electron 置顶窗 / Agent 任务面板 / 自定义导入。
 */
import { onDestroy, onMount } from "svelte";
import { type BuiltinPetId, findBuiltinPet } from "@/lib/pets/builtinPets";
import {
	getPetAnimationDurationMs,
	getPetAnimationPlaybackStep,
	getPetAnimationPlaybackTickAtElapsedMs,
	getPetLookFrame,
	PET_ATLAS_V2,
	type PetAnimationState,
	type PetAtlasFrame,
	type PetLookDirection,
	quantizePetLookDirection,
} from "@/lib/pets/petAnimation";
import { url } from "@/utils/url-utils";

interface Props {
	petId: BuiltinPetId;
	position?: "bottom-left" | "bottom-right";
	offsetX?: number;
	offsetY?: number;
	size?: number;
	motionEnabled?: boolean;
	draggable?: boolean;
	clickWave?: boolean;
	lookFollow?: boolean;
	hideOnMobile?: boolean;
	mobileBreakpoint?: number;
	zIndex?: number;
}

let {
	petId,
	position = "bottom-left",
	offsetX = 12,
	offsetY = 12,
	size = 128,
	motionEnabled = true,
	draggable = true,
	clickWave = true,
	lookFollow = true,
	hideOnMobile = true,
	mobileBreakpoint = 768,
	zIndex = 1000,
}: Props = $props();

const STORAGE_KEY = "firefly-sprite-pet-pos";
const DRAG_THRESHOLD_PX = 4;
const LOOK_DEADZONE_PX = 18;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const pet = $derived(findBuiltinPet(petId));
const height = $derived(
	(size * PET_ATLAS_V2.cellHeight) / PET_ATLAS_V2.cellWidth,
);
const atlasUrl = $derived(url(pet.spritesheetPath));

let rootEl: HTMLDivElement | undefined = $state();
let spriteEl: HTMLDivElement | undefined = $state();
let hidden = $state(false);
let prefersReducedMotion = $state(false);
let animationState: PetAnimationState = $state("idle");
let lookDirection: PetLookDirection | null | undefined = $state(undefined);
let posX = $state<number | null>(null);
let posY = $state<number | null>(null);
let dragging = $state(false);

let playbackTimer: ReturnType<typeof setTimeout> | null = null;
let transientTimer: ReturnType<typeof setTimeout> | null = null;
let suppressClick = false;
let dragStart: {
	pointerId: number;
	startClientX: number;
	startClientY: number;
	originLeft: number;
	originTop: number;
	moved: boolean;
} | null = null;

const effectiveMotion = $derived(motionEnabled && !prefersReducedMotion);

function getDadaFrameOffset(frame: PetAtlasFrame): {
	offsetX: number;
	offsetY: number;
} {
	const centerX: Record<number, number[]> = {
		1: [8.5, 6.5, 7, 14, 13.5, 7, 3, -1.5],
		2: [-3.5, 3, 2.5, 3, 5, -2, -4.5, -7.5],
	};
	const baselineY: Record<number, number[]> = {
		1: [2, 3, 3, 0, 3, 0, 0, 0],
		2: [-6, 1, -1, 0, 0, 0, 0, 0],
	};
	return {
		offsetX:
			((centerX[frame.rowIndex]?.[frame.columnIndex] ?? 0) * size) /
			PET_ATLAS_V2.cellWidth,
		offsetY:
			((baselineY[frame.rowIndex]?.[frame.columnIndex] ?? 0) * height) /
			PET_ATLAS_V2.cellHeight,
	};
}

function getFrameOffset(frame: PetAtlasFrame): {
	offsetX: number;
	offsetY: number;
} {
	return pet.id === "dada-code"
		? getDadaFrameOffset(frame)
		: { offsetX: 0, offsetY: 0 };
}

function atlasBackgroundPosition(frame: PetAtlasFrame): string {
	const { offsetX: ox, offsetY: oy } = getFrameOffset(frame);
	return `${-frame.columnIndex * size + ox}px ${-frame.rowIndex * height + oy}px`;
}

function applyFrame(
	frame: PetAtlasFrame,
	motionState: PetAnimationState,
	phase: string,
) {
	if (!spriteEl) return;
	spriteEl.dataset.petMotionState = motionState;
	spriteEl.dataset.petMotionPhase = phase;
	spriteEl.dataset.petRow = String(frame.rowIndex);
	spriteEl.dataset.petColumn = String(frame.columnIndex);
	spriteEl.style.backgroundPosition = atlasBackgroundPosition(frame);
}

function stopPlayback() {
	if (playbackTimer) {
		clearTimeout(playbackTimer);
		playbackTimer = null;
	}
}

function startPlayback(state: PetAnimationState) {
	stopPlayback();
	if (!spriteEl) return;

	if (!effectiveMotion || (state === "idle" && lookDirection !== undefined)) {
		if (state === "idle" && lookDirection !== undefined) {
			const look = getPetLookFrame(lookDirection);
			applyFrame(look, "idle", "gaze");
		} else {
			const step = getPetAnimationPlaybackStep(state, 0);
			applyFrame(step.frame, step.motionState, step.phase);
		}
		return;
	}

	const startedAt = performance.now();
	const tick = () => {
		const next = getPetAnimationPlaybackTickAtElapsedMs(
			state,
			Math.max(0, performance.now() - startedAt),
		);
		applyFrame(next.frame, next.motionState, next.phase);
		playbackTimer = setTimeout(
			tick,
			Math.max(1, Math.ceil(next.remainingDurationMs)),
		);
	};
	tick();
}

function playTransient(state: PetAnimationState) {
	if (transientTimer) clearTimeout(transientTimer);
	animationState = state;
	transientTimer = setTimeout(() => {
		animationState = "idle";
		transientTimer = null;
	}, getPetAnimationDurationMs(state) * 3);
}

function updateHidden() {
	if (!hideOnMobile) {
		hidden = false;
		return;
	}
	hidden = window.innerWidth <= mobileBreakpoint;
}

function loadStoredPosition() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return;
		const parsed = JSON.parse(raw) as { x?: number; y?: number };
		if (
			typeof parsed.x === "number" &&
			typeof parsed.y === "number" &&
			Number.isFinite(parsed.x) &&
			Number.isFinite(parsed.y)
		) {
			posX = parsed.x;
			posY = parsed.y;
		}
	} catch {
		/* ignore */
	}
}

function persistPosition(x: number, y: number) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }));
	} catch {
		/* ignore */
	}
}

function clampToViewport(x: number, y: number): { x: number; y: number } {
	const maxX = Math.max(0, window.innerWidth - size);
	const maxY = Math.max(0, window.innerHeight - height);
	return {
		x: Math.min(maxX, Math.max(0, x)),
		y: Math.min(maxY, Math.max(0, y)),
	};
}

function defaultStyle(): string {
	const side =
		position === "bottom-right"
			? `right:${offsetX}px;left:auto;`
			: `left:${offsetX}px;right:auto;`;
	return `${side}bottom:${offsetY}px;top:auto;`;
}

function positionedStyle(): string {
	if (posX === null || posY === null) return defaultStyle();
	return `left:${posX}px;top:${posY}px;right:auto;bottom:auto;`;
}

function onPointerMoveLook(event: PointerEvent) {
	if (
		!lookFollow ||
		!effectiveMotion ||
		dragging ||
		animationState !== "idle"
	) {
		return;
	}
	if (!rootEl) return;
	const rect = rootEl.getBoundingClientRect();
	const cx = rect.left + rect.width / 2;
	const cy = rect.top + rect.height / 2;
	lookDirection = quantizePetLookDirection(
		event.clientX - cx,
		event.clientY - cy,
		LOOK_DEADZONE_PX,
	);
}

function onPointerLeaveLook() {
	if (dragging) return;
	lookDirection = undefined;
}

function onPointerDown(event: PointerEvent) {
	if (!draggable || event.button !== 0 || !rootEl) return;
	const rect = rootEl.getBoundingClientRect();
	dragStart = {
		pointerId: event.pointerId,
		startClientX: event.clientX,
		startClientY: event.clientY,
		originLeft: rect.left,
		originTop: rect.top,
		moved: false,
	};
	rootEl.setPointerCapture(event.pointerId);
}

function onPointerMoveDrag(event: PointerEvent) {
	if (!dragStart || dragStart.pointerId !== event.pointerId) return;
	const dx = event.clientX - dragStart.startClientX;
	const dy = event.clientY - dragStart.startClientY;
	if (!dragStart.moved) {
		if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
		dragStart.moved = true;
		dragging = true;
		lookDirection = undefined;
	}
	const next = clampToViewport(
		dragStart.originLeft + dx,
		dragStart.originTop + dy,
	);
	posX = next.x;
	posY = next.y;
	animationState = dx >= 0 ? "running-right" : "running-left";
}

function onPointerUp(event: PointerEvent) {
	if (!dragStart || dragStart.pointerId !== event.pointerId) return;
	const wasDrag = dragStart.moved;
	dragStart = null;
	dragging = false;
	if (wasDrag) {
		suppressClick = true;
		queueMicrotask(() => {
			suppressClick = false;
		});
		if (posX !== null && posY !== null) {
			const clamped = clampToViewport(posX, posY);
			posX = clamped.x;
			posY = clamped.y;
			persistPosition(posX, posY);
		}
		animationState = "idle";
	}
}

function onClick() {
	if (suppressClick || !clickWave) return;
	playTransient("waving");
}

$effect(() => {
	void animationState;
	void lookDirection;
	void effectiveMotion;
	void size;
	void height;
	void petId;
	startPlayback(animationState);
});

onMount(() => {
	updateHidden();
	loadStoredPosition();

	const media = window.matchMedia(REDUCED_MOTION_QUERY);
	prefersReducedMotion = media.matches;
	const onMotion = (e: MediaQueryListEvent) => {
		prefersReducedMotion = e.matches;
	};
	media.addEventListener("change", onMotion);

	const onResize = () => {
		updateHidden();
		if (posX !== null && posY !== null) {
			const clamped = clampToViewport(posX, posY);
			posX = clamped.x;
			posY = clamped.y;
		}
	};
	window.addEventListener("resize", onResize);

	return () => {
		media.removeEventListener("change", onMotion);
		window.removeEventListener("resize", onResize);
	};
});

onDestroy(() => {
	stopPlayback();
	if (transientTimer) clearTimeout(transientTimer);
});
</script>

{#if !hidden}
	<div
		bind:this={rootEl}
		class="sprite-pet-root"
		class:is-dragging={dragging}
		style={`z-index:${zIndex};${positionedStyle()}`}
		data-swup-permanent
		onpointermove={onPointerMoveLook}
		onpointerleave={onPointerLeaveLook}
	>
		<button
			type="button"
			class="sprite-pet-hit"
			aria-label={pet.displayName}
			title={pet.displayName}
			onpointerdown={onPointerDown}
			onpointermove={onPointerMoveDrag}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onclick={onClick}
		>
			<div
				class="pet-sprite-stage pet-sprite-stage--atlas"
				style={`width:${size}px;height:${height}px;`}
				data-pet-motion={effectiveMotion ? "enabled" : "disabled"}
				data-pet-motion-state={animationState}
			>
				<div
					bind:this={spriteEl}
					class="pet-sprite"
					role="img"
					aria-label={pet.displayName}
					data-pet-state={animationState}
					data-pet-motion={effectiveMotion ? "enabled" : "disabled"}
					style={`
						width:${size}px;
						height:${height}px;
						background-image:url(${JSON.stringify(atlasUrl)});
						background-repeat:no-repeat;
						background-size:${size * PET_ATLAS_V2.columns}px ${height * PET_ATLAS_V2.rows}px;
					`}
				></div>
			</div>
		</button>
	</div>
{/if}

<style>
	.sprite-pet-root {
		position: fixed;
		pointer-events: auto;
		touch-action: none;
		user-select: none;
	}

	.sprite-pet-hit {
		display: block;
		padding: 0;
		margin: 0;
		border: 0;
		background: transparent;
		cursor: grab;
		appearance: none;
	}

	.sprite-pet-root.is-dragging .sprite-pet-hit {
		cursor: grabbing;
	}

	.sprite-pet-hit:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--primary) 70%, transparent);
		outline-offset: 4px;
		border-radius: 12px;
	}

	.pet-sprite-stage {
		position: relative;
		z-index: 1;
		isolation: isolate;
		overflow: visible;
		transform: scale(1.1);
		transform-origin: 50% 88%;
	}

	.pet-sprite {
		position: relative;
		z-index: 1;
		transform-origin: 50% 88%;
		filter: drop-shadow(0 8px 12px rgba(35, 27, 54, 0.14));
	}

	.pet-sprite[data-pet-motion="enabled"] {
		will-change: background-position;
	}

	:global(html.dark) .pet-sprite {
		filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.35));
	}
</style>

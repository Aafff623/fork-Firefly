/**
 * Spritesheet animation core (Codex / cc-haha atlas layout).
 * Supports Atlas v2 (8×11 + look) and classic 8×9 (no look rows).
 */

import type { PetAtlasVariant } from "@/lib/pets/builtinPets";

export const PET_ATLAS_V2 = {
	spriteVersionNumber: 2,
	columns: 8,
	rows: 11,
	cellWidth: 192,
	cellHeight: 208,
	width: 1536,
	height: 2288,
} as const;

/** Classic Codex 8×9 (no look rows 9–10). Cell size matches v2. */
export const PET_ATLAS_CLASSIC_8X9 = {
	spriteVersionNumber: 1,
	columns: 8,
	rows: 9,
	cellWidth: 192,
	cellHeight: 208,
	width: 1536,
	height: 1872,
} as const;

export type PetAtlas =
	| typeof PET_ATLAS_V2
	| typeof PET_ATLAS_CLASSIC_8X9;

export function getAtlas(variant: PetAtlasVariant): PetAtlas {
	return variant === "classic-8x9" ? PET_ATLAS_CLASSIC_8X9 : PET_ATLAS_V2;
}

export const PET_ANIMATION_STATES = [
	"idle",
	"running-right",
	"running-left",
	"waving",
	"jumping",
	"failed",
	"waiting",
	"running",
	"review",
] as const;

export type PetAnimationState = (typeof PET_ANIMATION_STATES)[number];

export type PetAnimationDefinition = Readonly<{
	rowIndex: number;
	frameDurationsMs: readonly number[];
}>;

export const PET_ANIMATION_DEFINITIONS: {
	readonly [K in PetAnimationState]: PetAnimationDefinition;
} = {
	idle: { rowIndex: 0, frameDurationsMs: [280, 110, 110, 140, 140, 320] },
	"running-right": {
		rowIndex: 1,
		frameDurationsMs: [120, 120, 120, 120, 120, 120, 120, 220],
	},
	"running-left": {
		rowIndex: 2,
		frameDurationsMs: [120, 120, 120, 120, 120, 120, 120, 220],
	},
	waving: { rowIndex: 3, frameDurationsMs: [140, 140, 140, 280] },
	jumping: { rowIndex: 4, frameDurationsMs: [140, 140, 140, 140, 280] },
	failed: {
		rowIndex: 5,
		frameDurationsMs: [140, 140, 140, 140, 140, 140, 140, 240],
	},
	waiting: { rowIndex: 6, frameDurationsMs: [150, 150, 150, 150, 150, 260] },
	running: { rowIndex: 7, frameDurationsMs: [120, 120, 120, 120, 120, 220] },
	review: { rowIndex: 8, frameDurationsMs: [150, 150, 150, 150, 150, 280] },
};

export type PetAtlasFrame = Readonly<{
	rowIndex: number;
	columnIndex: number;
	x: number;
	y: number;
	width: number;
	height: number;
}>;

export type PetAnimationFrame = PetAtlasFrame &
	Readonly<{
		frameIndex: number;
		durationMs: number;
	}>;

export const PET_ACTIVE_BURST_LOOPS = 3;
export const PET_IDLE_DURATION_MULTIPLIER = 6;
export const PET_AMBIENT_IDLE_LOOPS = 2;
export const PET_AMBIENT_GESTURE_LOOPS = 2;

export type PetAnimationPlaybackPhase = "action" | "idle";

export type PetAnimationPlaybackStep = Readonly<{
	frame: PetAnimationFrame;
	phase: PetAnimationPlaybackPhase;
	motionState: PetAnimationState;
	cycleBoundaryAfter: boolean;
}>;

type PetAnimationPlaybackFrame = PetAnimationFrame &
	Readonly<{
		phase: PetAnimationPlaybackPhase;
		motionState: PetAnimationState;
		cycleBoundaryAfter: boolean;
	}>;

export type PetAnimationPlaybackTick = PetAnimationPlaybackStep &
	Readonly<{
		playbackIndex: number;
		remainingDurationMs: number;
	}>;

export function getPetAtlasFrame(
	rowIndex: number,
	columnIndex: number,
	atlas: PetAtlas = PET_ATLAS_V2,
): PetAtlasFrame {
	if (
		!Number.isInteger(rowIndex) ||
		rowIndex < 0 ||
		rowIndex >= atlas.rows
	) {
		throw new RangeError(
			`rowIndex must be between 0 and ${atlas.rows - 1}`,
		);
	}
	if (
		!Number.isInteger(columnIndex) ||
		columnIndex < 0 ||
		columnIndex >= atlas.columns
	) {
		throw new RangeError(
			`columnIndex must be between 0 and ${atlas.columns - 1}`,
		);
	}

	return {
		rowIndex,
		columnIndex,
		x: columnIndex * atlas.cellWidth,
		y: rowIndex * atlas.cellHeight,
		width: atlas.cellWidth,
		height: atlas.cellHeight,
	};
}

export function getPetAnimationFrames(
	state: PetAnimationState,
): readonly PetAnimationFrame[] {
	const definition = PET_ANIMATION_DEFINITIONS[state];

	return definition.frameDurationsMs.map((durationMs, frameIndex) => ({
		frameIndex,
		...getPetAtlasFrame(definition.rowIndex, frameIndex),
		durationMs,
	}));
}

function getRepeatedPetAnimationFrames(
	state: PetAnimationState,
	loops: number,
	phase: PetAnimationPlaybackPhase,
	durationMultiplier = 1,
): readonly PetAnimationPlaybackFrame[] {
	const frames = getPetAnimationFrames(state);
	return Array.from({ length: loops }, () =>
		frames.map((frame) => ({
			...frame,
			durationMs: frame.durationMs * durationMultiplier,
			phase,
			motionState: state,
			cycleBoundaryAfter: frame.frameIndex === frames.length - 1,
		})),
	).flat();
}

const petAnimationPlaybackCache = new Map<
	PetAnimationState,
	readonly PetAnimationPlaybackFrame[]
>();

export function getPetAnimationPlaybackFrames(
	state: PetAnimationState,
): readonly PetAnimationPlaybackFrame[] {
	const cached = petAnimationPlaybackCache.get(state);
	if (cached) return cached;

	const slowIdle = () =>
		getRepeatedPetAnimationFrames(
			"idle",
			1,
			"idle",
			PET_IDLE_DURATION_MULTIPLIER,
		);

	// idle：只偶尔挥手，绝不自动连跳（跳只留给抓取/显式交互）
	// jumping：只播 1 轮，避免机械连跳
	const playback =
		state === "idle"
			? [
					...Array.from({ length: PET_AMBIENT_IDLE_LOOPS }, slowIdle).flat(),
					...getRepeatedPetAnimationFrames("waving", 1, "action"),
					...Array.from(
						{ length: PET_AMBIENT_IDLE_LOOPS + 1 },
						slowIdle,
					).flat(),
				]
			: state === "jumping"
				? [
						...getRepeatedPetAnimationFrames("jumping", 1, "action"),
						...slowIdle(),
					]
				: [
						...getRepeatedPetAnimationFrames(
							state,
							PET_ACTIVE_BURST_LOOPS,
							"action",
						),
						...slowIdle(),
					];

	petAnimationPlaybackCache.set(state, playback);
	return playback;
}

export function getPetAnimationPlaybackLoopStartIndex(
	_state: PetAnimationState,
): number {
	return 0;
}

export function getPetAnimationPlaybackStep(
	state: PetAnimationState,
	playbackIndex: number,
): PetAnimationPlaybackStep {
	if (!Number.isInteger(playbackIndex) || playbackIndex < 0) {
		throw new RangeError("playbackIndex must be a non-negative integer");
	}

	const playback = getPetAnimationPlaybackFrames(state);
	const normalizedIndex = playbackIndex % playback.length;
	const frame = playback[normalizedIndex];
	if (!frame) {
		throw new RangeError("playback frame missing");
	}
	return {
		frame,
		phase: frame.phase,
		motionState: frame.motionState,
		cycleBoundaryAfter: frame.cycleBoundaryAfter,
	};
}

export function getPetAnimationPlaybackTickAtElapsedMs(
	state: PetAnimationState,
	elapsedMs: number,
): PetAnimationPlaybackTick {
	if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
		throw new RangeError("elapsedMs must be a finite non-negative number");
	}

	const playback = getPetAnimationPlaybackFrames(state);
	const loopStartIndex = getPetAnimationPlaybackLoopStartIndex(state);
	const prefixDurationMs = playback
		.slice(0, loopStartIndex)
		.reduce((total, frame) => total + frame.durationMs, 0);
	const loopDurationMs = playback
		.slice(loopStartIndex)
		.reduce((total, frame) => total + frame.durationMs, 0);
	const totalDurationMs = prefixDurationMs + loopDurationMs;
	const effectiveElapsedMs =
		elapsedMs >= totalDurationMs && loopDurationMs > 0
			? prefixDurationMs + ((elapsedMs - prefixDurationMs) % loopDurationMs)
			: elapsedMs;

	let remainingElapsedMs = effectiveElapsedMs;
	for (
		let playbackIndex = 0;
		playbackIndex < playback.length;
		playbackIndex += 1
	) {
		const frame = playback[playbackIndex];
		if (!frame) break;
		if (remainingElapsedMs < frame.durationMs) {
			return {
				...getPetAnimationPlaybackStep(state, playbackIndex),
				playbackIndex,
				remainingDurationMs: frame.durationMs - remainingElapsedMs,
			};
		}
		remainingElapsedMs -= frame.durationMs;
	}

	const playbackIndex = Math.max(0, playback.length - 1);
	const lastFrame = playback[playbackIndex];
	if (!lastFrame) {
		throw new RangeError("playback is empty");
	}
	return {
		...getPetAnimationPlaybackStep(state, playbackIndex),
		playbackIndex,
		remainingDurationMs: lastFrame.durationMs,
	};
}

export function getPetAnimationDurationMs(state: PetAnimationState): number {
	return PET_ANIMATION_DEFINITIONS[state].frameDurationsMs.reduce(
		(total, durationMs) => total + durationMs,
		0,
	);
}

export const PET_LOOK_DIRECTIONS = [
	0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5,
	315, 337.5,
] as const;

export type PetLookDirection = (typeof PET_LOOK_DIRECTIONS)[number];

export const PET_NEUTRAL_LOOK_FRAME: PetAtlasFrame = getPetAtlasFrame(0, 6);

export type PetLookFrame = PetAtlasFrame &
	Readonly<{
		directionDegrees: PetLookDirection | null;
	}>;

export function getPetLookFrame(
	directionDegrees: PetLookDirection | null,
): PetLookFrame {
	if (directionDegrees === null) {
		return {
			directionDegrees,
			...PET_NEUTRAL_LOOK_FRAME,
		};
	}

	const directionIndex = PET_LOOK_DIRECTIONS.indexOf(directionDegrees);
	if (directionIndex < 0) {
		throw new RangeError(
			"directionDegrees must be a supported 22.5-degree step",
		);
	}

	const rowIndex = directionIndex < PET_ATLAS_V2.columns ? 9 : 10;
	const columnIndex = directionIndex % PET_ATLAS_V2.columns;

	return {
		directionDegrees,
		...getPetAtlasFrame(rowIndex, columnIndex),
	};
}

export function quantizePetLookDirection(
	deltaX: number,
	deltaY: number,
	deadzone = 0,
): PetLookDirection | null {
	if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) {
		throw new RangeError("look vector must contain finite numbers");
	}
	if (!Number.isFinite(deadzone) || deadzone < 0) {
		throw new RangeError("deadzone must be a finite non-negative number");
	}

	const distance = Math.hypot(deltaX, deltaY);
	if (distance === 0 || distance <= deadzone) return null;

	const clockwiseDegrees = (Math.atan2(deltaX, -deltaY) * 180) / Math.PI;
	const normalizedDegrees = (clockwiseDegrees + 360) % 360;
	const directionIndex =
		Math.round(normalizedDegrees / 22.5) % PET_LOOK_DIRECTIONS.length;

	return PET_LOOK_DIRECTIONS[directionIndex] ?? PET_LOOK_DIRECTIONS[0];
}

export const PET_TRANSIENT_ANIMATIONS: {
	readonly interaction: "waving";
	readonly "drag-left": "running-left";
	readonly "drag-right": "running-right";
} = {
	interaction: "waving",
	"drag-left": "running-left",
	"drag-right": "running-right",
};

/**
 * 桌宠动画器：帧时钟、动作优先级与静止视线都收在这里。
 * 时钟 / rAF / timeout 全部注入，node 里可用假时钟测试；帧表仍来自 petAnimation。
 */

import {
	getPetAnimationDurationMs,
	getPetAnimationPlaybackStep,
	getPetAnimationPlaybackTickAtElapsedMs,
	getPetLookFrame,
	type PetAnimationPlaybackPhase,
	type PetAnimationState,
	type PetAtlasFrame,
	type PetLookDirection,
} from "./petAnimation";
import { canPlayByPriority, type PetScenarioPriority } from "./petScenarios";

/** onFrame 的 phase：playback 的 action / idle，外加静止视线帧。 */
export type PetAnimatorPhase = PetAnimationPlaybackPhase | "gaze";

export type PetAnimatorFrame = Readonly<{
	frame: PetAtlasFrame;
	phase: PetAnimatorPhase;
}>;

export type PetAnimatorTimerHandle = number | ReturnType<typeof setTimeout>;

/**
 * 时钟与节奏全部注入。reducedMotion / pace 支持 getter，
 * 方便组件在系统偏好或换宠后不重建 animator。
 */
export type PetAnimatorDeps = Readonly<{
	now: () => number;
	raf: (callback: () => void) => number;
	cancelRaf: (handle: number) => void;
	timeout: (callback: () => void, delayMs: number) => PetAnimatorTimerHandle;
	clearTimeout: (handle: PetAnimatorTimerHandle) => void;
	reducedMotion: boolean | (() => boolean);
	/** 只拖慢 idle 播放；动作计时保持真实时间。 */
	pace: number | (() => number);
	onFrame: (signal: PetAnimatorFrame) => void;
	/** 动作播完回 idle 时触发；idle 自身循环不触发。 */
	onIdle?: () => void;
}>;

export type PetAnimator = Readonly<{
	/**
	 * 播一次动作：loops 轮后自动回 idle 并触发 onIdle。
	 * idle 本身持续循环（loops 只在参数校验时用到）。
	 * 返回 false 表示被更高优先级、暂停或销毁状态拒绝。
	 */
	play: (
		state: PetAnimationState,
		loops: number,
		priority: PetScenarioPriority,
	) => boolean;
	/** 进入静止视线（null = 看正前方）；动作播放中忽略。 */
	setGaze: (direction: PetLookDirection | null) => void;
	pause: () => void;
	resume: () => void;
	dispose: () => void;
}>;

type IdlePlayback = {
	kind: "idle";
	/** 当前段开始之前已经过的播放时间（ms）。 */
	elapsedMs: number;
	/** 本段 pace 快照，避免设置变化导致跳帧。 */
	pace: number;
	segmentStartedAt: number;
};

type ActionPlayback = {
	kind: "action";
	state: PetAnimationState;
	priority: PetScenarioPriority;
	totalMs: number;
	elapsedMs: number;
	segmentStartedAt: number;
};

type Playback = IdlePlayback | ActionPlayback;

function readPaceSetting(value: number | (() => number)): number {
	const resolved = typeof value === "function" ? value() : value;
	return Number.isFinite(resolved) && resolved > 0 ? resolved : 1;
}

function readReducedMotionSetting(value: boolean | (() => boolean)): boolean {
	return typeof value === "function" ? value() : value;
}

export function createPetAnimator(deps: PetAnimatorDeps): PetAnimator {
	let disposed = false;
	let paused = false;
	let playback: Playback | null = null;
	/** undefined = 没有视线；null = 看正前方（仍是视线模式）。 */
	let gaze: PetLookDirection | null | undefined;
	let rafHandle: number | null = null;
	let actionTimer: PetAnimatorTimerHandle | null = null;
	let actionRemainingMs = 0;
	let lastFrameKey = "";

	function isReducedMotion(): boolean {
		return readReducedMotionSetting(deps.reducedMotion);
	}

	function stopFrameClock(): void {
		if (rafHandle === null) return;
		deps.cancelRaf(rafHandle);
		rafHandle = null;
	}

	function stopActionTimer(): void {
		if (actionTimer === null) return;
		deps.clearTimeout(actionTimer);
		actionTimer = null;
	}

	function emit(frame: PetAtlasFrame, phase: PetAnimatorPhase): void {
		if (disposed) return;
		const key = `${frame.rowIndex}:${frame.columnIndex}:${phase}`;
		if (key === lastFrameKey) return;
		lastFrameKey = key;
		deps.onFrame({ frame, phase });
	}

	function paintFirstFrame(state: PetAnimationState): void {
		const step = getPetAnimationPlaybackStep(state, 0);
		emit(step.frame, step.phase);
	}

	function paintAt(state: PetAnimationState, elapsedMs: number): void {
		const tick = getPetAnimationPlaybackTickAtElapsedMs(
			state,
			Math.max(0, elapsedMs),
		);
		emit(tick.frame, tick.phase);
	}

	function activeElapsedMs(nowMs: number): number {
		if (!playback) return 0;
		const delta = paused ? 0 : Math.max(0, nowMs - playback.segmentStartedAt);
		if (playback.kind === "action") {
			return playback.elapsedMs + delta;
		}
		return playback.elapsedMs + delta / playback.pace;
	}

	function scheduleFrame(): void {
		if (disposed || paused || gaze !== undefined) return;
		if (isReducedMotion()) return;
		if (rafHandle !== null) return;
		rafHandle = deps.raf(onFrameTick);
	}

	function onFrameTick(): void {
		rafHandle = null;
		if (disposed || paused || gaze !== undefined) return;
		if (!playback) return;
		const elapsedMs = activeElapsedMs(deps.now());
		paintAt(playback.kind === "idle" ? "idle" : playback.state, elapsedMs);
		scheduleFrame();
	}

	function enterIdle(at: number): void {
		playback = {
			kind: "idle",
			elapsedMs: 0,
			pace: readPaceSetting(deps.pace),
			segmentStartedAt: at,
		};
		actionRemainingMs = 0;
		paintFirstFrame("idle");
		scheduleFrame();
	}

	function onActionTimeout(): void {
		actionTimer = null;
		if (disposed || paused) return;
		if (playback?.kind !== "action") return;
		enterIdle(deps.now());
		deps.onIdle?.();
	}

	function play(
		state: PetAnimationState,
		loops: number,
		priority: PetScenarioPriority,
	): boolean {
		if (disposed || paused) return false;
		if (!Number.isFinite(loops) || loops <= 0) {
			throw new RangeError("loops must be a finite positive number");
		}

		// reduced-motion 只画首帧：不保留动作状态、不排时钟。
		if (isReducedMotion()) {
			gaze = undefined;
			playback = null;
			actionRemainingMs = 0;
			stopFrameClock();
			stopActionTimer();
			paintFirstFrame(state);
			return true;
		}

		const activePriority =
			playback?.kind === "action" ? playback.priority : null;
		if (!canPlayByPriority(activePriority, priority)) return false;

		const hadGaze = gaze !== undefined;
		gaze = undefined;
		stopActionTimer();
		actionRemainingMs = 0;

		const nowMs = deps.now();
		if (state === "idle") {
			// 已在 idle 循环：保持原进度，不重置帧时钟。
			if (playback?.kind === "idle" && !hadGaze) {
				scheduleFrame();
				return true;
			}
			playback = {
				kind: "idle",
				elapsedMs: 0,
				pace: readPaceSetting(deps.pace),
				segmentStartedAt: nowMs,
			};
			paintFirstFrame("idle");
			scheduleFrame();
			return true;
		}

		const totalMs = getPetAnimationDurationMs(state) * loops;
		playback = {
			kind: "action",
			state,
			priority,
			totalMs,
			elapsedMs: 0,
			segmentStartedAt: nowMs,
		};
		actionRemainingMs = totalMs;
		// 先排定时器再画首帧：onFrame 里若同步 pause / dispose，清理逻辑能看见它。
		actionTimer = deps.timeout(onActionTimeout, totalMs);
		paintFirstFrame(state);
		scheduleFrame();
		return true;
	}

	function setGaze(direction: PetLookDirection | null): void {
		if (disposed || paused) return;
		if (playback?.kind === "action") return;
		stopFrameClock();
		gaze = direction;
		emit(getPetLookFrame(direction), "gaze");
	}

	function pause(): void {
		if (disposed || paused) return;
		paused = true;
		const nowMs = deps.now();

		if (playback) {
			const delta = Math.max(0, nowMs - playback.segmentStartedAt);
			if (playback.kind === "action") {
				playback.elapsedMs += delta;
				actionRemainingMs = Math.max(0, playback.totalMs - playback.elapsedMs);
			} else {
				playback.elapsedMs += delta / playback.pace;
			}
			playback.segmentStartedAt = nowMs;
		}

		stopFrameClock();
		stopActionTimer();
	}

	function resume(): void {
		if (disposed || !paused) return;
		paused = false;
		const nowMs = deps.now();
		if (playback) playback.segmentStartedAt = nowMs;

		if (playback?.kind === "action") {
			actionTimer = deps.timeout(onActionTimeout, actionRemainingMs);
		}
		if (gaze === undefined) scheduleFrame();
	}

	function dispose(): void {
		if (disposed) return;
		disposed = true;
		paused = false;
		playback = null;
		gaze = undefined;
		actionRemainingMs = 0;
		stopFrameClock();
		stopActionTimer();
		lastFrameKey = "";
	}

	return {
		play,
		setGaze,
		pause,
		resume,
		dispose,
	};
}

import assert from "node:assert/strict";
import {
	createPetAnimator,
	type PetAnimator,
	type PetAnimatorFrame,
} from "../src/lib/pets/petAnimator";

/*
 * petAnimator 的行为断言。
 * 只穿过模块接口：假时钟 + 假 rAF / timeout，不碰 DOM。
 * 覆盖：优先级抢占、dispose 后零调度、reduced-motion 只画首帧、pause 冻结与 resume 续播。
 */

type Harness = Readonly<{
	animator: PetAnimator;
	frames: PetAnimatorFrame[];
	idleCalls: () => number;
	rafCount: () => number;
	timerCount: () => number;
	advance: (ms: number) => void;
	runNextFrame: () => void;
	runDueTimers: () => void;
}>;

function createHarness(
	options: { reducedMotion?: boolean; pace?: number } = {},
): Harness {
	let nowMs = 0;
	let nextRafId = 1;
	let nextTimerId = 1;
	const rafQueue = new Map<number, () => void>();
	const timerQueue = new Map<number, { at: number; callback: () => void }>();
	const frames: PetAnimatorFrame[] = [];
	let idleCalls = 0;

	const animator = createPetAnimator({
		now: () => nowMs,
		raf: (callback) => {
			const id = nextRafId;
			nextRafId += 1;
			rafQueue.set(id, callback);
			return id;
		},
		cancelRaf: (handle) => {
			rafQueue.delete(handle);
		},
		timeout: (callback, delayMs) => {
			const id = nextTimerId;
			nextTimerId += 1;
			timerQueue.set(id, { at: nowMs + delayMs, callback });
			return id;
		},
		clearTimeout: (handle) => {
			timerQueue.delete(handle as number);
		},
		reducedMotion: options.reducedMotion ?? false,
		pace: options.pace ?? 1,
		onFrame: (signal) => {
			frames.push(signal);
		},
		onIdle: () => {
			idleCalls += 1;
		},
	});

	return {
		animator,
		frames,
		idleCalls: () => idleCalls,
		rafCount: () => rafQueue.size,
		timerCount: () => timerQueue.size,
		advance: (ms) => {
			nowMs += ms;
		},
		runNextFrame: () => {
			const pending = [...rafQueue.values()];
			rafQueue.clear();
			for (const callback of pending) callback();
		},
		runDueTimers: () => {
			for (;;) {
				const due = [...timerQueue.entries()]
					.filter(([, timer]) => timer.at <= nowMs)
					.sort((a, b) => a[1].at - b[1].at)[0];
				if (!due) return;
				timerQueue.delete(due[0]);
				due[1].callback();
			}
		},
	};
}

function lastFrame(harness: Harness): PetAnimatorFrame | undefined {
	return harness.frames[harness.frames.length - 1];
}

/** 优先级：高抢占低、低被拒、同档可抢占；动作结束回 idle 并通知一次。 */
{
	const harness = createHarness();
	const { animator, frames } = harness;

	assert.equal(animator.play("jumping", 1, "ui"), true, "ui action accepted");
	assert.deepEqual(
		[lastFrame(harness)?.frame.rowIndex, lastFrame(harness)?.phase],
		[4, "action"],
		"jumping paints its first frame immediately",
	);

	assert.equal(
		animator.play("waving", 1, "ambient"),
		false,
		"lower priority is rejected while ui action runs",
	);
	assert.equal(frames.length, 1, "rejected play does not paint");

	assert.equal(
		animator.play("waving", 1, "ui"),
		true,
		"equal priority preempts the running action",
	);
	assert.equal(
		lastFrame(harness)?.frame.rowIndex,
		3,
		"preemption paints the new action at once",
	);

	assert.equal(
		animator.play("failed", 2, "hard"),
		true,
		"higher priority preempts ui",
	);
	assert.equal(lastFrame(harness)?.frame.rowIndex, 5);

	assert.equal(
		animator.play("idle", 1, "ambient"),
		false,
		"idle cannot interrupt a running action",
	);
	assert.equal(harness.idleCalls(), 0);

	// failed 一轮 1220ms；两轮后回 idle。
	harness.advance(1220 * 2);
	harness.runDueTimers();
	assert.equal(harness.idleCalls(), 1, "action completion notifies idle once");
	assert.equal(lastFrame(harness)?.phase, "idle", "completion paints idle");
	assert.equal(harness.rafCount(), 1, "idle keeps one frame clock running");

	assert.equal(
		animator.play("waving", 1, "ambient"),
		true,
		"ambient is accepted once idle again",
	);
	harness.advance(700);
	harness.runDueTimers();
	assert.equal(harness.idleCalls(), 2, "second completed action notifies idle");
}

/** dispose：清掉 rAF 与 timeout，之后零调度、零帧、零 idle 通知。 */
{
	const harness = createHarness();
	const { animator } = harness;

	assert.equal(animator.play("running", 2, "route"), true);
	assert.equal(harness.rafCount(), 1, "action schedules a frame clock");
	assert.equal(harness.timerCount(), 1, "action schedules a completion timer");

	harness.advance(200);
	harness.runNextFrame();
	const framesBeforeDispose = harness.frames.length;
	assert.ok(framesBeforeDispose >= 2, "frame clock advances before dispose");

	animator.dispose();
	assert.equal(harness.rafCount(), 0, "dispose cancels the frame clock");
	assert.equal(harness.timerCount(), 0, "dispose clears the action timer");

	harness.advance(10_000);
	harness.runDueTimers();
	harness.runNextFrame();
	assert.equal(
		harness.frames.length,
		framesBeforeDispose,
		"no frames after dispose",
	);
	assert.equal(harness.idleCalls(), 0, "dispose never reports idle");

	assert.equal(animator.play("idle", 1, "ambient"), false, "play is dead");
	animator.setGaze(90);
	assert.equal(harness.frames.length, framesBeforeDispose, "gaze is dead");
	animator.pause();
	animator.resume();
	animator.dispose();
	assert.equal(harness.rafCount(), 0, "dispose stays idempotent");
	assert.equal(harness.timerCount(), 0);
}

/** reduced-motion：每次 play 只画首帧，不排 rAF，不排 action timeout。 */
{
	const harness = createHarness({ reducedMotion: true });
	const { animator } = harness;

	assert.equal(animator.play("idle", 1, "ambient"), true);
	assert.equal(harness.frames.length, 1, "idle paints exactly one frame");
	assert.equal(lastFrame(harness)?.phase, "idle");
	assert.equal(harness.rafCount(), 0, "reduced motion schedules no rAF");
	assert.equal(harness.timerCount(), 0, "reduced motion schedules no timeout");

	harness.advance(5000);
	harness.runNextFrame();
	harness.runDueTimers();
	assert.equal(harness.frames.length, 1, "clock advances nothing");

	assert.equal(animator.play("jumping", 1, "ui"), true);
	assert.equal(harness.frames.length, 2, "action paints once");
	assert.deepEqual(
		[lastFrame(harness)?.frame.rowIndex, lastFrame(harness)?.phase],
		[4, "action"],
	);
	assert.equal(harness.rafCount(), 0);
	assert.equal(harness.timerCount(), 0);
	assert.equal(harness.idleCalls(), 0, "static action never reports idle");

	animator.setGaze(0);
	assert.equal(lastFrame(harness)?.phase, "gaze", "gaze is still paint-only");
	assert.equal(harness.rafCount(), 0);
}

/** pause / resume：暂停期间不推进、不超时；恢复后从暂停处继续。 */
{
	const harness = createHarness();
	const { animator } = harness;

	assert.equal(animator.play("jumping", 1, "ui"), true);
	harness.advance(300);
	harness.runNextFrame();
	assert.equal(
		lastFrame(harness)?.frame.columnIndex,
		2,
		"300ms into jumping is frame 2 (140ms each)",
	);

	animator.pause();
	assert.equal(harness.rafCount(), 0, "pause stops the frame clock");
	assert.equal(harness.timerCount(), 0, "pause holds the completion timer");
	const framesAtPause = harness.frames.length;

	harness.advance(5000);
	harness.runNextFrame();
	harness.runDueTimers();
	assert.equal(
		harness.frames.length,
		framesAtPause,
		"paused clock does not advance frames",
	);
	assert.equal(harness.idleCalls(), 0, "paused action does not complete");
	assert.equal(
		animator.play("waving", 1, "hard"),
		false,
		"play is rejected while paused",
	);

	animator.resume();
	assert.equal(harness.frames.length, framesAtPause, "resume does not repaint");
	assert.equal(harness.rafCount(), 1, "resume restarts the frame clock");
	assert.equal(harness.timerCount(), 1, "resume re-arms the completion timer");

	harness.advance(300);
	harness.runNextFrame();
	assert.equal(
		lastFrame(harness)?.frame.columnIndex,
		4,
		"resume continues from 300ms, reaching 600ms",
	);

	harness.advance(240);
	harness.runDueTimers();
	assert.equal(harness.idleCalls(), 1, "remaining 540ms completes the action");
	assert.equal(lastFrame(harness)?.phase, "idle");
}

/** 视线：idle 时可静止画 look 帧；action 中忽略；play("idle") 退出视线。 */
{
	const harness = createHarness();
	const { animator } = harness;

	assert.equal(animator.play("idle", 1, "ambient"), true);
	animator.setGaze(90);
	assert.equal(lastFrame(harness)?.phase, "gaze", "gaze paints a static frame");
	assert.deepEqual(
		[lastFrame(harness)?.frame.rowIndex, lastFrame(harness)?.frame.columnIndex],
		[9, 4],
		"90 degrees maps to the look row",
	);
	assert.equal(harness.rafCount(), 0, "gaze stops the idle frame clock");

	harness.advance(1000);
	harness.runNextFrame();
	assert.equal(lastFrame(harness)?.phase, "gaze", "gaze does not advance");

	assert.equal(animator.play("idle", 1, "ambient"), true);
	assert.equal(lastFrame(harness)?.phase, "idle", "idle play clears gaze");
	assert.equal(lastFrame(harness)?.frame.columnIndex, 0);
	assert.equal(harness.rafCount(), 1, "idle frame clock resumes");

	assert.equal(animator.play("jumping", 1, "ui"), true);
	animator.setGaze(90);
	assert.equal(
		lastFrame(harness)?.phase,
		"action",
		"gaze is ignored while an action runs",
	);
}

/** pace：只拖慢 idle 帧时钟，action 计时保持原速。 */
{
	const harness = createHarness({ pace: 2 });
	const { animator } = harness;

	assert.equal(animator.play("idle", 1, "ambient"), true);
	// idle 播放链首帧被拉长到 280×6=1680ms；5000ms 墙钟在 pace 2 下等于 2500ms 播放时间。
	harness.advance(5000);
	harness.runNextFrame();
	assert.equal(
		lastFrame(harness)?.frame.columnIndex,
		2,
		"pace 2 halves idle playback progress",
	);
}

console.log(
	"PASS pet animator (priority preemption / dispose / reduced motion / pause-resume / gaze / pace)",
);

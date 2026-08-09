/**
 * 留言卡竹蝉玩具 · 自研绳系质点物理
 * 玩法对照灵感玩具「画圈甩 → 角速度发声」，实现与资产均为站内自写，非原作再分发。
 */

export const TAU: number = Math.PI * 2;

export function clamp(v: number, a: number, b: number): number {
	return v < a ? a : v > b ? b : v;
}

/** 卡片尺寸下的绳长 / 自动甩半径 */
export function sizeForCard(
	w: number,
	h: number,
): { ropeLen: number; autoR: number } {
	const minDim = Math.min(w, h);
	const ropeLen = clamp(minDim * 0.28, 40, 68);
	const autoR = clamp(ropeLen * 0.35, 14, 26);
	return { ropeLen, autoR };
}

export type Vec2 = { x: number; y: number };
export type Tube = Vec2 & { vx: number; vy: number };

export type PhysParams = {
	ropeLen: number;
	ropeK?: number;
	ropeD?: number;
	grav?: number;
	airDrag?: number;
};

const DEFAULTS = {
	ropeK: 2600,
	ropeD: 14,
	grav: 1150,
	airDrag: 0.35,
};

/** 单步积分：绳只拉不推 + 重力 + 空气阻尼 */
export function physStep(
	tube: Tube,
	stick: Vec2,
	h: number,
	p: PhysParams,
): void {
	const ropeK = p.ropeK ?? DEFAULTS.ropeK;
	const ropeD = p.ropeD ?? DEFAULTS.ropeD;
	const grav = p.grav ?? DEFAULTS.grav;
	const airDrag = p.airDrag ?? DEFAULTS.airDrag;
	const dx = tube.x - stick.x;
	const dy = tube.y - stick.y;
	const d = Math.hypot(dx, dy) || 1e-6;
	const ux = dx / d;
	const uy = dy / d;
	let ax = 0;
	let ay = grav;
	if (d > p.ropeLen) {
		const vrad = tube.vx * ux + tube.vy * uy;
		const f = -ropeK * (d - p.ropeLen) - ropeD * vrad;
		ax += f * ux;
		ay += f * uy;
	}
	ax -= airDrag * tube.vx;
	ay -= airDrag * tube.vy;
	tube.vx += ax * h;
	tube.vy += ay * h;
	tube.x += tube.vx * h;
	tube.y += tube.vy * h;
}

/** 定步长积分累加 */
export function integrate(
	tube: Tube,
	stick: Vec2,
	dt: number,
	p: PhysParams,
): void {
	let acc = dt;
	const h = 1 / 240;
	while (acc > 1e-6) {
		const s = Math.min(h, acc);
		physStep(tube, stick, s, p);
		acc -= s;
	}
}

export type DriveState = {
	theta: number;
	prevTheta: number;
	omega: number;
	rps: number;
	drive: number;
	active: number;
	taut: number;
	ropeDist: number;
};

export function createDriveState(): DriveState {
	return {
		theta: 0,
		prevTheta: 0,
		omega: 0,
		rps: 0,
		drive: 0,
		active: 0,
		taut: 0,
		ropeDist: 0,
	};
}

/** 绳向角速度 → 圈/秒 → 发声驱动量 */
export function updateDrive(
	st: DriveState,
	stick: Vec2,
	tube: Vec2,
	ropeLen: number,
	dt: number,
): void {
	st.theta = Math.atan2(tube.y - stick.y, tube.x - stick.x);
	let dth = st.theta - st.prevTheta;
	while (dth > Math.PI) dth -= TAU;
	while (dth < -Math.PI) dth += TAU;
	const safeDt = Math.max(dt, 1e-4);
	st.omega += (dth / safeDt - st.omega) * Math.min(1, dt * 9);
	st.prevTheta = st.theta;
	st.rps = Math.abs(st.omega) / TAU;
	st.ropeDist = Math.hypot(tube.x - stick.x, tube.y - stick.y);
	st.taut = clamp((st.ropeDist / ropeLen - 0.88) / 0.12, 0, 1);
	st.drive = clamp((st.rps - 1.1) / 2.6, 0, 1);
	const tgt = Math.pow(st.drive, 1.25) * st.taut;
	st.active +=
		(tgt - st.active) * Math.min(1, dt * (tgt > st.active ? 10 : 3.2));
}

/** 把竹筒软钳在卡片 inset 内，防极端弹力穿出 */
export function softClampTube(
	tube: Tube,
	w: number,
	h: number,
	inset = 8,
): void {
	const minX = inset;
	const maxX = Math.max(inset + 1, w - inset);
	const minY = inset;
	const maxY = Math.max(inset + 1, h - inset);
	if (tube.x < minX) {
		tube.x = minX;
		tube.vx *= -0.2;
	} else if (tube.x > maxX) {
		tube.x = maxX;
		tube.vx *= -0.2;
	}
	if (tube.y < minY) {
		tube.y = minY;
		tube.vy *= -0.2;
	} else if (tube.y > maxY) {
		tube.y = maxY;
		tube.vy *= -0.2;
	}
}

/** 锚点跟随目标的指数平滑 */
export function followStick(
	stick: Vec2,
	target: Vec2,
	dt: number,
	rate = 26,
): void {
	const k = 1 - Math.exp(-dt * rate);
	stick.x += (target.x - stick.x) * k;
	stick.y += (target.y - stick.y) * k;
}

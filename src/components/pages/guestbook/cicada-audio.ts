/**
 * 留言卡竹蝉 · 合成「哇」声链（自研，非原作采样）
 * 须在用户手势后调用 ensure / resume。
 */

import { clamp } from "./cicada-physics";

type AuNodes = {
	master: GainNode;
	osc: OscillatorNode;
	lfo: OscillatorNode;
	nGain: GainNode;
	wah: BiquadFilterNode;
};

export type CicadaAudio = {
	ctx: AudioContext;
	au: AuNodes;
};

export function createCicadaAudio(): CicadaAudio | null {
	const Ctx =
		window.AudioContext ||
		(window as unknown as { webkitAudioContext?: typeof AudioContext })
			.webkitAudioContext;
	if (!Ctx) return null;
	const ctx = new Ctx();
	const master = ctx.createGain();
	master.gain.value = 0;
	const comp = ctx.createDynamicsCompressor();
	comp.threshold.value = -18;
	comp.ratio.value = 8;
	comp.attack.value = 0.004;
	comp.release.value = 0.18;
	master.connect(comp);
	comp.connect(ctx.destination);

	const t = ctx.currentTime;
	const osc = ctx.createOscillator();
	osc.type = "sawtooth";
	osc.frequency.value = 70;

	const shaper = ctx.createWaveShaper();
	{
		const n = 1024;
		const curve = new Float32Array(n);
		for (let i = 0; i < n; i++) {
			const x = (i / (n - 1)) * 2 - 1;
			curve[i] = Math.tanh(x * 3.2);
		}
		shaper.curve = curve;
		shaper.oversample = "2x";
	}
	osc.connect(shaper);

	const am = ctx.createGain();
	am.gain.value = 0.62;
	const lfo = ctx.createOscillator();
	lfo.type = "sine";
	lfo.frequency.value = 30;
	const lfoAmt = ctx.createGain();
	lfoAmt.gain.value = 0.34;
	lfo.connect(lfoAmt);
	lfoAmt.connect(am.gain);
	shaper.connect(am);

	const nBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
	const nd = nBuf.getChannelData(0);
	for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
	const noise = ctx.createBufferSource();
	noise.buffer = nBuf;
	noise.loop = true;
	const nFil = ctx.createBiquadFilter();
	nFil.type = "bandpass";
	nFil.frequency.value = 2500;
	nFil.Q.value = 0.7;
	const nGain = ctx.createGain();
	nGain.gain.value = 0;
	noise.connect(nFil);
	nFil.connect(nGain);

	const bus = ctx.createGain();
	bus.gain.value = 0.9;
	am.connect(bus);
	nGain.connect(bus);

	const wah = ctx.createBiquadFilter();
	wah.type = "bandpass";
	wah.frequency.value = 900;
	wah.Q.value = 2.2;
	bus.connect(wah);

	const sum = ctx.createGain();
	sum.gain.value = 1;
	const formant = (freq: number, q: number, g: number) => {
		const f = ctx.createBiquadFilter();
		f.type = "bandpass";
		f.frequency.value = freq;
		f.Q.value = q;
		const fg = ctx.createGain();
		fg.gain.value = g;
		wah.connect(f);
		f.connect(fg);
		fg.connect(sum);
	};
	formant(1050, 9, 0.9);
	formant(2150, 11, 0.6);
	formant(3350, 13, 0.4);

	const hp = ctx.createBiquadFilter();
	hp.type = "highpass";
	hp.frequency.value = 360;
	sum.connect(hp);
	hp.connect(master);

	osc.start(t);
	lfo.start(t);
	noise.start(t);

	return { ctx, au: { master, osc, lfo, nGain, wah } };
}

export function resumeAudio(audio: CicadaAudio | null): void {
	if (!audio) return;
	if (audio.ctx.state !== "running") {
		audio.ctx.resume().catch(() => {});
	}
}

export function suspendAudio(audio: CicadaAudio | null): void {
	if (!audio) return;
	if (audio.ctx.state === "running") {
		audio.ctx.suspend().catch(() => {});
	}
}

export function updateCicadaAudio(
	audio: CicadaAudio | null,
	opts: { active: number; rps: number; drive: number; theta: number },
): void {
	if (!audio || audio.ctx.state !== "running") return;
	const { au, ctx } = audio;
	const t = ctx.currentTime;
	const { active, rps, drive, theta } = opts;
	au.master.gain.setTargetAtTime(0.72 * Math.pow(active, 1.3), t, 0.07);
	const f0 = clamp(55 + rps * 17, 50, 195);
	au.osc.frequency.setTargetAtTime(f0, t, 0.06);
	au.osc.detune.setTargetAtTime(
		46 * Math.sin(theta + 0.9) * clamp(active * 1.6, 0, 1),
		t,
		0.03,
	);
	au.lfo.frequency.setTargetAtTime(24 + rps * 4.5, t, 0.1);
	const wf = 760 + 520 * active + (430 + 330 * active) * Math.sin(theta - 0.7);
	au.wah.frequency.setTargetAtTime(Math.max(320, wf), t, 0.025);
	au.nGain.gain.setTargetAtTime(
		(0.03 + 0.17 * active) * clamp(drive * 4, 0, 1),
		t,
		0.08,
	);
}

export function disposeCicadaAudio(audio: CicadaAudio | null): void {
	if (!audio) return;
	try {
		audio.ctx.close();
	} catch (_) {
		/* ignore */
	}
}

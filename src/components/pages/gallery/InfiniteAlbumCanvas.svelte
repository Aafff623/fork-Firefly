<script lang="ts">
/**
 * 无限滚动模式：仿 Codrops Infinite Canvas
 * 默认最远景 · 空间循环复用（无尽头）· 点击飞向 · 穿过前景隐身
 */
import { onMount } from "svelte";
import * as THREE from "three";

interface Props {
	photos: string[];
	title?: string;
	hint?: string;
	demoHint?: string;
}

const {
	photos,
	title = "INFINITE CANVAS",
	hint = "点击聚焦 · 拖拽平移 · 滚轮缩放 · WASD / QE",
	demoHint = "演示循环中 · 点击或按 Esc 接管",
}: Props = $props();

let hostEl = $state<HTMLDivElement | null>(null);
let ready = $state(false);
let progress = $state(0);
let demoLooping = $state(true);

onMount(() => {
	const host = hostEl;
	if (!host || photos.length === 0) return;

	// z 越大越远；默认最远景。不再夹死相机——靠画幅循环实现真·无限
	const INITIAL_Z = 155;
	const FOCUS_GAP = 28;
	const PASS_EPS = 2.5;
	const PASS_FADE = 14;
	const WRAP_X = 170;
	const WRAP_Y = 120;
	const WRAP_Z = 150;
	const PLANE_COUNT = Math.min(96, Math.max(48, photos.length));
	const CLICK_SLOP = 6;

	const BG_LIGHT = 0xffffff;
	const BG_DARK = 0x111318;
	const isDarkTheme = () =>
		document.documentElement.classList.contains("dark");

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(isDarkTheme() ? BG_DARK : BG_LIGHT);

	const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
	camera.position.set(0, 0, INITIAL_Z);

	const themeMo = new MutationObserver(() => {
		scene.background = new THREE.Color(isDarkTheme() ? BG_DARK : BG_LIGHT);
	});
	themeMo.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});

	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: false,
		powerPreference: "high-performance",
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	host.appendChild(renderer.domElement);
	Object.assign(renderer.domElement.style, {
		position: "absolute",
		inset: "0",
		width: "100%",
		height: "100%",
		touchAction: "none",
		display: "block",
	});

	const sharedGeo = new THREE.PlaneGeometry(1, 1);
	const loader = new THREE.TextureLoader();
	loader.setCrossOrigin("");
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();

	// 悬浮高亮框（略大于画幅，始终画在最前）
	const highlightPlaneSrc = new THREE.PlaneGeometry(1, 1);
	const highlightGeo = new THREE.EdgesGeometry(highlightPlaneSrc);
	highlightPlaneSrc.dispose();
	const highlightMat = new THREE.LineBasicMaterial({
		color: 0x7c3aed,
		transparent: true,
		opacity: 0.95,
		depthTest: false,
	});
	const highlight = new THREE.LineSegments(highlightGeo, highlightMat);
	highlight.visible = false;
	highlight.renderOrder = 999;
	scene.add(highlight);

	const highlightGlowMat = new THREE.LineBasicMaterial({
		color: 0xa78bfa,
		transparent: true,
		opacity: 0.45,
		depthTest: false,
	});
	const highlightGlow = new THREE.LineSegments(highlightGeo, highlightGlowMat);
	highlightGlow.visible = false;
	highlightGlow.renderOrder = 998;
	scene.add(highlightGlow);

	type PlaneItem = {
		mesh: THREE.Mesh;
		material: THREE.MeshBasicMaterial;
		baseY: number;
		mediaIndex: number;
	};

	let wrapSalt = 0;
	let hovered: PlaneItem | null = null;
	let focusedPlane: PlaneItem | null = null;
	let elevated: PlaneItem | null = null;

	const planes: PlaneItem[] = [];
	const textures: (THREE.Texture | null)[] = photos.map(() => null);
	let loadedOk = 0;
	let loadedDone = 0;

	const seeded = (n: number) => {
		const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
		return x - Math.floor(x);
	};

	function resize() {
		const w = host.clientWidth || 1;
		const h = host.clientHeight || 1;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h, false);
	}
	resize();
	const ro = new ResizeObserver(resize);
	ro.observe(host);

	for (let i = 0; i < PLANE_COUNT; i++) {
		const s = i * 9973 + 13;
		const ring = Math.floor(i / 12);
		const size = 8 + seeded(s + 3) * 14;
		const spread = 28 + ring * 22;
		const x = (seeded(s) - 0.5) * spread * 2.4;
		const y = (seeded(s + 1) - 0.5) * spread * 1.7;
		// 画幅多在镜头前方（更小的 z）
		const z = (seeded(s + 2) - 0.5) * 70 - ring * 8;
		const mediaIndex = i % photos.length;

		const material = new THREE.MeshBasicMaterial({
			color: 0xf3eee6,
			transparent: true,
			opacity: 0,
			side: THREE.DoubleSide,
			depthWrite: false,
		});
		const mesh = new THREE.Mesh(sharedGeo, material);
		mesh.position.set(x, y, z);
		mesh.scale.set(size, size, 1);
		mesh.visible = false;
		mesh.userData.planeIndex = i;
		scene.add(mesh);
		planes.push({ mesh, material, baseY: size, mediaIndex });
	}

	function bindPlaneTexture(p: PlaneItem) {
		const tex = textures[p.mediaIndex];
		if (!tex) return;
		const img = tex.image as HTMLImageElement | undefined;
		const aspect =
			img && img.width && img.height ? img.width / img.height : 1;
		p.material.map = tex;
		p.material.color.set(0xffffff);
		p.material.needsUpdate = true;
		p.mesh.scale.set(p.baseY * aspect, p.baseY, 1);
	}

	function applyTexture(mediaIndex: number, tex: THREE.Texture) {
		textures[mediaIndex] = tex;
		for (const p of planes) {
			if (p.mediaIndex !== mediaIndex) continue;
			bindPlaneTexture(p);
		}
	}

	/** 循环重生：滚过头后，把画幅丢回镜头前方，随机成「初始画墙」观感 */
	function respawnAhead(p: PlaneItem) {
		wrapSalt += 1;
		const s = wrapSalt * 7919 + 17;
		const dist = 24 + seeded(s) * 95;
		const spread = 35 + seeded(s + 1) * 55;
		p.mesh.position.x = camera.position.x + (seeded(s + 2) - 0.5) * spread * 2.2;
		p.mesh.position.y = camera.position.y + (seeded(s + 3) - 0.5) * spread * 1.5;
		p.mesh.position.z = camera.position.z - dist;
		p.baseY = 8 + seeded(s + 4) * 14;
		p.mediaIndex = Math.floor(seeded(s + 5) * photos.length) % photos.length;
		bindPlaneTexture(p);
	}

	/** 真无限：XY 环绕相机，Z 穿过后重生到前方 */
	function recycleInfiniteSpace() {
		const cx = camera.position.x;
		const cy = camera.position.y;
		const halfX = WRAP_X * 0.5;
		const halfY = WRAP_Y * 0.5;

		for (const p of planes) {
			let dx = p.mesh.position.x - cx;
			let dy = p.mesh.position.y - cy;
			if (dx > halfX) p.mesh.position.x -= WRAP_X;
			else if (dx < -halfX) p.mesh.position.x += WRAP_X;
			if (dy > halfY) p.mesh.position.y -= WRAP_Y;
			else if (dy < -halfY) p.mesh.position.y += WRAP_Y;

			const ahead = camera.position.z - p.mesh.position.z;
			// 只回收「已经落到身后」的画幅，丢回镜头前方随机重生
			// （不要按 ahead 过大回收，否则最远景会把初始画墙全刷掉）
			if (ahead < -8) {
				respawnAhead(p);
			}
		}
	}

	photos.forEach((url, index) => {
		loader.load(
			url,
			(tex) => {
				tex.colorSpace = THREE.SRGBColorSpace;
				tex.minFilter = THREE.LinearFilter;
				tex.magFilter = THREE.LinearFilter;
				tex.generateMipmaps = false;
				applyTexture(index, tex);
				loadedOk += 1;
				loadedDone += 1;
				progress = loadedDone / photos.length;
				if (loadedOk >= 4 || loadedDone >= photos.length) ready = true;
			},
			undefined,
			() => {
				loadedDone += 1;
				progress = loadedDone / photos.length;
				if (loadedDone >= photos.length) ready = true;
			},
		);
	});

	let dragging = false;
	let moved = false;
	let lastX = 0;
	let lastY = 0;
	let downX = 0;
	let downY = 0;
	let velX = 0;
	let velY = 0;
	let velZ = 0;
	const keys = new Set<string>();
	let raf = 0;
	let alive = true;
	let visible = true;
	let demo = true;
	let demoT = 0;
	const demoOrigin = { x: 0, y: 0, z: INITIAL_Z };

	let focusActive = false;
	const focusTarget = new THREE.Vector3();

	const io = new IntersectionObserver(
		([entry]) => {
			visible = !!entry?.isIntersecting;
		},
		{ threshold: 0.05 },
	);
	io.observe(host);

	function stopDemo() {
		if (!demo) return;
		demo = false;
		demoLooping = false;
	}

	function featuredPlane(): PlaneItem | null {
		return focusedPlane ?? hovered;
	}

	/** 是否挡在 featured 与相机之间，且 XY 重叠 */
	function isOccluding(target: PlaneItem, p: PlaneItem) {
		const camZ = camera.position.z;
		const tz = target.mesh.position.z;
		const pz = p.mesh.position.z;
		if (!(pz > tz && pz < camZ)) return false;
		const dx = Math.abs(p.mesh.position.x - target.mesh.position.x);
		const dy = Math.abs(p.mesh.position.y - target.mesh.position.y);
		const prox = (p.mesh.scale.x + target.mesh.scale.x) * 0.55;
		const proy = (p.mesh.scale.y + target.mesh.scale.y) * 0.55;
		return dx < prox && dy < proy;
	}

	function elevatePlane(plane: PlaneItem | null) {
		if (elevated && elevated !== plane) {
			elevated.mesh.renderOrder = 0;
			elevated.material.depthTest = true;
		}
		elevated = plane;
		if (!plane) return;
		plane.mesh.renderOrder = 1000;
		plane.material.depthTest = false;
	}

	function clearFocusSelection() {
		focusActive = false;
		focusedPlane = null;
		elevatePlane(hovered);
	}

	function flyToPlane(plane: PlaneItem) {
		stopDemo();
		focusActive = true;
		focusedPlane = plane;
		elevatePlane(plane);
		velX = 0;
		velY = 0;
		velZ = 0;
		// 停在画幅前方（更大 z），正对其中心
		focusTarget.set(
			plane.mesh.position.x,
			plane.mesh.position.y,
			plane.mesh.position.z + FOCUS_GAP,
		);
	}

	function pickPlane(clientX: number, clientY: number): PlaneItem | null {
		const rect = host.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return null;
		pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
		pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
		raycaster.setFromCamera(pointerNdc, camera);
		const meshes = planes
			.filter((p) => p.mesh.visible && p.material.map)
			.map((p) => p.mesh);
		const hits = raycaster.intersectObjects(meshes, false);
		if (!hits.length) return null;
		const idx = hits[0].object.userData.planeIndex as number;
		return planes[idx] ?? null;
	}

	function setHover(plane: PlaneItem | null) {
		hovered = plane && plane.mesh.visible ? plane : null;
		const feat = featuredPlane();
		const on = !!feat;
		highlight.visible = on;
		highlightGlow.visible = on;
		elevatePlane(feat);
		if (!dragging) {
			host.style.cursor = hovered || focusedPlane ? "pointer" : "grab";
		}
	}

	function syncHighlightTransform() {
		const feat = featuredPlane();
		if (!feat || !feat.mesh.visible) {
			highlight.visible = false;
			highlightGlow.visible = false;
			return;
		}
		const m = feat.mesh;
		// 略微朝相机抬一点，避免 z-fight
		highlight.position.copy(m.position);
		highlight.position.z += 0.2;
		highlight.quaternion.copy(m.quaternion);
		highlight.scale.set(m.scale.x * 1.04, m.scale.y * 1.04, 1);

		highlightGlow.position.copy(m.position);
		highlightGlow.position.z += 0.15;
		highlightGlow.quaternion.copy(m.quaternion);
		highlightGlow.scale.set(m.scale.x * 1.08, m.scale.y * 1.08, 1);

		highlight.visible = true;
		highlightGlow.visible = true;
	}

	/** 穿过隐身 + 选中/悬停时藏起挡路画幅 */
	function updatePlaneVisibility() {
		const camZ = camera.position.z;
		const featured = featuredPlane();

		for (const p of planes) {
			const hasMap = !!p.material.map;
			if (!hasMap) {
				p.mesh.visible = false;
				continue;
			}

			// 相机看向 -Z：画幅在前方时 plane.z < camZ
			const ahead = camZ - p.mesh.position.z;

			if (ahead <= PASS_EPS) {
				p.material.opacity = 0;
				p.material.depthWrite = false;
				p.mesh.visible = false;
				continue;
			}

			// 挡在当前选中/悬停画前面的叠层 → 隐身，别挡视野
			if (featured && p !== featured && isOccluding(featured, p)) {
				p.material.opacity = 0;
				p.material.depthWrite = false;
				p.mesh.visible = false;
				continue;
			}

			let opacity = 1;
			if (ahead < PASS_FADE) {
				opacity = (ahead - PASS_EPS) / Math.max(PASS_FADE - PASS_EPS, 0.0001);
			}

			p.material.opacity = opacity;
			p.material.depthWrite = opacity > 0.92 && p !== elevated;
			p.mesh.visible = opacity > 0.03;

			if (p === elevated) {
				p.mesh.renderOrder = 1000;
				p.material.depthTest = false;
			} else {
				p.mesh.renderOrder = 0;
				p.material.depthTest = true;
			}
		}
	}

	function onPointerDown(e: PointerEvent) {
		stopDemo();
		dragging = true;
		moved = false;
		downX = lastX = e.clientX;
		downY = lastY = e.clientY;
		host.style.cursor = "grabbing";
		host.setPointerCapture(e.pointerId);
	}
	function onPointerMove(e: PointerEvent) {
		// 未按下：只做悬浮高亮（空白处无框，光标 grab）
		if (!dragging) {
			setHover(pickPlane(e.clientX, e.clientY));
			return;
		}

		// 按下拖拽：空白 / 画幅上都可平移画布
		const dx = e.clientX - lastX;
		const dy = e.clientY - lastY;
		lastX = e.clientX;
		lastY = e.clientY;
		if (Math.hypot(e.clientX - downX, e.clientY - downY) > CLICK_SLOP) {
			moved = true;
			clearFocusSelection();
			setHover(null);
		}
		if (!moved) return;
		const k = camera.position.z * 0.0018;
		velX -= dx * k;
		velY += dy * k;
	}
	function onPointerUp(e: PointerEvent) {
		dragging = false;
		try {
			host.releasePointerCapture(e.pointerId);
		} catch {
			/* ignore */
		}
		// 短点击命中画幅 → 飞向；空白点击不跳转
		if (!moved) {
			const hit = pickPlane(e.clientX, e.clientY);
			if (hit) {
				flyToPlane(hit);
				setHover(hit);
			} else {
				clearFocusSelection();
				setHover(null);
			}
		} else {
			// 拖完恢复光标；空白拖拽平移到此结束
			setHover(pickPlane(e.clientX, e.clientY));
		}
	}
	function onPointerLeave() {
		if (!dragging) setHover(null);
	}
	function onWheel(e: WheelEvent) {
		e.preventDefault();
		stopDemo();
		clearFocusSelection();
		// 向上滚靠近（z 减小），向下滚拉远（z 增大）
		velZ += e.deltaY * 0.045;
	}
	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			stopDemo();
			clearFocusSelection();
			setHover(null);
			return;
		}
		const k = e.key.toLowerCase();
		if (
			[
				"w",
				"a",
				"s",
				"d",
				"q",
				"e",
				"arrowup",
				"arrowdown",
				"arrowleft",
				"arrowright",
			].includes(k)
		) {
			stopDemo();
			clearFocusSelection();
			keys.add(k);
		}
	}
	function onKeyUp(e: KeyboardEvent) {
		keys.delete(e.key.toLowerCase());
	}

	host.style.cursor = "grab";
	host.addEventListener("pointerdown", onPointerDown);
	host.addEventListener("pointermove", onPointerMove);
	host.addEventListener("pointerup", onPointerUp);
	host.addEventListener("pointercancel", onPointerUp);
	host.addEventListener("pointerleave", onPointerLeave);
	host.addEventListener("wheel", onWheel, { passive: false });
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);

	const MAX_V = 3.2;
	const clampV = (v: number) => Math.max(-MAX_V, Math.min(MAX_V, v));

	function tick() {
		if (!alive) return;
		raf = requestAnimationFrame(tick);
		if (!visible) return;

		if (demo) {
			demoT += 0.0085;
			// 在最远景附近小幅漫游，不往近处冲
			camera.position.x =
				demoOrigin.x + Math.sin(demoT) * 22 + Math.sin(demoT * 0.37) * 8;
			camera.position.y = demoOrigin.y + Math.sin(demoT * 0.7) * 12;
			camera.position.z =
				demoOrigin.z - 8 + Math.sin(demoT * 0.45) * 6;
		} else if (focusActive) {
			camera.position.x += (focusTarget.x - camera.position.x) * 0.08;
			camera.position.y += (focusTarget.y - camera.position.y) * 0.08;
			camera.position.z += (focusTarget.z - camera.position.z) * 0.08;
			if (camera.position.distanceTo(focusTarget) < 0.35) {
				camera.position.copy(focusTarget);
				focusActive = false;
			}
		} else {
			const speed = 0.18 * (camera.position.z / 48);
			if (keys.has("w") || keys.has("arrowup")) velY += speed;
			if (keys.has("s") || keys.has("arrowdown")) velY -= speed;
			if (keys.has("a") || keys.has("arrowleft")) velX -= speed;
			if (keys.has("d") || keys.has("arrowright")) velX += speed;
			if (keys.has("e")) velZ -= speed * 8;
			if (keys.has("q")) velZ += speed * 8;

			velX = clampV(velX) * 0.9;
			velY = clampV(velY) * 0.9;
			velZ *= 0.86;

			camera.position.x += velX;
			camera.position.y += velY;
			// 不再夹死 z：无限往前/往后滚，靠 recycle 续画
			camera.position.z += velZ;
		}

		recycleInfiniteSpace();
		updatePlaneVisibility();
		// 隐身/重生后校正高亮框；聚焦画若被回收则清选中
		if (focusedPlane && !focusedPlane.mesh.visible) {
			focusedPlane = null;
		}
		if (hovered && !hovered.mesh.visible) setHover(null);
		else {
			elevatePlane(featuredPlane());
			syncHighlightTransform();
		}
		renderer.render(scene, camera);
	}
	tick();

	return () => {
		alive = false;
		cancelAnimationFrame(raf);
		themeMo.disconnect();
		ro.disconnect();
		io.disconnect();
		host.removeEventListener("pointerdown", onPointerDown);
		host.removeEventListener("pointermove", onPointerMove);
		host.removeEventListener("pointerup", onPointerUp);
		host.removeEventListener("pointercancel", onPointerUp);
		host.removeEventListener("pointerleave", onPointerLeave);
		host.removeEventListener("wheel", onWheel);
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
		for (const t of textures) t?.dispose();
		for (const p of planes) {
			scene.remove(p.mesh);
			p.material.dispose();
		}
		sharedGeo.dispose();
		highlightGeo.dispose();
		highlightMat.dispose();
		highlightGlowMat.dispose();
		scene.remove(highlight);
		scene.remove(highlightGlow);
		renderer.dispose();
		renderer.domElement.remove();
	};
});
</script>

<div class="infinite-canvas" class:is-ready={ready} bind:this={hostEl}>
	{#if !ready}
		<div class="infinite-canvas-loader" aria-hidden="true">
			<div class="infinite-canvas-loader-track">
				<div
					class="infinite-canvas-loader-fill"
					style={`transform: scaleX(${Math.max(0.08, progress)});`}
				></div>
			</div>
		</div>
	{/if}
	<div class="infinite-canvas-title" aria-hidden="true">{title}</div>
	<div class="infinite-canvas-hint">
		{demoLooping ? demoHint : hint}
	</div>
</div>

import assert from "node:assert/strict";
import {
	BOOLEAN_SETTING_IDS,
	createSettingsRegistry,
	SETTING_IDS,
	type SettingsRoot,
	type SettingsRootElement,
	type SettingsStorage,
	type SettingValue,
	serializeBootState,
} from "../src/lib/settings/registry";

/*
 * 设置登记表的行为断言：只穿 module 的接口（read / apply / applyAll / set /
 * subscribe / defaultOf / serializeBootState），storage、root、now、emit 全用假对象。
 * 不断言内部表结构，也不依赖真实浏览器。
 */

type FakeElement = SettingsRootElement & {
	attrs: Map<string, string>;
	classes: Set<string>;
	styles: Map<string, string>;
};

function createElement(): FakeElement {
	const attrs = new Map<string, string>();
	const classes = new Set<string>();
	const styles = new Map<string, string>();
	return {
		attrs,
		classes,
		styles,
		classList: {
			add: (...names: string[]) => {
				for (const name of names) classes.add(name);
			},
			remove: (...names: string[]) => {
				for (const name of names) classes.delete(name);
			},
		},
		setAttribute: (name: string, value: string) => {
			attrs.set(name, value);
		},
		style: {
			setProperty: (name: string, value: string) => {
				styles.set(name, value);
			},
		},
	};
}

type FakeRoot = SettingsRoot & {
	documentElement: FakeElement;
	body: FakeElement;
};

function createRoot(options: { prefersDark?: boolean } = {}): FakeRoot {
	const documentElement = createElement();
	return {
		documentElement,
		body: createElement(),
		getElementById: () => null,
		querySelector: () => null,
		matchMedia: () => ({ matches: options.prefersDark === true }),
	};
}

type FakeStorage = SettingsStorage & {
	store: Map<string, string>;
};

function createStorage(initial: Record<string, string> = {}): FakeStorage {
	const store = new Map(Object.entries(initial));
	return {
		store,
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
	};
}

function createHarness(
	initial: Record<string, string> = {},
	rootOptions: { prefersDark?: boolean } = {},
	now: () => Date = () => new Date(),
) {
	const storage = createStorage(initial);
	const root = createRoot(rootOptions);
	const events: { type: string; detail: Record<string, unknown> }[] = [];
	const settings = createSettingsRegistry({
		storage,
		root,
		now,
		emit: (type, detail) => {
			events.push({ type, detail });
		},
	});
	return { storage, root, events, settings };
}

// ── 1. 读取：空存储回落到站点默认 ───────────────────────────

{
	const { settings } = createHarness();
	for (const id of SETTING_IDS) {
		assert.deepEqual(
			settings.read(id),
			settings.defaultOf(id),
			`${id} reads the site default on empty storage`,
		);
	}
	assert.equal(settings.read("petRoam"), true, "pet roam defaults to on");
	assert.equal(settings.read("petId"), "default", "pet id defaults to default");
	assert.deepEqual(
		BOOLEAN_SETTING_IDS.map((id) => typeof settings.read(id)),
		BOOLEAN_SETTING_IDS.map(() => "boolean"),
		"all simple toggles read as boolean",
	);
}

// ── 2. 读取：存储值 / 非法值 / 无存储 ────────────────────────

{
	const { settings } = createHarness({
		theme: "dark",
		petRoamEnabled: "false",
		"firefly-sprite-pet-id-v1": "gojo--lilokhalikfa",
	});
	assert.equal(settings.read("theme"), "dark", "stored theme is honored");
	assert.equal(settings.read("petRoam"), false, "pet roam off is honored");
	assert.equal(
		settings.read("petId"),
		"gojo--lilokhalikfa",
		"a picker pet id is honored",
	);

	const { settings: invalid } = createHarness({
		theme: "bogus",
		"firefly-sprite-pet-id-v1": "not-a-pet",
		sakuraEnabled: "yes",
	});
	assert.equal(
		invalid.read("theme"),
		invalid.defaultOf("theme"),
		"unknown theme falls back to the default",
	);
	assert.equal(
		invalid.read("petId"),
		invalid.defaultOf("petId"),
		"unknown pet id falls back to the default",
	);
	assert.equal(
		invalid.read("sakura"),
		false,
		"non-boolean stored value reads false",
	);

	const noStorage = createSettingsRegistry({
		storage: null,
		root: createRoot(),
	});
	assert.deepEqual(
		noStorage.read("theme"),
		noStorage.defaultOf("theme"),
		"no storage still reads the default",
	);
	assert.equal(
		noStorage.set("waves", true),
		false,
		"no storage reports the write as failed",
	);
}

// ── 3. 门控：面板关掉的项不认历史 localStorage ───────────────

{
	const boot = serializeBootState();
	const { settings } = createHarness({
		wallpaperMode: "fullscreen",
		overlayCardOpacity: "0.2",
		avatarFrameId: "S6-laurel",
		cardBorderEnabled: "true",
		cardFollowThemeEnabled: "true",
		noteCardEnabled: "false",
		bannerCarouselEnabled: "true",
	});

	assert.equal(
		settings.read("wallpaper"),
		boot.gates.wallpaperMode ? "fullscreen" : settings.defaultOf("wallpaper"),
		"wallpaper honors storage only when the panel is open",
	);
	assert.equal(
		settings.read("overlayCardOpacity"),
		boot.gates.overlayCardOpacity
			? 0.2
			: settings.defaultOf("overlayCardOpacity"),
		"card opacity honors storage only when the panel is open",
	);
	assert.equal(
		settings.read("avatarFrame"),
		boot.gates.avatarFrame ? "S6-laurel" : settings.defaultOf("avatarFrame"),
		"avatar frame honors storage only when the frame feature is on",
	);
	assert.equal(
		settings.read("cardBorder"),
		boot.toggles.cardBorder.gate ? true : settings.defaultOf("cardBorder"),
		"card border keeps the site default while the panel is closed",
	);
	assert.equal(
		settings.read("cardFollowTheme"),
		boot.toggles.cardFollowTheme.gate
			? true
			: boot.toggles.cardFollowTheme.gatedValue,
		"card follow-theme stays off while the panel is closed",
	);

	// 无效值即使门控打开也不生效
	const { settings: invalid } = createHarness({ wallpaperMode: "night" });
	assert.equal(
		invalid.read("wallpaper"),
		invalid.defaultOf("wallpaper"),
		"unknown wallpaper mode falls back to the default",
	);
}

// ── 4. 写入：落盘 + 应用 + 广播 + 订阅 ──────────────────────

{
	const { settings, storage, root, events } = createHarness();
	const seen: SettingValue[] = [];
	const unsubscribe = settings.subscribe("theme", (value) => seen.push(value));

	assert.equal(settings.set("theme", "dark"), true, "theme write succeeds");
	assert.equal(storage.store.get("theme"), "dark", "theme lands in storage");
	assert.equal(
		root.documentElement.attrs.get("data-theme"),
		serializeBootState().theme.darkTheme,
		"code theme follows the dark class",
	);
	assert.ok(
		root.documentElement.classes.has("dark"),
		"dark class is applied to the root",
	);
	assert.deepEqual(events.at(-1), {
		type: "theme-change",
		detail: { theme: "dark" },
	});
	assert.deepEqual(seen, ["dark"], "subscriber receives the normalized value");

	// 主题时段：注入 now 决定亮暗
	const darkNow = createHarness(
		{ theme: "time" },
		{},
		() => new Date(Date.UTC(2026, 0, 1, 14, 0, 0)), // 北京时间 22:00
	);
	darkNow.settings.apply("theme");
	assert.ok(darkNow.root.documentElement.classes.has("dark"), "22:00 is dark");
	const lightNow = createHarness(
		{ theme: "time" },
		{},
		() => new Date(Date.UTC(2026, 0, 1, 2, 0, 0)), // 北京时间 10:00
	);
	lightNow.settings.apply("theme");
	assert.equal(
		lightNow.root.documentElement.classes.has("dark"),
		false,
		"10:00 is light",
	);

	// system 主题跟随 matchMedia
	const systemDark = createHarness({ theme: "system" }, { prefersDark: true });
	systemDark.settings.apply("theme");
	assert.ok(
		systemDark.root.documentElement.classes.has("dark"),
		"system theme follows prefers-color-scheme",
	);

	// 壁纸 / 头像框 / 桌宠：事件名与 detail 保持旧契约
	settings.set("wallpaper", "overlay");
	assert.equal(storage.store.get("wallpaperMode"), "overlay");
	assert.equal(
		root.documentElement.attrs.get("data-wallpaper-mode"),
		"overlay",
	);
	assert.deepEqual(events.at(-1), {
		type: "wallpaperModeChange",
		detail: { mode: "overlay" },
	});

	settings.set("avatarFrame", "S6-laurel");
	assert.equal(storage.store.get("avatarFrameId"), "S6-laurel");
	assert.equal(
		root.documentElement.attrs.get("data-avatar-frame"),
		"S6-laurel",
	);
	assert.deepEqual(events.at(-1), {
		type: "firefly:avatar-frame-change",
		detail: { id: "S6-laurel" },
	});

	settings.set("petId", "gojo--lilokhalikfa");
	assert.deepEqual(
		events.at(-1),
		{
			type: "firefly:pet-change",
			detail: { petId: "gojo--lilokhalikfa" },
		},
		"pet change keeps its event contract",
	);

	settings.set("petRoam", false);
	assert.equal(storage.store.get("petRoamEnabled"), "false");
	assert.deepEqual(events.at(-1), {
		type: "firefly:pet-roam-toggle",
		detail: { enabled: false },
	});

	// 非法值写入前归一，不把脏值落盘
	settings.set("avatarFrame", "no-such-frame");
	assert.equal(
		storage.store.get("avatarFrameId"),
		settings.defaultOf("avatarFrame"),
		"invalid avatar frame is normalized before writing",
	);

	unsubscribe();
	const seenBefore = seen.length;
	settings.set("theme", "light");
	assert.equal(seen.length, seenBefore, "unsubscribe stops notifications");
}

// ── 5. 写入失败：无痕 + 不广播 + 回报 false ─────────────────

{
	const thrown: string[] = [];
	const root = createRoot();
	const failing = createSettingsRegistry({
		storage: {
			getItem: () => null,
			setItem: (key: string) => {
				thrown.push(key);
				throw new Error("QuotaExceededError");
			},
		},
		root,
		emit: (type) => {
			assert.fail(`failed write must not emit ${type}`);
		},
	});

	assert.equal(failing.set("waves", true), false, "quota error reports false");
	assert.equal(
		root.documentElement.attrs.has("data-waves-enabled"),
		false,
		"failed write must not touch the DOM",
	);
	assert.deepEqual(
		thrown,
		["wavesEnabled"],
		"write stops after the first failure",
	);

	let notified = 0;
	failing.subscribe("waves", () => {
		notified += 1;
	});
	failing.set("waves", true);
	assert.equal(notified, 0, "failed write must not notify subscribers");

	// 读取时存储抛错：回落默认值，而不是把异常抛给页面
	const brokenRead = createSettingsRegistry({
		storage: {
			getItem: () => {
				throw new Error("SecurityError");
			},
			setItem: () => {},
		},
		root,
	});
	assert.equal(
		brokenRead.read("theme"),
		brokenRead.defaultOf("theme"),
		"broken storage read falls back to the default",
	);
}

// ── 6. applyAll：按登记表把当前值应用到 root ────────────────

{
	const { settings, root } = createHarness({ theme: "dark" });
	settings.applyAll();

	assert.equal(
		root.documentElement.attrs.get("data-theme"),
		serializeBootState().theme.darkTheme,
		"applyAll syncs the code theme",
	);
	assert.ok(
		root.documentElement.classes.has("dark"),
		"applyAll syncs dark class",
	);
	assert.equal(
		root.documentElement.attrs.get("data-wallpaper-mode"),
		String(settings.read("wallpaper")),
		"applyAll syncs the wallpaper mode",
	);
	assert.equal(
		root.documentElement.attrs.get("data-avatar-frame"),
		String(settings.read("avatarFrame")),
		"applyAll syncs the avatar frame",
	);
	assert.equal(
		root.documentElement.styles.get("--card-transparent-opacity"),
		String(settings.read("overlayCardOpacity")),
		"applyAll syncs the card opacity variable",
	);
	assert.equal(
		root.documentElement.attrs.get("data-waves-enabled"),
		String(settings.read("waves")),
		"applyAll syncs the waves attribute",
	);
	assert.equal(
		root.documentElement.classes.has("note-cards-off"),
		settings.read("noteCard") === false,
		"applyAll syncs the note-card class",
	);
	assert.equal(
		root.documentElement.classes.has("enable-card-border"),
		settings.read("cardBorder") === true,
		"applyAll syncs the card-border class",
	);

	// apply 只动 DOM，不落盘
	const { settings: isolated, storage } = createHarness();
	isolated.apply("theme", "dark");
	assert.equal(storage.store.size, 0, "apply does not persist");
	assert.equal(
		isolated.read("theme"),
		isolated.defaultOf("theme"),
		"apply leaves the stored value untouched",
	);
}

// ── 7. 首屏序列化：键名/默认值/门控与读取一致且可 JSON ──────

{
	const boot = serializeBootState();
	const { settings } = createHarness();

	assert.equal(boot.keys.theme, "theme");
	assert.equal(boot.keys.wallpaperMode, "wallpaperMode");
	assert.equal(boot.keys.overlayCardOpacity, "overlayCardOpacity");
	assert.equal(boot.keys.avatarFrame, "avatarFrameId");
	assert.equal(boot.defaults.theme, settings.defaultOf("theme"));
	assert.equal(boot.defaults.wallpaperMode, settings.defaultOf("wallpaper"));
	assert.equal(
		boot.defaults.overlayCardOpacity,
		settings.defaultOf("overlayCardOpacity"),
	);
	assert.equal(boot.defaults.avatarFrame, settings.defaultOf("avatarFrame"));
	assert.ok(boot.avatarFrames.includes("none"), "avatar list includes none");
	assert.deepEqual(boot.wallpaperModes, [
		"banner",
		"fullscreen",
		"overlay",
		"none",
	]);
	assert.equal(Object.keys(boot.toggles).length, BOOLEAN_SETTING_IDS.length);
	for (const id of BOOLEAN_SETTING_IDS) {
		const toggle = boot.toggles[id];
		assert.equal(typeof toggle.key, "string");
		assert.ok(toggle.key.length > 0, `${id} boot key is not empty`);
		assert.equal(typeof toggle.gate, "boolean");
		assert.equal(typeof toggle.defaultValue, "boolean");
		assert.equal(typeof toggle.gatedValue, "boolean");
	}
	assert.deepEqual(
		JSON.parse(JSON.stringify(boot)),
		boot,
		"boot state survives JSON round-trip",
	);
}

console.log(
	`PASS settings registry (${SETTING_IDS.length} rows, read/apply/applyAll/set/subscribe, fake storage + fake root)`,
);

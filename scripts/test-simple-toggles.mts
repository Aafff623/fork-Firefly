import assert from "node:assert/strict";

/*
 * simple-toggles facade 的行为断言。
 * 关键语义不是「都能回环」，而是「facade 忠实转达每个 id 背后的真实读取规则」：
 * 面板未开放的开关（cardBorder / cardFollowTheme）写入后仍必须读回站点默认，
 * 不可写环境（无 localStorage）写入必须完全无痕。
 */

const store = new Map<string, string>();
const events: { type: string; detail?: unknown }[] = [];
const attrs = new Map<string, string>();
const classes = new Set<string>();

function makeClassList() {
	return {
		add: (...names: string[]) => {
			for (const n of names) classes.add(n);
		},
		remove: (...names: string[]) => {
			for (const n of names) classes.delete(n);
		},
		contains: (name: string) => classes.has(name),
	};
}

const fakeElement = {
	style: {} as Record<string, string>,
	classList: makeClassList(),
	setAttribute: (name: string, value: string) => {
		attrs.set(name, value);
	},
};

Object.assign(globalThis, {
	localStorage: {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
	},
	document: {
		documentElement: { ...fakeElement, classList: makeClassList() },
		body: { ...fakeElement, classList: makeClassList() },
		getElementById: () => fakeElement,
		querySelector: () => fakeElement,
	},
	window: {
		innerWidth: 1200,
		dispatchEvent: (event: { type: string; detail?: unknown }) => {
			events.push({ type: event.type, detail: event.detail });
			return true;
		},
	},
});

const {
	getSimpleToggleDefaults,
	readSimpleToggle,
	writeSimpleToggle,
	SIMPLE_TOGGLE_IDS,
} = await import("../src/lib/settings/simple-toggles");
const { displaySettingsConfig } = await import(
	"../src/config/displaySettingsConfig"
);

assert.equal(SIMPLE_TOGGLE_IDS.length, 9, "9 simple toggles");
assert.equal(
	new Set(SIMPLE_TOGGLE_IDS).size,
	SIMPLE_TOGGLE_IDS.length,
	"ids unique",
);

const defaults = getSimpleToggleDefaults();
assert.deepEqual(
	Object.keys(defaults).sort(),
	[...SIMPLE_TOGGLE_IDS].sort(),
	"defaults cover exactly the declared ids",
);
for (const id of SIMPLE_TOGGLE_IDS) {
	assert.equal(typeof defaults[id], "boolean", `${id} default is boolean`);
	assert.equal(typeof readSimpleToggle(id), "boolean", `${id} read is boolean`);
}

/**
 * 面板开放、可回环的开关：写入值必须读得回来。
 * bannerCarousel / cardBorder / cardFollowTheme / noteCard 受 displaySettingsConfig 门控：
 * 面板关掉时写入必须无痕，开着时才回环——断言跟着配置走，不把当前配置写死进测试。
 */
const gates: Partial<Record<string, boolean>> = {
	bannerCarousel: displaySettingsConfig.bannerCarouselSwitchable,
	cardBorder: displaySettingsConfig.cardBorderSwitchable,
	cardFollowTheme: displaySettingsConfig.cardFollowThemeSwitchable,
	noteCard: displaySettingsConfig.noteCardSwitchable,
};

for (const id of SIMPLE_TOGGLE_IDS) {
	const before = readSimpleToggle(id);
	writeSimpleToggle(id, !before);
	const expected = gates[id] === false ? before : !before;
	assert.equal(
		readSimpleToggle(id),
		expected,
		gates[id] === false
			? `${id} stays on the site default while the panel is closed`
			: `${id} write must be readable back`,
	);
	writeSimpleToggle(id, before);
	assert.equal(readSimpleToggle(id), before, `${id} restores`);
}

assert.ok(attrs.has("data-waves-enabled"), "waves apply reaches the document");
assert.ok(
	events.some((e) => e.type === "bannerCarouselChange"),
	"banner carousel notifies listeners",
);
assert.ok(
	events.some((e) => e.type === "sakuraToggle"),
	"sakura notifies listeners",
);
assert.ok(
	events.some((e) => e.type === "firefly:pet-roam-toggle"),
	"pet roam notifies listeners",
);

/** 钉住语义：开 = 钉住，关 = 取消钉住（不是只写 sakuraEnabled）。 */
writeSimpleToggle("sakura", true);
assert.equal(store.get("sakuraPinned"), "true", "sakura on pins");
writeSimpleToggle("sakura", false);
assert.notEqual(store.get("sakuraPinned"), "true", "sakura off unpins");

/** 不可写环境：写入必须完全无痕，读取保持原值，并明确回报 false。 */
Object.assign(globalThis, { localStorage: undefined });
for (const id of SIMPLE_TOGGLE_IDS) {
	const before = readSimpleToggle(id);
	assert.equal(
		writeSimpleToggle(id, !before),
		false,
		`${id} reports not written without storage`,
	);
	assert.equal(
		readSimpleToggle(id),
		before,
		`${id} read unchanged without storage`,
	);
}

/** 配额异常 / setItem 抛错：同样回报 false，UI 才能回滚。 */
const throwingStorage = {
	getItem: (key: string) => store.get(key) ?? null,
	setItem: () => {
		throw new Error("QuotaExceededError");
	},
	removeItem: (key: string) => {
		store.delete(key);
	},
};
Object.assign(globalThis, { localStorage: throwingStorage });
assert.equal(
	writeSimpleToggle("waves", true),
	false,
	"storage exception must surface as false",
);

const openCount = SIMPLE_TOGGLE_IDS.filter((id) => gates[id] !== false).length;
console.log(
	`PASS simple toggles facade (${SIMPLE_TOGGLE_IDS.length} ids, ${openCount} round-trip, ${SIMPLE_TOGGLE_IDS.length - openCount} gated, storage-less)`,
);

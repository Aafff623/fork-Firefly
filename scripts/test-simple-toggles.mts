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
		add: (...names: string[]) => names.forEach((n) => classes.add(n)),
		remove: (...names: string[]) => names.forEach((n) => classes.delete(n)),
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

/** 面板开放、可回环的开关：写入值必须读得回来，且 apply 的 DOM 副作用发生。 */
const roundTripIds = [
	"waves",
	"gradient",
	"bannerTitle",
	"bannerCarousel",
	"sakura",
	"petRoam",
	"noteCard",
] as const;

for (const id of roundTripIds) {
	const before = readSimpleToggle(id);
	writeSimpleToggle(id, !before);
	assert.equal(
		readSimpleToggle(id),
		!before,
		`${id} write must be readable back`,
	);
	writeSimpleToggle(id, before);
	assert.equal(readSimpleToggle(id), before, `${id} restores`);
}

assert.ok(
	attrs.has("data-waves-enabled"),
	"waves apply reaches the document",
);
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

/** 面板未开放的开关：写入不得伪造出「已生效」的读取结果。 */
for (const id of ["cardBorder", "cardFollowTheme"] as const) {
	const locked = readSimpleToggle(id);
	writeSimpleToggle(id, !locked);
	assert.equal(
		readSimpleToggle(id),
		locked,
		`${id} stays on the site default while the panel is closed`,
	);
}

/** 不可写环境：写入必须完全无痕，读取保持原值。 */
Object.assign(globalThis, { localStorage: undefined });
for (const id of SIMPLE_TOGGLE_IDS) {
	const before = readSimpleToggle(id);
	assert.doesNotThrow(
		() => writeSimpleToggle(id, !before),
		`${id} write is safe without storage`,
	);
	assert.equal(
		readSimpleToggle(id),
		before,
		`${id} read unchanged without storage`,
	);
}

console.log(
	`PASS simple toggles facade (${SIMPLE_TOGGLE_IDS.length} ids, ${roundTripIds.length} round-trip, 2 locked, storage-less)`,
);

import assert from "node:assert/strict";
import {
	readBooleanSetting,
	writeBooleanSetting,
} from "../src/lib/settings/boolean-storage";

const store = new Map<string, string>();
const fakeStorage = {
	getItem: (key: string) => store.get(key) ?? null,
	setItem: (key: string, value: string) => {
		store.set(key, value);
	},
};

Object.assign(globalThis, { localStorage: fakeStorage });

assert.equal(readBooleanSetting("missing", true), true, "missing uses fallback true");
assert.equal(readBooleanSetting("missing", false), false, "missing uses fallback false");

store.set("enabled", "true");
store.set("disabled", "false");
assert.equal(readBooleanSetting("enabled", false), true);
assert.equal(readBooleanSetting("disabled", true), false);

assert.equal(writeBooleanSetting("written", true), true);
assert.equal(store.get("written"), "true");
assert.equal(writeBooleanSetting("written", false), true);
assert.equal(store.get("written"), "false");

Object.assign(globalThis, { localStorage: undefined });
assert.equal(readBooleanSetting("enabled", true), true, "no storage uses fallback");
assert.equal(writeBooleanSetting("x", true), false, "no storage reports not written");

console.log("PASS settings boolean storage read/write/fallback");

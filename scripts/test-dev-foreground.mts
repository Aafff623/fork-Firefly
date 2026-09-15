import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const result = spawnSync("cmd.exe", ["/d", "/c", "scripts\\dev-foreground.cmd", "--help"], {
	cwd: process.cwd(),
	encoding: "utf8",
});

assert.equal(
	result.status,
	0,
	`前台启动入口应把 --help 交给 astro dev，而不是让 Agent 后台启动器接管：${result.stderr}`,
);
assert.match(`${result.stdout}\n${result.stderr}`, /astro dev/i);

console.log("foreground dev launcher checks passed");

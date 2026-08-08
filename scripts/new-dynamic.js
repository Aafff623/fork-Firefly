/* Create a timestamped dynamic markdown file from command-line text. */

import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "../src/config/siteConfig.ts";
import { resolveDynamicLocation } from "./resolve-dynamic-location.mjs";

function parseArgs(argv) {
	let locationOverride = "";
	const parts = [];
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--location" && argv[i + 1]) {
			locationOverride = argv[++i];
			continue;
		}
		if (arg.startsWith("--location=")) {
			locationOverride = arg.slice("--location=".length);
			continue;
		}
		parts.push(arg);
	}
	return { content: parts.join(" ").trim(), locationOverride };
}

const { content, locationOverride } = parseArgs(process.argv.slice(2));

if (!content) {
	console.error(
		"Error: No dynamic content provided\nUsage: pnpm new-dynamic [--location 文案] <content>",
	);
	process.exit(1);
}

const now = new Date();
const timezone = siteConfig.timezone || "Asia/Shanghai";
const dateParts = new Intl.DateTimeFormat("en-CA", {
	timeZone: timezone,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hourCycle: "h23",
})
	.formatToParts(now)
	.reduce((parts, part) => {
		if (part.type !== "literal") parts[part.type] = part.value;
		return parts;
	}, {});
const year = dateParts.year;
const month = dateParts.month;
const day = dateParts.day;
const hours = dateParts.hour;
const minutes = dateParts.minute;
const seconds = dateParts.second;
const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
const fileName = `${year}-${month}-${day}-${hours}${minutes}${seconds}.md`;
const targetDir = path.resolve("src/content/dynamic");
const fullPath = path.join(targetDir, fileName);

fs.mkdirSync(targetDir, { recursive: true });

if (fs.existsSync(fullPath)) {
	console.error(`Error: File ${fullPath} already exists`);
	process.exit(1);
}

const resolved = await resolveDynamicLocation({ override: locationOverride });
const locationLine = resolved.location
	? `location: ${resolved.location}\n`
	: "";

fs.writeFileSync(
	fullPath,
	`---\npublished: ${timestamp}\n${locationLine}---\n\n${content}\n`,
);

console.log(
	`Dynamic ${fullPath} created (location=${resolved.location || "∅"} source=${resolved.source})`,
);

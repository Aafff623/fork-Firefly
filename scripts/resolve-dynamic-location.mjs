/**
 * 动态发布时解析 location（方案 A）。
 * 优先级：override → 直连 IP 粗定位（可关）→ home。
 * IP 走 node:http 直连，不读 HTTP(S)_PROXY，避免 VPN 漂城。
 */

import http from "node:http";
import { pathToFileURL } from "node:url";
import { dynamicConfig } from "../src/config/dynamicConfig.ts";

const IP_API_PATH =
	"/json/?lang=zh-CN&fields=status,message,country,countryCode,regionName,city";

function isMainlandChina(json) {
	const code = String(json?.countryCode || "").toUpperCase();
	if (code === "CN") return true;
	const country = String(json?.country || "");
	return country === "中国" || country === "China";
}

function homeLocation() {
	const loc = dynamicConfig.location;
	const home = (loc?.home || dynamicConfig.defaultLocation || "").trim();
	return home || "未知";
}

function ipGeoEnabled() {
	return dynamicConfig.location?.ipGeo !== false;
}

function formatGeo(regionName, city) {
	const region = String(regionName || "")
		.replace(
			/(省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区)$/u,
			"",
		)
		.trim();
	const cityName = String(city || "")
		.replace(/(市|地区|盟|州)$/u, "")
		.trim();
	if (region && cityName && region !== cityName) return `${region} · ${cityName}`;
	return cityName || region || "";
}

/** 直连 ip-api（HTTP），显式不用代理 */
function fetchIpApiDirect(timeoutMs = 4000) {
	return new Promise((resolve, reject) => {
		const req = http.request(
			{
				protocol: "http:",
				hostname: "ip-api.com",
				path: IP_API_PATH,
				method: "GET",
				timeout: timeoutMs,
				headers: { Accept: "application/json" },
			},
			(res) => {
				const chunks = [];
				res.on("data", (c) => chunks.push(c));
				res.on("end", () => {
					try {
						const body = Buffer.concat(chunks).toString("utf8");
						resolve({ statusCode: res.statusCode || 0, json: JSON.parse(body) });
					} catch (error) {
						reject(error);
					}
				});
			},
		);
		req.on("timeout", () => {
			req.destroy();
			reject(new Error("ip-api timeout"));
		});
		req.on("error", reject);
		req.end();
	});
}

/**
 * @param {{ override?: string, allowIpGeo?: boolean }} [opts]
 * @returns {Promise<{ location: string, source: "override" | "ip" | "home" }>}
 */
export async function resolveDynamicLocation(opts = {}) {
	const override = (opts.override || "").trim();
	if (override) return { location: override, source: "override" };

	const allowIp = opts.allowIpGeo ?? ipGeoEnabled();
	if (allowIp) {
		try {
			const { statusCode, json } = await fetchIpApiDirect();
			// 系统级 VPN/TUN 常漂到海外——非大陆出口一律回落 home，避免再出现「加州」
			if (
				statusCode === 200 &&
				json?.status === "success" &&
				isMainlandChina(json)
			) {
				const label = formatGeo(json.regionName, json.city);
				if (label) return { location: label, source: "ip" };
			}
		} catch {
			/* 回落 home */
		}
	}

	return { location: homeLocation(), source: "home" };
}

const isMain =
	process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
	const arg = process.argv.slice(2).find((a) => a.startsWith("--location="));
	const override = arg ? arg.slice("--location=".length) : "";
	const result = await resolveDynamicLocation({ override });
	console.log(JSON.stringify(result));
}

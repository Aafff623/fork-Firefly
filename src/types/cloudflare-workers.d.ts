/**
 * Cloudflare Workers 运行时内建模块（仅部署到 CF 时存在；Vercel/Node 下
 * 动态 import 会抛错并被调用方捕获回退）。项目未装 @cloudflare/workers-types，
 * 这里只声明本项目用到的 ASSETS 静态资产绑定。
 * 注意：本文件必须保持无 import/export（纯环境声明），否则 declare module
 * 会被当作模块增强而非环境模块声明。
 */
declare module "cloudflare:workers" {
	interface WorkersFetcher {
		fetch(input: Request | string | URL): Promise<Response>;
	}
	export const env: {
		/** 静态资产绑定（dist/server/wrangler.json assets.binding = "ASSETS"） */
		ASSETS?: WorkersFetcher;
		[key: string]: unknown;
	};
}

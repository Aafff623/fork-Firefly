/**
 * Supabase Free 计划保活 Worker。
 *
 * Free 项目连续 7 天低活跃会被自动暂停（站点登录整体不可用，需手动 Resume）。
 * 本 Worker 每 6 小时向项目 Auth 服务发一次请求，维持活跃度。
 * 端点需要 apikey：匿名 key 通过 `wrangler secret put SUPABASE_ANON_KEY` 注入，不落代码。
 */
const SUPABASE_URL = "https://smhkhsffkdwdiitllctw.supabase.co";

async function pingHealth(env) {
	try {
		const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
			headers: { apikey: env.SUPABASE_ANON_KEY ?? "" },
		});
		return {
			ok: response.ok,
			status: response.status,
			body: await response.text(),
		};
	} catch (error) {
		return { ok: false, status: 0, body: String(error) };
	}
}

export default {
	async scheduled(_event, env, ctx) {
		ctx.waitUntil(
			pingHealth(env).then((result) => {
				console.log(`supabase-keepalive status=${result.status}`);
			}),
		);
	},

	async fetch(_request, env) {
		const result = await pingHealth(env);
		return new Response(
			`supabase-keepalive status=${result.status}\n${result.body}\n`,
			{
				status: result.ok ? 200 : 502,
				headers: { "content-type": "text/plain; charset=utf-8" },
			},
		);
	},
};

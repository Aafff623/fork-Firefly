// 旧 /archive/* 归档路由迁到 /timeline/* 后的 308 兜底。
// 无路由匹配时 adapter 直接回预渲染 404（渲染管线不执行，middleware 收不到），
// 故必须以真实 SSR 路由存在；生产资产层也不应用 public/_redirects。
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ params, url }) => {
	const rest = params.slug ? `/${params.slug}` : "/";
	return new Response(null, {
		status: 308,
		headers: { Location: `/timeline${rest}${url.search}` },
	});
};

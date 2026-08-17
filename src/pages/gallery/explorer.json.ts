import type { APIRoute } from "astro";
import { listExplorerPhotos } from "@/utils/gallery-utils";

export const prerender = true;

export const GET: APIRoute = () => {
	// prerender 静态文件不保留响应头：缓存交给 vercel.json 全局规则
	// （max-age=0 must-revalidate），新照片发布后回访者不滞后
	return new Response(JSON.stringify({ photos: listExplorerPhotos() }), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	});
};

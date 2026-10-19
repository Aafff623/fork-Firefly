import type { APIRoute } from "astro";
import { listExplorerPhotos } from "@/utils/gallery-utils";

export const prerender = true;

export const GET: APIRoute = () => {
	// prerender 静态文件不保留响应头；当前无平台级缓存规则覆盖它，
	// 走默认（新照片发布后回访者不滞后）
	return new Response(JSON.stringify({ photos: listExplorerPhotos() }), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	});
};

import { getSortedPosts } from "@utils/content-utils";
import { createRssResponse } from "@utils/rss-feed";
import type { APIContext } from "astro";
import { siteConfig } from "@/config";

export async function GET(context: APIContext): Promise<Response> {
	const blog = await getSortedPosts();
	return createRssResponse({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? siteConfig.site_url,
		posts: blog,
	});
}

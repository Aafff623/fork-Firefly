/**
 * 构建期文章索引加载器：读 content collection、注入合集层级，再交给纯核心。
 * 运行时（Cloudflare Workers）不要 import 本文件——它会把内容层打进 Worker 包。
 */
import { type CollectionEntry, getCollection } from "astro:content";
import { collectionsConfig } from "@/config/collectionsConfig";
import {
	type ArticleCard,
	type ArticleIndex,
	type ArticleQuery,
	createArticleIndex,
	isArticleVisible,
	type RankedArticle,
} from "@/lib/article-index";
import { buildArticleCards } from "@/lib/article-index-builder";

export type LoadedArticleIndex = ArticleIndex & {
	/** 按内容 id 取原始 entry；旧列表/合集 UI 仍需要完整 entry */
	entry(id: string): CollectionEntry<"posts"> | undefined;
};

let buildCache: Promise<LoadedArticleIndex> | null = null;
/** 一页里多个组件会重复取列表；DEV 用短缓存避免重复扫全部正文 */
const DEV_CACHE_TTL_MS = 1000;
let devCache: { at: number; index: LoadedArticleIndex } | null = null;

/**
 * 生产构建只读一次内容层；本地 DEV 用 1 秒短缓存，改文章后仍能很快看到新内容。
 */
export function loadArticleIndex(): Promise<LoadedArticleIndex> {
	if (import.meta.env.PROD) {
		buildCache ??= buildArticleIndex().catch((error) => {
			buildCache = null;
			throw error;
		});
		return buildCache;
	}
	if (devCache && Date.now() - devCache.at < DEV_CACHE_TTL_MS) {
		return Promise.resolve(devCache.index);
	}
	return buildArticleIndex().then((index) => {
		devCache = { at: Date.now(), index };
		return index;
	});
}

async function buildArticleIndex(): Promise<LoadedArticleIndex> {
	const includeDrafts = !import.meta.env.PROD;
	const entries = await getCollection("posts", ({ data }) =>
		isArticleVisible(data.draft, { includeDrafts }),
	);
	const cards = buildArticleCards(
		entries.map((entry) => ({
			id: entry.id,
			body: entry.body,
			filePath: entry.filePath,
			data: entry.data,
		})),
		{ includeDrafts },
	);
	const index = createArticleIndex(cards, {
		collections: collectionsConfig.items.map((item) => ({
			slug: item.slug,
			parent: item.parent,
		})),
	});
	const byId = new Map(entries.map((entry) => [entry.id, entry]));

	return {
		list(query?: ArticleQuery): RankedArticle[] {
			return index.list(query);
		},
		collection(slug: string): ArticleCard[] {
			return index.collection(slug);
		},
		entry(id: string): CollectionEntry<"posts"> | undefined {
			return byId.get(id);
		},
	};
}

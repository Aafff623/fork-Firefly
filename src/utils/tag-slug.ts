/**
 * 标签 slug 归一：同名不同形（大小写 / 空格 / 下划线 / 连字符 / 全半角）
 * 归到同一个静态 URL。别名（tagAliases）仍按原始标签名匹配，两者互补：
 * - tagAliases：同义不同名（"AI" / "人工智能"）
 * - 本函数：同名不同形（"Hello World" / "hello-world"）
 */

/** 标签在文章里的最小形状 */
export type TaggedPost = {
	tags: readonly string[];
};

/** getTagList() 一类来源的最小形状 */
export type NamedTag = {
	name: string;
};

export type TagSlugGroup = {
	/** URL 用 slug（小写、连字符分隔、保留 Unicode 字母数字） */
	slug: string;
	/** 展示名：组内出现次数最多的原始写法，并列时取字典序最小者 */
	name: string;
	/** 归到同一 slug 的全部原始写法（含 name） */
	variants: string[];
	/** 含该 slug 任一写法的文章数（同一篇按 slug 去重） */
	count: number;
};

/**
 * 归一标签 slug。
 *
 * 规则：NFKC → 小写 → 非字母/数字/组合符的连续片段折成 `-` → 去首尾 `-`。
 * “Hello World”“hello-world”“Hello_World”“ hello  world ”都是 `hello-world`；
 * 全角 `ＡＩ　编程` 走 NFKC 变 `ai-编程`；纯标点/空标签得到空串，由调用方过滤。
 */
export function normalizeTagSlug(tag: string): string {
	return tag
		.normalize("NFKC")
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * 按归一 slug 合并标签，供静态标签页 / 每标签 RSS 共用。
 *
 * 文章数与写法统计都从 posts 现算：同一篇同时写了 "Hello World" 和
 * "hello-world" 也只算一次，避免 getTagList 的逐写法计数把合并后的数量抬高。
 */
export function collectTagGroups(
	tags: readonly NamedTag[],
	posts: readonly TaggedPost[],
): TagSlugGroup[] {
	const variantsBySlug = new Map<string, Set<string>>();
	const variantCounts = new Map<string, Map<string, number>>();
	const postCounts = new Map<string, number>();

	const addVariant = (raw: string): void => {
		const variant = raw.trim();
		const slug = normalizeTagSlug(variant);
		if (!variant || !slug) return;
		const variants = variantsBySlug.get(slug) ?? new Set<string>();
		variants.add(variant);
		variantsBySlug.set(slug, variants);
	};

	for (const tag of tags) addVariant(tag.name);
	for (const post of posts) {
		for (const tag of post.tags) addVariant(tag);
	}

	for (const post of posts) {
		// 同一篇文章内重复写同一 slug 的多个变体，只给文章数加一次；
		// 同一写法重复出现也只算一次，避免展示名被单篇重复标签带偏
		const slugsInPost = new Set<string>();
		const variantsInPost = new Set<string>();
		for (const tag of post.tags) {
			const variant = tag.trim();
			const slug = normalizeTagSlug(variant);
			if (!variant || !slug) continue;
			slugsInPost.add(slug);
			if (variantsInPost.has(variant)) continue;
			variantsInPost.add(variant);
			const counts = variantCounts.get(slug) ?? new Map<string, number>();
			counts.set(variant, (counts.get(variant) ?? 0) + 1);
			variantCounts.set(slug, counts);
		}
		for (const slug of slugsInPost) {
			postCounts.set(slug, (postCounts.get(slug) ?? 0) + 1);
		}
	}

	const groups: TagSlugGroup[] = [];
	for (const [slug, variants] of variantsBySlug) {
		const list = [...variants].sort((a, b) => a.localeCompare(b, "zh-CN"));
		const counts = variantCounts.get(slug);
		let name = list[0] ?? slug;
		if (counts) {
			let best = -1;
			for (const variant of list) {
				const count = counts.get(variant) ?? 0;
				if (count > best) {
					best = count;
					name = variant;
				}
			}
		}
		groups.push({
			slug,
			name,
			variants: list,
			count: postCounts.get(slug) ?? 0,
		});
	}

	groups.sort(
		(a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"),
	);
	return groups;
}

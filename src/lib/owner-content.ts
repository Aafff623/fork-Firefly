import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export const OWNER_POST_MAX_BYTES = 1_500_000;

export type OwnerSourceValidation =
	| Readonly<{ ok: true }>
	| Readonly<{ ok: false; error: string }>;

export type OwnerPostFile = Readonly<{
	absolutePath: string;
	relativePath: string;
	source: string;
	baseSha: string;
}>;

export function normalizeOwnerSlug(value: string): string | null {
	const slug = value
		.trim()
		.replace(/\\/g, "/")
		.replace(/^\/+|\/+$/g, "");
	if (
		!slug ||
		slug.includes("..") ||
		!/^[a-z0-9][a-z0-9-]{0,180}$/i.test(slug)
	) {
		return null;
	}
	return slug;
}

export async function contentSha256(
	value: string | Uint8Array,
): Promise<string> {
	const bytes =
		typeof value === "string" ? new TextEncoder().encode(value) : value;
	const digestInput = new Uint8Array(bytes.byteLength);
	digestInput.set(bytes);
	const digest = new Uint8Array(
		await crypto.subtle.digest("SHA-256", digestInput.buffer),
	);
	return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function validateOwnerPostSource(source: string): OwnerSourceValidation {
	if (
		!source ||
		new TextEncoder().encode(source).byteLength > OWNER_POST_MAX_BYTES
	) {
		return { ok: false, error: "source_too_large" };
	}
	if (!source.startsWith("---")) {
		return { ok: false, error: "frontmatter_required" };
	}
	try {
		const parsed = matter(source);
		const data = parsed.data as Record<string, unknown>;
		if (typeof data.title !== "string" || !data.title.trim()) {
			return { ok: false, error: "title_required" };
		}
		if (
			!(data.published instanceof Date) ||
			Number.isNaN(data.published.getTime())
		) {
			return { ok: false, error: "published_required" };
		}
		if (
			data.updated !== undefined &&
			(!(data.updated instanceof Date) || Number.isNaN(data.updated.getTime()))
		) {
			return { ok: false, error: "updated_must_be_date" };
		}
		for (const field of ["tags", "themeTags", "collections"]) {
			const value = data[field];
			if (
				value !== undefined &&
				(!Array.isArray(value) ||
					value.some((item) => typeof item !== "string"))
			) {
				return { ok: false, error: `${field}_must_be_string_array` };
			}
		}
		for (const field of ["draft", "pinned", "comment"]) {
			if (data[field] !== undefined && typeof data[field] !== "boolean") {
				return { ok: false, error: `${field}_must_be_boolean` };
			}
		}
		for (const field of [
			"description",
			"image",
			"lang",
			"author",
			"sourceLink",
			"licenseName",
			"licenseUrl",
			"password",
			"passwordHint",
			"prevTitle",
			"prevSlug",
			"nextTitle",
			"nextSlug",
		]) {
			if (data[field] !== undefined && typeof data[field] !== "string") {
				return { ok: false, error: `${field}_must_be_string` };
			}
		}
		if (
			data.category !== undefined &&
			data.category !== null &&
			typeof data.category !== "string"
		) {
			return { ok: false, error: "category_must_be_string_or_null" };
		}
		return { ok: true };
	} catch {
		return { ok: false, error: "invalid_frontmatter" };
	}
}

export function ownerPostImageTarget(post: OwnerPostFile): Readonly<{
	directory: string;
	markdownPrefix: string;
}> {
	const fileName = path.basename(post.absolutePath);
	if (/^index\.mdx?$/i.test(fileName)) {
		return {
			directory: path.join(path.dirname(post.absolutePath), "images"),
			markdownPrefix: "./images",
		};
	}
	const slug = path.basename(fileName, path.extname(fileName));
	return {
		directory: path.join(path.dirname(post.absolutePath), slug, "images"),
		markdownPrefix: `./${slug}/images`,
	};
}

function postsRoot(): string {
	return path.join(process.cwd(), "src", "content", "posts");
}

async function exists(absolutePath: string): Promise<boolean> {
	try {
		await fs.access(absolutePath);
		return true;
	} catch {
		return false;
	}
}

export async function findOwnerPost(
	slugValue: string,
): Promise<OwnerPostFile | null> {
	const slug = normalizeOwnerSlug(slugValue);
	if (!slug) return null;
	const root = postsRoot();
	const candidates = [
		path.join(root, `${slug}.md`),
		path.join(root, `${slug}.mdx`),
		path.join(root, slug, "index.md"),
		path.join(root, slug, "index.mdx"),
	];
	for (const absolutePath of candidates) {
		if (!(await exists(absolutePath))) continue;
		const source = await fs.readFile(absolutePath, "utf8");
		return {
			absolutePath,
			relativePath: path
				.relative(process.cwd(), absolutePath)
				.replace(/\\/g, "/"),
			source,
			baseSha: await contentSha256(source),
		};
	}
	return null;
}

export async function atomicWriteOwnerPost(
	post: OwnerPostFile,
	source: string,
): Promise<string> {
	const validation = validateOwnerPostSource(source);
	if (!validation.ok) throw new Error(validation.error);
	const temporaryPath = `${post.absolutePath}.firefly-${crypto.randomUUID()}.tmp`;
	try {
		await fs.writeFile(temporaryPath, source, { encoding: "utf8", flag: "wx" });
		await fs.rename(temporaryPath, post.absolutePath);
	} catch (error) {
		await fs.rm(temporaryPath, { force: true }).catch(() => undefined);
		throw error;
	}
	return contentSha256(source);
}

export async function archiveOwnerPost(post: OwnerPostFile): Promise<string> {
	const fileName = path.basename(post.absolutePath);
	const slug = /^index\.mdx?$/i.test(fileName)
		? path.basename(path.dirname(post.absolutePath))
		: path.basename(fileName, path.extname(fileName));
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const archiveDirectory = path.join(
		process.cwd(),
		"src",
		"content",
		"_owner_archive",
		`${slug}-${timestamp}`,
	);
	await fs.mkdir(path.dirname(archiveDirectory), { recursive: true });
	if (/^index\.mdx?$/i.test(fileName)) {
		await fs.rename(path.dirname(post.absolutePath), archiveDirectory);
	} else {
		await fs.mkdir(archiveDirectory, { recursive: false });
		await fs.rename(post.absolutePath, path.join(archiveDirectory, fileName));
		const sidecarDirectory = path.join(path.dirname(post.absolutePath), slug);
		if (await exists(sidecarDirectory)) {
			await fs.rename(sidecarDirectory, path.join(archiveDirectory, slug));
		}
	}
	return path.relative(process.cwd(), archiveDirectory).replace(/\\/g, "/");
}

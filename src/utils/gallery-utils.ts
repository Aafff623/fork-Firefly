import fs from "node:fs";
import path from "node:path";
import { galleryConfig } from "@/config/galleryConfig";
import type { GalleryAlbum, GalleryPhotoMeta } from "@/types/galleryConfig";
import { url } from "@/utils/url-utils";

function withBase(assetPath: string): string {
	if (!assetPath) return "";
	if (/^(https?:)?\/\//i.test(assetPath) || /^(data|blob):/i.test(assetPath)) {
		return assetPath;
	}
	const normalizedPath = assetPath.startsWith("/")
		? assetPath
		: `/${assetPath}`;
	const base = import.meta.env?.BASE_URL || "/";
	if (base !== "/" && normalizedPath.startsWith(base)) {
		return normalizedPath;
	}
	if (!base || base === "/") return normalizedPath;
	return url(normalizedPath);
}

export type GalleryPhotoEntry = {
	src: string;
	file: string;
	publishedAt?: string;
	tags: string[];
	caption?: string;
};

function albumDir(albumId: string): string {
	return path.join(process.cwd(), "public", "gallery", albumId);
}

/** 读取 photos.json；缺文件或坏 JSON 时返回空表 */
export function loadAlbumPhotoMeta(albumId: string): Map<string, GalleryPhotoMeta> {
	const metaPath = path.join(albumDir(albumId), "photos.json");
	const map = new Map<string, GalleryPhotoMeta>();
	if (!fs.existsSync(metaPath)) return map;
	try {
		const raw = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as unknown;
		const list = Array.isArray(raw)
			? raw
			: raw &&
					typeof raw === "object" &&
					Array.isArray((raw as { photos?: unknown }).photos)
				? (raw as { photos: GalleryPhotoMeta[] }).photos
				: [];
		for (const item of list) {
			if (!item || typeof item !== "object") continue;
			const file = String((item as GalleryPhotoMeta).file || "").trim();
			if (!file) continue;
			map.set(file, item as GalleryPhotoMeta);
			// 也用 basename 索引本地文件
			const base = path.basename(file);
			if (base !== file) map.set(base, item as GalleryPhotoMeta);
		}
	} catch {
		return map;
	}
	return map;
}

/**
 * 扫描相册目录中的所有图片（含 urls.txt），按 photos.json 的 publishedAt 降序；
 * 无侧车时：cover.* 置顶，其余文件名字母序，远程 URL 在后。
 */
export function scanAlbumPhotoEntries(albumId: string): GalleryPhotoEntry[] {
	const dir = albumDir(albumId);
	if (!fs.existsSync(dir)) return [];
	const metaMap = loadAlbumPhotoMeta(albumId);

	const files = fs
		.readdirSync(dir)
		.filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
		.sort();
	const coverIdx = files.findIndex((f) => /^cover\./i.test(f));
	if (coverIdx > 0) {
		const [coverFile] = files.splice(coverIdx, 1);
		files.unshift(coverFile);
	}

	const localEntries: GalleryPhotoEntry[] = files.map((f) => {
		const m = metaMap.get(f);
		return {
			src: withBase(`/gallery/${albumId}/${f}`),
			file: f,
			publishedAt: m?.publishedAt,
			tags: m?.tags ?? [],
			caption: m?.caption,
		};
	});

	const urlsFile = path.join(dir, "urls.txt");
	let remoteEntries: GalleryPhotoEntry[] = [];
	if (fs.existsSync(urlsFile)) {
		remoteEntries = fs
			.readFileSync(urlsFile, "utf-8")
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith("#"))
			.map((remoteUrl) => {
				const m = metaMap.get(remoteUrl) || metaMap.get(path.basename(remoteUrl));
				return {
					src: remoteUrl,
					file: remoteUrl,
					publishedAt: m?.publishedAt,
					tags: m?.tags ?? [],
					caption: m?.caption,
				};
			});
	}

	const entries = [...localEntries, ...remoteEntries];
	const hasDates = entries.some((e) => e.publishedAt);
	if (!hasDates) return entries;

	return [...entries].sort((a, b) => {
		const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
		const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
		if (tb !== ta) return tb - ta;
		return a.file.localeCompare(b.file);
	});
}

/**
 * 扫描相册目录中的所有图片文件（URL 列表，兼容旧调用方）
 */
export function scanAlbumPhotos(albumId: string): string[] {
	return scanAlbumPhotoEntries(albumId).map((e) => e.src);
}

/**
 * 无限画布同源图：本地相册 + public/gallery/_demo/artworks（外链不进 WebGL）
 */
export function listExplorerPhotos(): string[] {
	const localAlbumPhotos = galleryConfig.albums.flatMap((album) =>
		scanAlbumPhotoEntries(album.id)
			.map((e) => e.src)
			.filter((src) => !/^https?:\/\//i.test(src)),
	);
	const demoDir = path.join(
		process.cwd(),
		"public",
		"gallery",
		"_demo",
		"artworks",
	);
	const demoArtworks = fs.existsSync(demoDir)
		? fs
				.readdirSync(demoDir)
				.filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
				.sort()
				.map((f) => withBase(`/gallery/_demo/artworks/${f}`))
		: [];
	if (localAlbumPhotos.length + demoArtworks.length > 0) {
		return [...localAlbumPhotos, ...demoArtworks];
	}
	return Array.from({ length: 7 }, (_, i) =>
		withBase(`/gallery/_demo/placeholders/ph-0${i + 1}.svg`),
	);
}

/**
 * 获取相册封面图
 * 优先级：手动指定 > cover.* 文件 > 第一张图片
 */
export function getAlbumCover(album: GalleryAlbum, photos: string[]): string {
	if (album.cover) return withBase(album.cover);
	const coverFile = photos.find((p) => /\/cover\./i.test(p));
	return coverFile || photos[0] || "";
}

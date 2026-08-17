/**
 * Drives shipped listExplorerPhotos() — not a reimplementation.
 * Run: npx tsx scripts/test-list-explorer-photos.ts
 */
import { listExplorerPhotos } from "../src/utils/gallery-utils";

const photos = listExplorerPhotos();
if (!Array.isArray(photos) || photos.length === 0) {
	console.error("FAIL listExplorerPhotos returned empty/non-array", photos);
	process.exit(1);
}
const bad = photos.filter((p) => typeof p !== "string" || !p.includes("/gallery/"));
if (bad.length) {
	console.error("FAIL unexpected photo urls", bad.slice(0, 5));
	process.exit(1);
}
console.log(`PASS listExplorerPhotos n=${photos.length} first=${photos[0]}`);

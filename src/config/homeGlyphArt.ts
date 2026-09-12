export const homeGlyphArtText = "Welcome to threetwoa's blog";

export const homeGlyphArtLines = ["Welcome", "to threetwoa's blog"] as const;

export type HomeGlyphArt = {
	char: string;
	assetHeight: number;
	assetMaxWidth: number;
	assetOffset: number;
	variants: Array<{ src: string; rotation: number; scale: number }>;
};

const homeGlyphAssetRoot = "/assets/glyphs/home-welcome-to-threetwoa";

const asset = (
	char: string,
	file: string,
	rotation: number,
	scale = 1,
	assetHeight = 1.122,
	assetMaxWidth = 1.377,
	assetOffset = 0,
): HomeGlyphArt => ({
	char,
	assetHeight,
	assetMaxWidth,
	assetOffset,
	variants: [{ src: `${homeGlyphAssetRoot}/${file}`, rotation, scale }],
});

/**
 * One manifest entry exists for every non-space character position in the
 * two-line banner. Repeated characters intentionally keep separate entries so
 * each position can have its own rotation/scale without changing the text.
 */
export const homeGlyphArt: HomeGlyphArt[] = [
	asset("W", "W-ribbons.png", -2.4, 1.02, 1.122, 1.377),
	asset("e", "e-original.png", 1.6, 1.02, 1.122, 1.377),
	asset("l", "l-vine.png", -1.2, 0.96, 1.28, 1.22),
	asset("c", "c-original.png", 2.2, 1.04, 1.122, 1.377),
	asset("o", "o-cat.png", -1.8, 1.02, 1.18, 1.44),
	asset("m", "m-original.png", 1.4, 1.02, 1.122, 1.52),
	asset("e", "e-original.png", -2.1, 0.98, 1.122, 1.377),
	asset("t", "t-original.png", 2.1, 1.02, 1.122, 1.377),
	asset("o", "o-cat.png", -1.5, 0.98, 1.18, 1.44),
	asset("t", "t-original-2.webp", 2.4, 0.98, 1.122, 1.377),
	asset("h", "h-original.png", -1.7, 1.02, 1.122, 1.377),
	asset("r", "r-fox.png", 1.6, 1.04, 1.3, 1.28),
	asset("e", "e-original.png", -2.2, 1.03, 1.122, 1.377),
	asset("e", "e-original.png", 1.2, 0.95, 1.122, 1.377),
	asset("t", "t-original.png", -1.4, 1, 1.122, 1.377),
	asset("w", "w-caterpillars.png", 2.1, 1.02, 1.16, 1.5),
	asset("o", "o-cat.png", -1.8, 1, 1.18, 1.44),
	asset("a", "a-original.png", 1.5, 1.02, 1.122, 1.377),
	asset("'", "apostrophe-feather.png", -3.2, 0.88, 0.72, 0.72, 0.08),
	asset("s", "s-original.png", 2.2, 1.02, 1.122, 1.377),
	asset("b", "b-bear-honey.png", -2.1, 1.02, 1.34, 1.46),
	asset("l", "l-vine.png", 1.2, 0.96, 1.28, 1.22),
	asset("o", "o-cat.png", -1.4, 1.02, 1.18, 1.44),
	asset("g", "g-original.png", 2.1, 1.03, 1.22, 1.46),
];

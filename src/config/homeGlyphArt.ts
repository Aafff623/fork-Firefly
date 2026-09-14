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
const homeGlyphArtBase: HomeGlyphArt[] = [
	asset("W", "W-ribbons.webp", -2.4, 1.02, 1.122, 1.377),
	asset("e", "e-original.webp", 1.6, 1.02, 1.122, 1.377),
	asset("l", "l-vine.webp", -1.2, 0.96, 1.28, 1.22),
	asset("c", "c-original.webp", 2.2, 1.04, 1.122, 1.377),
	asset("o", "o-cat.webp", -1.8, 1.02, 1.18, 1.44),
	asset("m", "m-original.webp", 1.4, 1.02, 1.122, 1.52),
	asset("e", "e-original.webp", -2.1, 0.98, 1.122, 1.377),
	asset("t", "t-original.webp", 2.1, 1.02, 1.122, 1.377),
	asset("o", "o-cat.webp", -1.5, 0.98, 1.18, 1.44),
	asset("t", "t-original-2.webp", 2.4, 0.98, 1.122, 1.377),
	asset("h", "h-original.webp", -1.7, 1.02, 1.122, 1.377),
	asset("r", "r-fox.webp", 1.6, 1.04, 1.3, 1.28),
	asset("e", "e-original.webp", -2.2, 1.03, 1.122, 1.377),
	asset("e", "e-original.webp", 1.2, 0.95, 1.122, 1.377),
	asset("t", "t-original.webp", -1.4, 1, 1.122, 1.377),
	asset("w", "w-caterpillars.webp", 2.1, 1.02, 1.16, 1.5),
	asset("o", "o-cat.webp", -1.8, 1, 1.18, 1.44),
	asset("a", "a-original.webp", 1.5, 1.02, 1.122, 1.377),
	asset("'", "apostrophe-feather.webp", -3.2, 0.88, 0.72, 0.72, 0.08),
	asset("s", "s-original.webp", 2.2, 1.02, 1.122, 1.377),
	asset("b", "b-bear-honey.webp", -2.1, 1.02, 1.34, 1.46),
	asset("l", "l-vine.webp", 1.2, 0.96, 1.28, 1.22),
	asset("o", "o-cat.webp", -1.4, 1.02, 1.18, 1.44),
	asset("g", "g-original.webp", 2.1, 1.03, 1.22, 1.46),
];

type SecondaryVariant = {
	file: string;
	rotation: number;
	scale?: number;
};

/**
 * The second visual treatment is keyed by the first asset rather than by
 * character. Repeated positions can therefore share a coherent alternate
 * style while still retaining their own first-image geometry.
 */
const secondaryVariantByFirstFile: Record<string, SecondaryVariant> = {
	"W-ribbons.webp": { file: "W-ribbons-2.webp", rotation: 2.1, scale: 1.02 },
	"e-original.webp": { file: "e-shell.webp", rotation: -2.2, scale: 1.01 },
	"l-vine.webp": { file: "l-vine-2.webp", rotation: 1.7, scale: 0.98 },
	"c-original.webp": { file: "c-koi.webp", rotation: -1.8, scale: 1.02 },
	"o-cat.webp": { file: "o-kitten.webp", rotation: 2.2, scale: 1.01 },
	"m-original.webp": { file: "m-mushrooms.webp", rotation: -2, scale: 1.01 },
	"t-original.webp": { file: "t-teapot.webp", rotation: -1.8, scale: 1 },
	"t-original-2.webp": { file: "t-teapot.webp", rotation: -1.8, scale: 1 },
	"h-original.webp": { file: "h-lantern.webp", rotation: 1.4, scale: 0.98 },
	"r-fox.webp": { file: "r-redpanda.webp", rotation: -1.9, scale: 1.02 },
	"w-caterpillars.webp": { file: "w-hummingbirds.webp", rotation: -2.2, scale: 1.01 },
	"a-original.webp": { file: "a-strawberry.webp", rotation: -1.6, scale: 1.01 },
	"apostrophe-feather.webp": { file: "apostrophe-leaf.webp", rotation: 3, scale: 0.9 },
	"s-original.webp": { file: "s-ribbon-shell.webp", rotation: 1.7, scale: 1 },
	"b-bear-honey.webp": { file: "b-bunny-jam.webp", rotation: 1.8, scale: 1.01 },
	"g-original.webp": { file: "g-dragon-ring.webp", rotation: -1.9, scale: 1.02 },
};

export const homeGlyphArt: HomeGlyphArt[] = homeGlyphArtBase.map((entry) => {
	const firstSource = entry.variants[0]?.src ?? "";
	const firstFile = firstSource.slice(firstSource.lastIndexOf("/") + 1);
	const secondary = secondaryVariantByFirstFile[firstFile];
	if (!secondary) return entry;

	return {
		...entry,
		variants: [
			...entry.variants,
			{
				src: `${homeGlyphAssetRoot}/${secondary.file}`,
				rotation: secondary.rotation,
				scale: secondary.scale ?? 1,
			},
		],
	};
});

/**
 * 主页标题、分行规则和逐字素材必须同步。这里在模块加载时校验，避免标题被改动后
 * 页面静默退回普通花体字，直到线上截图才发现特效失效。
 */
const homeGlyphCharacters = Array.from(homeGlyphArtText).filter((char) => !/\s/u.test(char));
const homeGlyphLineText = homeGlyphArtLines.join(" ");
const configuredGlyphCharacters = homeGlyphArt.map((entry) => entry.char);

if (homeGlyphLineText !== homeGlyphArtText) {
	throw new Error(
		`[homeGlyphArt] homeGlyphArtLines must join to "${homeGlyphArtText}", received "${homeGlyphLineText}".`,
	);
}

if (
	configuredGlyphCharacters.length !== homeGlyphCharacters.length ||
	configuredGlyphCharacters.some((char, index) => char !== homeGlyphCharacters[index])
) {
	throw new Error(
		`[homeGlyphArt] glyph entries must exactly match "${homeGlyphArtText}" character by character.`,
	);
}

if (homeGlyphArt.some((entry) => entry.variants.length === 0 || entry.variants.some((variant) => !variant.src))) {
	throw new Error("[homeGlyphArt] every glyph entry must provide at least one image source.");
}

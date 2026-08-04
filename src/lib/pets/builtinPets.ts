/**
 * Built-in site pets (spritesheet atlas).
 * Dual DeepSeek theme: Maid (browse) + OpenPet (post).
 */

export type PetAtlasVariant = "v2" | "classic-8x9";

export type BuiltinPetId = "maid-deepseek-whale" | "openpet-deepseek";

export type BuiltinPet = {
	id: BuiltinPetId;
	displayName: string;
	description: string;
	spritesheetPath: string;
	accent: string;
	/** v2 = 8×11 with look rows; classic-8x9 = 8×9 no look */
	atlasVariant: PetAtlasVariant;
};

export const BUILTIN_PETS: readonly BuiltinPet[] = [
	{
		id: "maid-deepseek-whale",
		displayName: "Maid DeepSeek Whale",
		description: "蓝发鲸女仆 chibi，浏览态默认桌宠（Atlas v2）。",
		spritesheetPath: "/pets/maid-deepseek-whale/spritesheet.webp",
		accent: "#5eb8ff",
		atlasVariant: "v2",
	},
	{
		id: "openpet-deepseek",
		displayName: "OpenPet DeepSeek",
		description: "蓝发蓝白裙 DeepSeek 娘，文章页桌宠（classic 8×9）。",
		spritesheetPath: "/pets/openpet-deepseek/spritesheet.webp",
		accent: "#7dd3c0",
		atlasVariant: "classic-8x9",
	},
] as const;

export function findBuiltinPet(id: string): BuiltinPet {
	return BUILTIN_PETS.find((pet) => pet.id === id) ?? BUILTIN_PETS[0];
}

/** Browse = Maid; article `/posts/` = OpenPet */
export function resolvePetIdForPath(
	pathname: string,
	defaultPetId: BuiltinPetId,
	postPetId: BuiltinPetId,
): BuiltinPetId {
	return /\/posts\//.test(pathname) ? postPetId : defaultPetId;
}

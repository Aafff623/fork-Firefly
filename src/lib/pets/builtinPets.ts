/**
 * Built-in pets from cc-haha (MIT).
 * Source: https://github.com/NanmiCoder/cc-haha
 */

export type BuiltinPetId =
	| "dada-code"
	| "huhu-plan"
	| "bubu-fix"
	| "huihui-build";

export type BuiltinPet = {
	id: BuiltinPetId;
	displayName: string;
	description: string;
	spritesheetPath: string;
	accent: string;
};

export const BUILTIN_PETS: readonly BuiltinPet[] = [
	{
		id: "dada-code",
		displayName: "搭搭 Dada",
		description: "沉稳的协作机器人，陪你把想法一块块搭起来。",
		spritesheetPath: "/pets/dada-code/spritesheet.webp",
		accent: "#4fd1b6",
	},
	{
		id: "huhu-plan",
		displayName: "弧弧 Huhu",
		description: "拿着铅笔和计划本的路线机器人，复杂任务也能找到出口。",
		spritesheetPath: "/pets/huhu-plan/spritesheet.webp",
		accent: "#6ea8ff",
	},
	{
		id: "bubu-fix",
		displayName: "补补 Bubu",
		description: "举着修补扳手的小机器人，最擅长发现并修好裂缝。",
		spritesheetPath: "/pets/bubu-fix/spritesheet.webp",
		accent: "#ff9a76",
	},
	{
		id: "huihui-build",
		displayName: "回回 Huihui",
		description: "抱着构建齿轮的小机器人，新回复一到就精神满满。",
		spritesheetPath: "/pets/huihui-build/spritesheet.webp",
		accent: "#9b8cff",
	},
] as const;

export function findBuiltinPet(id: string): BuiltinPet {
	return BUILTIN_PETS.find((pet) => pet.id === id) ?? BUILTIN_PETS[0];
}

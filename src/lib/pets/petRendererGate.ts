/**
 * 桌宠渲染门：文章页窄屏不拉 spritesheet，但生命周期仍要能在
 * skip → 浏览态 / 变宽 之后启动真实 renderer。
 */

export type PetRendererContext = {
	hideOnMobilePost: boolean;
	pathname: string;
	viewportWidth: number;
	mobileBreakpoint: number;
};

export function isPostPetPath(pathname: string): boolean {
	return /\/posts\//.test(pathname);
}

export function shouldSkipPetSheet(ctx: PetRendererContext): boolean {
	return (
		ctx.hideOnMobilePost &&
		isPostPetPath(ctx.pathname) &&
		ctx.viewportWidth <= ctx.mobileBreakpoint
	);
}

export type PetRendererStart = () => void | Promise<void>;

export type PetRendererGateDecision =
	| "skip"
	| "start"
	| "keep-running"
	| "keep-skipped";

export function createPetRendererGate(startRenderer: PetRendererStart) {
	let started = false;

	return {
		get started(): boolean {
			return started;
		},
		evaluate(ctx: PetRendererContext): PetRendererGateDecision {
			const skip = shouldSkipPetSheet(ctx);
			if (skip) return started ? "keep-running" : "skip";
			if (started) return "keep-running";
			started = true;
			void startRenderer();
			return "start";
		},
	};
}

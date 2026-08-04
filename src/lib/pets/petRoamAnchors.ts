/**
 * Browse-mode pet roam: park on sidebar card *outer* edges (page margin gutters).
 * Left column → card bottom-left (page left空白) · face right toward content.
 * Right column → card bottom-right (page right空白) · face left toward content.
 * Never sit on the inner edge covering card text.
 */

import type { PetAnimationState } from "@/lib/pets/petAnimation";

export type PetRoamAnchorId =
	| "dynamics"
	| "announcement"
	| "hotPosts"
	| "stats"
	| "profile"
	| "tags"
	| "calendar"
	| "clock";

/** Corner of the card to sit on (outer edge only in practice) */
export type PetRoamCorner = "bottom-left" | "bottom-right";

/** Which way the pet should face while parked (toward main content) */
export type PetRoamFacing = "left" | "right";

export type PetRoamColumn = "left" | "right" | "auto";

export type PetRoamAnchorDef = Readonly<{
	id: PetRoamAnchorId;
	/** CSS selectors tried in order */
	selectors: readonly string[];
	/** Which sidebar this widget usually lives in */
	column: PetRoamColumn;
	arrivalAction: PetAnimationState;
}>;

export const PET_ROAM_ANCHORS: readonly PetRoamAnchorDef[] = [
	{
		id: "dynamics",
		selectors: [
			"#latest-dynamics:not(.dynamics-widget--dismissed):not(.dynamics-widget--pending)",
			"widget-layout.dynamics-widget:not(.dynamics-widget--dismissed):not(.dynamics-widget--pending)",
		],
		column: "right",
		arrivalAction: "waiting",
	},
	{
		id: "announcement",
		selectors: ["#announcement", "widget-layout.announcement-widget"],
		column: "left",
		arrivalAction: "waving",
	},
	{
		id: "hotPosts",
		selectors: ["#hot-posts", "widget-layout.hot-posts-widget"],
		column: "left",
		arrivalAction: "review",
	},
	{
		id: "stats",
		selectors: ["#site-stats", "widget-layout.site-overview-widget"],
		column: "right",
		arrivalAction: "review",
	},
	{
		id: "profile",
		selectors: [".profile-widget"],
		column: "left",
		arrivalAction: "waving",
	},
	{
		id: "tags",
		selectors: ["#tags", "widget-layout.tags-widget"],
		column: "left",
		arrivalAction: "waiting",
	},
	{
		id: "calendar",
		selectors: ["#calendar-widget", "widget-layout.calendar-notebook-widget"],
		column: "right",
		arrivalAction: "jumping",
	},
	{
		id: "clock",
		selectors: [
			"#surprise-clock-root",
			"#surprise-clock",
			"[data-id='clock-corner']",
		],
		column: "right",
		arrivalAction: "waving",
	},
] as const;

export type PetRoamResolvedAnchor = Readonly<{
	id: PetRoamAnchorId;
	el: HTMLElement;
	x: number;
	y: number;
	corner: PetRoamCorner;
	/** Face toward content: left-gutter → right, right-gutter → left */
	facing: PetRoamFacing;
	arrivalAction: PetAnimationState;
}>;

const MIN_VISIBLE_PX = 40;
/** Keep a little inset from the card edge so feet sit on the corner */
const EDGE_INSET = 6;

export function isElementUsableInViewport(el: Element): boolean {
	if (!(el instanceof HTMLElement)) return false;
	const style = window.getComputedStyle(el);
	if (style.display === "none" || style.visibility === "hidden") return false;
	if (Number.parseFloat(style.opacity || "1") < 0.05) return false;

	const r = el.getBoundingClientRect();
	const vh = window.innerHeight;
	const vw = window.innerWidth;
	const visibleH = Math.min(r.bottom, vh) - Math.max(r.top, 0);
	const visibleW = Math.min(r.right, vw) - Math.max(r.left, 0);
	return visibleH >= MIN_VISIBLE_PX && visibleW >= MIN_VISIBLE_PX;
}

function resolveElement(def: PetRoamAnchorDef): HTMLElement | null {
	for (const selector of def.selectors) {
		const el = document.querySelector(selector);
		if (el instanceof HTMLElement && isElementUsableInViewport(el)) {
			return el;
		}
	}
	return null;
}

/** Resolve left/right column from config or element center. */
export function resolveColumn(
	def: PetRoamAnchorDef,
	el: HTMLElement,
): "left" | "right" {
	if (def.column === "left" || def.column === "right") return def.column;
	const r = el.getBoundingClientRect();
	return r.left + r.width / 2 < window.innerWidth / 2 ? "left" : "right";
}

/**
 * Outer corner only — sit in page side gutters, not on card text.
 * left sidebar → bottom-left; right sidebar → bottom-right.
 */
export function pickCardCorner(column: "left" | "right"): PetRoamCorner {
	return column === "left" ? "bottom-left" : "bottom-right";
}

/** Parked facing: always look inward at the content. */
export function facingForCorner(corner: PetRoamCorner): PetRoamFacing {
	return corner === "bottom-left" ? "right" : "left";
}

export function computeCardCornerPoint(
	el: HTMLElement,
	corner: PetRoamCorner,
	petWidth: number,
	petHeight: number,
): { x: number; y: number } {
	const r = el.getBoundingClientRect();
	const y = r.bottom - petHeight * 0.82;
	if (corner === "bottom-left") {
		return {
			x: r.left + EDGE_INSET - petWidth * 0.12,
			y,
		};
	}
	return {
		x: r.right - petWidth + EDGE_INSET + petWidth * 0.12,
		y,
	};
}

function softClampToViewport(
	x: number,
	y: number,
	petWidth: number,
	petHeight: number,
): { x: number; y: number } {
	const pad = 4;
	const maxX = Math.max(pad, window.innerWidth - petWidth - pad);
	const maxY = Math.max(pad, window.innerHeight - petHeight - pad);
	return {
		x: Math.min(maxX, Math.max(pad, x)),
		y: Math.min(maxY, Math.max(pad, y)),
	};
}

/** All roam anchors that currently intersect the viewport with enough area. */
export function listVisibleRoamAnchors(
	petWidth: number,
	petHeight: number,
): PetRoamResolvedAnchor[] {
	if (typeof document === "undefined") return [];
	const out: PetRoamResolvedAnchor[] = [];
	for (const def of PET_ROAM_ANCHORS) {
		const el = resolveElement(def);
		if (!el) continue;
		const column = resolveColumn(def, el);
		const corner = pickCardCorner(column);
		const raw = computeCardCornerPoint(el, corner, petWidth, petHeight);
		const point = softClampToViewport(raw.x, raw.y, petWidth, petHeight);
		out.push({
			id: def.id,
			el,
			x: point.x,
			y: point.y,
			corner,
			facing: facingForCorner(corner),
			arrivalAction: def.arrivalAction,
		});
	}
	return out;
}

export function pickNextRoamAnchor(
	visible: readonly PetRoamResolvedAnchor[],
	currentId: PetRoamAnchorId | null,
): PetRoamResolvedAnchor | null {
	if (visible.length === 0) return null;
	const others = currentId
		? visible.filter((a) => a.id !== currentId)
		: [...visible];
	const pool = others.length > 0 ? others : [...visible];
	return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function findVisibleAnchorById(
	id: PetRoamAnchorId,
	petWidth: number,
	petHeight: number,
): PetRoamResolvedAnchor | null {
	return (
		listVisibleRoamAnchors(petWidth, petHeight).find((a) => a.id === id) ??
		null
	);
}

/**
 * Stored drag positions that sit in the viewport bottom-right "dock"
 * are treated as legacy window-absolute parking — discard so card roam can resume.
 */
export function isViewportCornerPark(
	x: number,
	y: number,
	petWidth: number,
	petHeight: number,
): boolean {
	const marginX = 48;
	const marginY = 140;
	const nearRight = x >= window.innerWidth - petWidth - marginX;
	const nearBottom = y >= window.innerHeight - petHeight - marginY;
	return nearRight && nearBottom;
}

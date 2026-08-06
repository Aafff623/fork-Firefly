import type { ReactNode } from "react";

export type TimelineSize = "sm" | "md" | "lg";
export type TimelineStatus = "completed" | "in-progress" | "pending";
export type TimelineColor =
	| "primary"
	| "secondary"
	| "muted"
	| "accent"
	| "destructive";

export type TimelineSide = "left" | "right";

export interface TimelineElement {
	id: string | number;
	date: string;
	title: string;
	description: string;
	icon?: ReactNode | (() => ReactNode);
	status?: TimelineStatus;
	color?: TimelineColor;
	size?: TimelineSize;
	loading?: boolean;
	error?: string;
	side?: TimelineSide;
}

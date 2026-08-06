import type { MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { dynamicAnchor } from "@/utils/dynamic-utils";

export type DynamicNavItem = {
	id: string;
	published: number;
	title: string;
	pinned?: boolean;
};

export type DynamicNavLabels = {
	nav: string;
	pinned: string;
	today: string;
	yesterday: string;
	last7Days: string;
	older: string;
	empty: string;
	loading: string;
};

type NavDetail = {
	items: DynamicNavItem[];
	loading?: boolean;
};

type GroupKey = "pinned" | "today" | "yesterday" | "last7" | "older";

type Group = {
	key: GroupKey;
	label: string;
	items: Array<DynamicNavItem & { anchor: string }>;
};

const EVENT_NAME = "firefly:dynamic-nav";

function startOfLocalDay(ts: number): number {
	const d = new Date(ts);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}

function groupItems(
	items: DynamicNavItem[],
	labels: DynamicNavLabels,
): Group[] {
	const enriched = items.map((item) => ({
		...item,
		anchor: dynamicAnchor(item.id),
	}));
	const pinned = enriched.filter((item) => item.pinned);
	const rest = enriched.filter((item) => !item.pinned);

	const todayStart = startOfLocalDay(Date.now());
	const yesterdayStart = todayStart - 86_400_000;
	const weekStart = todayStart - 6 * 86_400_000;

	const today: typeof enriched = [];
	const yesterday: typeof enriched = [];
	const last7: typeof enriched = [];
	const older: typeof enriched = [];

	for (const item of rest) {
		const day = startOfLocalDay(item.published);
		if (day >= todayStart) today.push(item);
		else if (day >= yesterdayStart) yesterday.push(item);
		else if (day >= weekStart) last7.push(item);
		else older.push(item);
	}

	const groups: Group[] = [];
	if (pinned.length) {
		groups.push({ key: "pinned", label: labels.pinned, items: pinned });
	}
	if (today.length) {
		groups.push({ key: "today", label: labels.today, items: today });
	}
	if (yesterday.length) {
		groups.push({
			key: "yesterday",
			label: labels.yesterday,
			items: yesterday,
		});
	}
	if (last7.length) {
		groups.push({ key: "last7", label: labels.last7Days, items: last7 });
	}
	if (older.length) {
		groups.push({ key: "older", label: labels.older, items: older });
	}
	return groups;
}

function formatShortTime(published: number): string {
	const d = new Date(published);
	const now = new Date();
	if (
		d.getFullYear() === now.getFullYear() &&
		d.getMonth() === now.getMonth() &&
		d.getDate() === now.getDate()
	) {
		return d.toLocaleTimeString("zh-CN", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}
	return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DynamicNavPanel({
	labels,
}: {
	labels: DynamicNavLabels;
}) {
	const [items, setItems] = useState<DynamicNavItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeAnchor, setActiveAnchor] = useState("");
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const onNav = (event: Event) => {
			const detail = (event as CustomEvent<NavDetail>).detail;
			if (!detail) return;
			setItems(detail.items || []);
			setLoading(Boolean(detail.loading));
		};
		document.addEventListener(EVENT_NAME, onNav as EventListener);
		return () => {
			document.removeEventListener(EVENT_NAME, onNav as EventListener);
		};
	}, []);

	const groups = useMemo(() => groupItems(items, labels), [items, labels]);

	useEffect(() => {
		if (!items.length) {
			setActiveAnchor("");
			return;
		}

		const anchors = items.map((item) => dynamicAnchor(item.id));
		const visible = new Map<string, number>();

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = entry.target.id;
					if (!id) continue;
					if (entry.isIntersecting) {
						visible.set(id, entry.intersectionRatio);
					} else {
						visible.delete(id);
					}
				}
				let bestId = "";
				let bestRatio = 0;
				for (const [id, ratio] of visible) {
					if (ratio > bestRatio) {
						bestRatio = ratio;
						bestId = id;
					}
				}
				if (bestId) setActiveAnchor(bestId);
			},
			{
				root: null,
				rootMargin: "-18% 0px -55% 0px",
				threshold: [0, 0.15, 0.35, 0.55, 0.75],
			},
		);

		const observeAll = () => {
			observer.disconnect();
			visible.clear();
			for (const id of anchors) {
				const el = document.getElementById(id);
				if (el) observer.observe(el);
			}
		};

		observeAll();
		const retry = window.setTimeout(observeAll, 120);
		return () => {
			window.clearTimeout(retry);
			observer.disconnect();
		};
	}, [items]);

	useEffect(() => {
		if (!activeAnchor || !listRef.current) return;
		const active = listRef.current.querySelector<HTMLElement>(
			`[data-nav-anchor="${CSS.escape(activeAnchor)}"]`,
		);
		active?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [activeAnchor]);

	const onJump = (anchor: string) => (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		setActiveAnchor(anchor);
		if (decodeURIComponent(window.location.hash.slice(1)) === anchor) {
			document.getElementById(anchor)?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
			return;
		}
		window.location.hash = anchor;
	};

	if (loading && items.length === 0) {
		return (
			<p className="dynamic-nav__hint" role="status">
				{labels.loading}
			</p>
		);
	}

	if (!items.length) {
		return <p className="dynamic-nav__hint">{labels.empty}</p>;
	}

	return (
		<nav className="dynamic-nav" aria-label={labels.nav}>
			<div className="dynamic-nav__scroll" ref={listRef}>
				{groups.map((group) => (
					<section key={group.key} className="dynamic-nav__group">
						<h3 className="dynamic-nav__group-title">{group.label}</h3>
						<ul className="dynamic-nav__list">
							{group.items.map((item) => {
								const active = item.anchor === activeAnchor;
								return (
									<li key={item.id}>
										<a
											href={`#${item.anchor}`}
											data-nav-anchor={item.anchor}
											className={`dynamic-nav__item${active ? " is-active" : ""}`}
											aria-current={active ? "true" : undefined}
											onClick={onJump(item.anchor)}
											title={item.title}
										>
											<span className="dynamic-nav__item-title">{item.title}</span>
											<span className="dynamic-nav__item-time">
												{formatShortTime(item.published)}
											</span>
										</a>
									</li>
								);
							})}
						</ul>
					</section>
				))}
			</div>
		</nav>
	);
}

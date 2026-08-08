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

type NavTick = {
	key: string;
	anchor: string;
	dateLabel: string;
	title: string;
	pinned: boolean;
	published: number;
	year: number;
	month: number;
};

type MonthBucket = {
	id: string;
	year: number;
	month: number;
	title: string;
	ticks: NavTick[];
};

type YearBucket = {
	id: string;
	year: number;
	title: string;
	months: MonthBucket[];
};

const EVENT_NAME = "firefly:dynamic-nav";

function dayKeyOf(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthKeyOf(year: number, month: number): string {
	return `month-${year}-${String(month).padStart(2, "0")}`;
}

function yearKeyOf(year: number): string {
	return `year-${year}`;
}

function monthTitle(year: number, month: number): string {
	return new Intl.DateTimeFormat(undefined, { month: "long" }).format(
		new Date(year, month - 1, 1),
	);
}

function buildTicks(items: DynamicNavItem[]): NavTick[] {
	const seen = new Set<string>();
	const out: NavTick[] = [];
	for (const item of items) {
		const d = new Date(item.published);
		const dayKey = dayKeyOf(d);
		if (seen.has(dayKey)) continue;
		seen.add(dayKey);
		const year = d.getFullYear();
		const month = d.getMonth() + 1;
		out.push({
			key: dayKey,
			anchor: dynamicAnchor(item.id),
			dateLabel: `${String(month).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
			title: item.title,
			pinned: Boolean(item.pinned),
			published: item.published,
			year,
			month,
		});
	}
	return out;
}

/** 年 → 月 → 日：越远越靠折叠，侧栏只露当前年/月 */
function buildYearTree(ticks: NavTick[]): YearBucket[] {
	const years = new Map<number, Map<number, NavTick[]>>();
	for (const tick of ticks) {
		let months = years.get(tick.year);
		if (!months) {
			months = new Map();
			years.set(tick.year, months);
		}
		const list = months.get(tick.month) ?? [];
		list.push(tick);
		months.set(tick.month, list);
	}

	return [...years.keys()]
		.sort((a, b) => b - a)
		.map((year) => {
			const monthsMap = years.get(year)!;
			const months = [...monthsMap.keys()]
				.sort((a, b) => b - a)
				.map((month) => ({
					id: monthKeyOf(year, month),
					year,
					month,
					title: monthTitle(year, month),
					ticks: monthsMap.get(month)!,
				}));
			return {
				id: yearKeyOf(year),
				year,
				title: `${year}`,
				months,
			};
		});
}

export default function DynamicNavPanel({
	labels,
	initialItems,
}: {
	labels: DynamicNavLabels;
	initialItems?: DynamicNavItem[];
}) {
	const seeded = Array.isArray(initialItems);
	const [items, setItems] = useState<DynamicNavItem[]>(initialItems ?? []);
	const [loading, setLoading] = useState(!seeded);
	const [activeAnchor, setActiveAnchor] = useState("");
	const [expandedYears, setExpandedYears] = useState<Set<string>>(() => new Set());
	const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => new Set());
	const listRef = useRef<HTMLDivElement>(null);
	const didInitExpand = useRef(false);

	const years = useMemo(() => buildYearTree(buildTicks(items)), [items]);

	// 首次有数据：只展开「今年 + 当月」
	useEffect(() => {
		if (!years.length || didInitExpand.current) return;
		didInitExpand.current = true;
		const now = new Date();
		const yId = yearKeyOf(now.getFullYear());
		const mId = monthKeyOf(now.getFullYear(), now.getMonth() + 1);
		const yearExists = years.some((y) => y.id === yId);
		const fallbackYear = years[0];
		const openYearId = yearExists ? yId : fallbackYear.id;
		const openMonthId = yearExists
			? mId
			: (fallbackYear.months[0]?.id ?? "");
		setExpandedYears(new Set([openYearId]));
		setExpandedMonths(openMonthId ? new Set([openMonthId]) : new Set());
	}, [years]);

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

	// 滚到某条动态时，自动展开它所在的年/月
	useEffect(() => {
		if (!activeAnchor) return;
		for (const year of years) {
			for (const month of year.months) {
				if (!month.ticks.some((t) => t.anchor === activeAnchor)) continue;
				setExpandedYears((prev) => {
					if (prev.has(year.id)) return prev;
					const next = new Set(prev);
					next.add(year.id);
					return next;
				});
				setExpandedMonths((prev) => {
					if (prev.has(month.id)) return prev;
					const next = new Set(prev);
					next.add(month.id);
					return next;
				});
				return;
			}
		}
	}, [activeAnchor, years]);

	useEffect(() => {
		if (!activeAnchor || !listRef.current) return;
		const list = listRef.current;
		const active = list.querySelector<HTMLElement>(
			`[data-nav-anchor="${CSS.escape(activeAnchor)}"]`,
		);
		if (!active) return;
		const delta =
			active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2;
		list.scrollTo({ top: delta, behavior: "smooth" });
	}, [activeAnchor, expandedYears, expandedMonths]);

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

	const toggleYear = (yearId: string) => {
		setExpandedYears((prev) => {
			const next = new Set(prev);
			if (next.has(yearId)) next.delete(yearId);
			else next.add(yearId);
			return next;
		});
	};

	const toggleMonth = (monthId: string) => {
		setExpandedMonths((prev) => {
			const next = new Set(prev);
			if (next.has(monthId)) next.delete(monthId);
			else next.add(monthId);
			return next;
		});
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
				{years.map((year) => {
					const yearOpen = expandedYears.has(year.id);
					const yearCount = year.months.reduce(
						(sum, m) => sum + m.ticks.length,
						0,
					);
					return (
						<section key={year.id} className="dynamic-nav__year">
							<button
								type="button"
								className={`dynamic-nav__fold is-year${yearOpen ? " is-open" : ""}`}
								aria-expanded={yearOpen}
								onClick={() => toggleYear(year.id)}
							>
								<span className="dynamic-nav__fold-label">{year.title}</span>
								<span className="dynamic-nav__group-count" aria-hidden="true">
									{yearCount}
								</span>
							</button>
							{yearOpen ? (
								<div className="dynamic-nav__year-body">
									{year.months.map((month) => {
										const monthOpen = expandedMonths.has(month.id);
										return (
											<section key={month.id} className="dynamic-nav__month">
												<button
													type="button"
													className={`dynamic-nav__fold is-month${monthOpen ? " is-open" : ""}`}
													aria-expanded={monthOpen}
													onClick={() => toggleMonth(month.id)}
												>
													<span className="dynamic-nav__fold-label">
														{month.title}
													</span>
													<span
														className="dynamic-nav__group-count"
														aria-hidden="true"
													>
														{month.ticks.length}
													</span>
												</button>
												{monthOpen ? (
													<ol className="dynamic-axis">
														{month.ticks.map((tick) => {
															const active = tick.anchor === activeAnchor;
															return (
																<li
																	key={tick.key}
																	className="dynamic-axis__item"
																>
																	<a
																		href={`#${tick.anchor}`}
																		data-nav-anchor={tick.anchor}
																		className={`dynamic-axis__tick${active ? " is-active" : ""}${tick.pinned ? " is-pinned" : ""}`}
																		aria-current={
																			active ? "true" : undefined
																		}
																		onClick={onJump(tick.anchor)}
																		title={tick.title}
																	>
																		<span
																			className="dynamic-axis__dot"
																			aria-hidden="true"
																		/>
																		<span className="dynamic-axis__date">
																			{tick.dateLabel}
																		</span>
																	</a>
																</li>
															);
														})}
													</ol>
												) : null}
											</section>
										);
									})}
								</div>
							) : null}
						</section>
					);
				})}
			</div>
		</nav>
	);
}

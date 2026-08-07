import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
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

const EVENT_NAME = "firefly:dynamic-nav";

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
		const list = listRef.current;
		const active = list.querySelector<HTMLElement>(
			`[data-nav-anchor="${CSS.escape(activeAnchor)}"]`,
		);
		if (!active) return;
		// 只在导航列表内部滚动，避免 scrollIntoView 冒泡滚动主文档导致页面反弹
		const delta =
			active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2;
		list.scrollTo({ top: delta, behavior: "smooth" });
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

	// 垂直刻度轴：按日去重（同日多条取最新一条作锚点），时间倒序
	const ticks = (() => {
		const seen = new Set<string>();
		const out: Array<{
			key: string;
			anchor: string;
			dateLabel: string;
			title: string;
			pinned: boolean;
		}> = [];
		for (const item of items) {
			const d = new Date(item.published);
			const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
			if (seen.has(dayKey)) continue;
			seen.add(dayKey);
			out.push({
				key: dayKey,
				anchor: dynamicAnchor(item.id),
				dateLabel: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
				title: item.title,
				pinned: Boolean(item.pinned),
			});
		}
		return out;
	})();

	return (
		<nav className="dynamic-nav" aria-label={labels.nav}>
			<div className="dynamic-nav__scroll dynamic-nav__axis" ref={listRef}>
				<ol className="dynamic-axis">
					{ticks.map((tick) => {
						const active = tick.anchor === activeAnchor;
						return (
							<li key={tick.key} className="dynamic-axis__item">
								<a
									href={`#${tick.anchor}`}
									data-nav-anchor={tick.anchor}
									className={`dynamic-axis__tick${active ? " is-active" : ""}${tick.pinned ? " is-pinned" : ""}`}
									aria-current={active ? "true" : undefined}
									onClick={onJump(tick.anchor)}
									title={tick.title}
								>
									<span className="dynamic-axis__dot" aria-hidden="true" />
									<span className="dynamic-axis__date">{tick.dateLabel}</span>
								</a>
							</li>
						);
					})}
				</ol>
			</div>
		</nav>
	);
}

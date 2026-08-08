import { Check, Circle, Image as ImageIcon, MapPin, MessageCircle, Pin } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { formatDateToYYYYMMDD, formatTimezoneOffset } from "@/utils/date-utils";
import {
	detectDynamicKind,
	DYNAMIC_KIND_LABEL,
	dynamicAnchor,
	dynamicKindToRail,
	type DynamicKind,
} from "@/utils/dynamic-utils";
import { fetchMemos } from "@/utils/memos-adapter";
import { registerDynamicGallery } from "../dynamic-gallery";
import { registerDynamicInlineComments } from "../dynamic-inline-comments";
import { Timeline, TimelineEmpty, TimelineItem } from "./timeline";
import type { TimelineColor, TimelineSide, TimelineStatus } from "./types";

type DynamicImage = {
	alt: string;
	src: string;
	title?: string;
};

type DynamicData = {
	id: string;
	published: number;
	html: string;
	images: DynamicImage[];
	searchText: string;
	pinned?: boolean;
	location?: string;
};

interface MemosConfig {
	enable: boolean;
	apiUrl: string;
	parent?: string;
}

export interface DynamicTimelineProps {
	source: string;
	/** 滚动懒加载每批条数（首屏 SSR 同批） */
	itemsPerPage: number;
	showComments: boolean;
	emptyText: string;
	noResultsText: string;
	loadingText: string;
	allYearsText: string;
	loadMoreLabel: string;
	timezone: string;
	memos?: MemosConfig;
	/** SSR 首批种子（勿塞全表，避免 hydration 膨胀） */
	initialEntries?: DynamicData[];
	profileName: string;
	profileUrl: string;
	avatarUrl: string;
	commentsLabel: string;
	pinnedLabel: string;
	collapseGalleryLabel: string;
	viewOriginalLabel: string;
	prevImageLabel: string;
	nextImageLabel: string;
	viewImageLabel: string;
	selectImageLabel: string;
}

function kindIcon(kind: DynamicKind) {
	if (kind === "note") return <Check className="ff-tl-dot-svg" strokeWidth={2.5} />;
	if (kind === "gallery") return <ImageIcon className="ff-tl-dot-svg" strokeWidth={2} />;
	return <Circle className="ff-tl-dot-svg" strokeWidth={2} />;
}

function kindColor(kind: DynamicKind): TimelineColor {
	if (kind === "note") return "primary";
	if (kind === "gallery") return "secondary";
	return "muted";
}

function formatFullTime(
	date: Date,
	useLocal: boolean,
	timezone: string,
	lang: string | undefined,
) {
	if (useLocal) {
		return date.toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	}
	const text = new Intl.DateTimeFormat(lang, {
		timeZone: "UTC",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).format(date);
	return `${text} ${formatTimezoneOffset(timezone, date)}`;
}

function EntryBody({
	entry,
	kind,
	anchorId,
	showComments,
	useLocalTz,
	timezone,
	profileName,
	profileUrl,
	avatarUrl,
	commentsLabel,
	pinnedLabel,
	collapseGalleryLabel,
	viewOriginalLabel,
	prevImageLabel,
	nextImageLabel,
	viewImageLabel,
	selectImageLabel,
}: {
	entry: DynamicData;
	kind: DynamicKind;
	anchorId: string;
	showComments: boolean;
	useLocalTz: boolean;
	timezone: string;
	profileName: string;
	profileUrl: string;
	avatarUrl: string;
	commentsLabel: string;
	pinnedLabel: string;
	collapseGalleryLabel: string;
	viewOriginalLabel: string;
	prevImageLabel: string;
	nextImageLabel: string;
	viewImageLabel: string;
	selectImageLabel: string;
}) {
	const contentId = `${anchorId}-content`;
	const date = new Date(entry.published);
	const lang =
		typeof document !== "undefined" ? document.documentElement.lang : undefined;
	const fullTime = formatFullTime(date, useLocalTz, timezone, lang || undefined);
	const location = entry.location?.trim();

	const html = entry.html || "";
	const mediaId = `${contentId}-media`;
	const gallerySourceId = entry.images?.length ? mediaId : contentId;

	useEffect(() => {
		const el = document.getElementById(contentId);
		if (!el) return;
		if (kind === "note") {
			const quote = el.querySelector("blockquote");
			quote?.classList.add("dynamic-note-blurb");
			for (const p of el.querySelectorAll(":scope > p")) {
				if (/发布了新笔记/.test(p.textContent || "")) {
					p.classList.add("dynamic-note-headline");
					break;
				}
			}
		}
	}, [contentId, kind, html]);

	// gallery 已 ready 时清空 staging，避免 React 重渲把同一张图又塞回正文旁
	useLayoutEffect(() => {
		if (!entry.images?.length) return;
		const gallery = document.querySelector(
			`dynamic-gallery[data-source-id="${mediaId}"]`,
		) as HTMLElement | null;
		const staging = document.getElementById(mediaId);
		if (gallery?.dataset.ready === "true" && staging) {
			staging.replaceChildren();
		}
	}, [entry.images, mediaId]);

	return (
		<div className="ff-tl-rich">
			<header className="dynamic-entry-header">
				<a href={profileUrl} className="dynamic-avatar" aria-label={profileName}>
					{avatarUrl ? (
						<img
							src={avatarUrl}
							alt=""
							width={40}
							height={40}
							decoding="async"
						/>
					) : (
						<span className="ff-tl-avatar-fallback" aria-hidden="true">
							{profileName.slice(0, 1)}
						</span>
					)}
				</a>
				<div className="dynamic-identity">
					<div className="dynamic-identity-row">
						<a href={profileUrl} className="dynamic-author">
							<strong id={`${anchorId}-author`}>{profileName}</strong>
						</a>
						<span className="dynamic-kind" data-kind={kind}>
							{DYNAMIC_KIND_LABEL[kind]}
						</span>
						{entry.pinned ? (
							<span className="dynamic-pinned-badge">
								<Pin className="size-3" />
								{pinnedLabel}
							</span>
						) : null}
					</div>
					<div className="dynamic-meta">
						<a className="dynamic-time" href={`#${anchorId}`} data-no-swup="">
							<time dateTime={date.toISOString()}>{fullTime}</time>
						</a>
						{location ? (
							<>
								<span className="dynamic-meta-sep" aria-hidden="true">
									·
								</span>
								<span className="dynamic-location" title={location}>
									<MapPin className="size-3.5" />
									<span>{location}</span>
								</span>
							</>
						) : null}
					</div>
				</div>
			</header>

			<div
				id={contentId}
				className="dynamic-content custom-md"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: dynamic feed HTML from own API
				dangerouslySetInnerHTML={{ __html: html }}
			/>

			{entry.images?.length ? (
				<div id={mediaId} className="dynamic-media-staging" hidden aria-hidden="true">
					{entry.images.map((image) => (
						<img
							key={image.src}
							src={image.src}
							alt={image.alt || ""}
							title={image.title || undefined}
							loading="lazy"
						/>
					))}
				</div>
			) : null}

			<dynamic-gallery
				className="dynamic-gallery"
				data-source-id={gallerySourceId}
				data-view-image={viewImageLabel}
				data-select-image={selectImageLabel}
				hidden
			>
				<div className="dynamic-gallery-grid" data-gallery-grid="" />
				<div className="dynamic-gallery-viewer" data-gallery-viewer="" hidden>
					<div className="dynamic-gallery-toolbar">
						<button
							type="button"
							className="btn-plain dynamic-gallery-action"
							data-gallery-collapse=""
						>
							<span>{collapseGalleryLabel}</span>
						</button>
						<button
							type="button"
							className="btn-plain dynamic-gallery-action"
							data-fancybox={`dynamic-${contentId}`}
							data-gallery-lightbox=""
							data-type="image"
						>
							<span>{viewOriginalLabel}</span>
						</button>
					</div>
					<div className="dynamic-gallery-stage">
						<button
							type="button"
							className="btn-plain dynamic-gallery-nav dynamic-gallery-prev"
							data-gallery-prev=""
							aria-label={prevImageLabel}
						/>
						<img className="dynamic-gallery-main-image" data-gallery-main="" alt="" />
						<button
							type="button"
							className="btn-plain dynamic-gallery-nav dynamic-gallery-next"
							data-gallery-next=""
							aria-label={nextImageLabel}
						/>
					</div>
					<div className="dynamic-gallery-thumbnails" data-gallery-thumbnails="" />
				</div>
			</dynamic-gallery>

			{showComments ? (
				<dynamic-inline-comments
					className="dynamic-inline-comments"
					data-src={`/dynamic/comments/?path=${encodeURIComponent(`/dynamic/${entry.id}/`)}`}
				>
					<button
						type="button"
						className="dynamic-comment-toggle btn-plain"
						data-comment-toggle=""
						aria-controls={`${anchorId}-replies`}
					>
						<span className="dynamic-comment-toggle-main">
							<MessageCircle className="size-4" />
							<span>{commentsLabel}</span>
							<span
								className="dynamic-comment-badge"
								data-comment-badge=""
								hidden
							/>
						</span>
					</button>
					<div
						id={`${anchorId}-replies`}
						className="dynamic-comment-panel"
						data-comment-panel=""
						hidden
					/>
				</dynamic-inline-comments>
			) : null}
		</div>
	);
}

function syncYearSelect(data: DynamicData[], allYearsText: string) {
	const page = document.querySelector(".dynamic-page");
	const yearSelect = page?.querySelector<HTMLSelectElement>("[data-year-select]");
	if (!yearSelect) return;
	yearSelect.replaceChildren();
	const all = document.createElement("option");
	all.value = "all";
	all.textContent = allYearsText;
	yearSelect.append(all);
	const years = [
		...new Set(data.map((entry) => new Date(entry.published).getUTCFullYear())),
	];
	for (const y of years) {
		const option = document.createElement("option");
		option.value = String(y);
		option.textContent = String(y);
		yearSelect.append(option);
	}
}

function syncPageCount(data: DynamicData[]) {
	const countEl = document.querySelector("[data-dynamic-page-count]");
	if (countEl) countEl.textContent = String(data.length);
}

export default function DynamicTimeline({
	source,
	itemsPerPage,
	showComments,
	emptyText,
	noResultsText,
	loadingText,
	allYearsText,
	loadMoreLabel,
	timezone,
	memos,
	initialEntries,
	profileName,
	profileUrl,
	avatarUrl,
	commentsLabel,
	pinnedLabel,
	collapseGalleryLabel,
	viewOriginalLabel,
	prevImageLabel,
	nextImageLabel,
	viewImageLabel,
	selectImageLabel,
}: DynamicTimelineProps) {
	const batch = Math.max(1, itemsPerPage);
	const hasInitial = Array.isArray(initialEntries) && !memos?.enable;
	const [entries, setEntries] = useState<DynamicData[]>(() =>
		hasInitial ? (initialEntries as DynamicData[]) : [],
	);
	const [filtered, setFiltered] = useState<DynamicData[]>(() =>
		hasInitial ? (initialEntries as DynamicData[]) : [],
	);
	/** 已渲染条数：滚动触底再 +batch，而不是一次铺满 */
	const [visibleCount, setVisibleCount] = useState(() =>
		hasInitial ? Math.min(batch, (initialEntries as DynamicData[]).length) : batch,
	);
	const [loading, setLoading] = useState(!hasInitial);
	/** 全量目录是否已从 API 就位（首批 SSR 期间勿把顶栏计数改成 8） */
	const [catalogReady, setCatalogReady] = useState(false);
	const [failed, setFailed] = useState(false);
	const [query, setQuery] = useState("");
	const [year, setYear] = useState("all");
	/** all = 不限类型；status/note/gallery = 顶卡标签筛选 */
	const [kindFilter, setKindFilter] = useState<"all" | DynamicKind>("all");
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const useLocalTz = source.startsWith("http") || Boolean(memos?.enable);

	const visibleEntries = useMemo(
		() => filtered.slice(0, visibleCount),
		[filtered, visibleCount],
	);
	const hasMore = visibleCount < filtered.length;

	useEffect(() => {
		registerDynamicGallery();
		registerDynamicInlineComments();
	}, []);

	useEffect(() => {
		const page = document.querySelector(".dynamic-page");
		const searchInput = page?.querySelector<HTMLInputElement>(
			"[data-dynamic-search]",
		);
		const yearSelect = page?.querySelector<HTMLSelectElement>("[data-year-select]");
		const kindSelect = page?.querySelector<HTMLSelectElement>("[data-kind-select]");

		const onSearch = () => setQuery(searchInput?.value.toLocaleLowerCase().trim() || "");
		const onYear = () => setYear(yearSelect?.value || "all");
		const onKind = () => {
			const value = kindSelect?.value || "all";
			setKindFilter(value === "all" ? "all" : (value as DynamicKind));
		};

		searchInput?.addEventListener("input", onSearch);
		yearSelect?.addEventListener("change", onYear);
		kindSelect?.addEventListener("change", onKind);

		return () => {
			searchInput?.removeEventListener("input", onSearch);
			yearSelect?.removeEventListener("change", onYear);
			kindSelect?.removeEventListener("change", onKind);
		};
	}, []);

	// 后台拉全量目录（~几十 KB）；首屏只用 SSR 小批，避免 1MB+ hydration
	useEffect(() => {
		let cancelled = false;
		const controller = new AbortController();
		const timer = window.setTimeout(() => controller.abort(), 10000);
		(async () => {
			try {
				let data: DynamicData[];
				if (memos?.enable) {
					data = await fetchMemos(memos.apiUrl, { parent: memos.parent });
				} else {
					const response = await fetch(source, { signal: controller.signal });
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					data = (await response.json()) as DynamicData[];
				}
				if (cancelled) return;
				setEntries(data);
				syncYearSelect(data, allYearsText);
				setCatalogReady(true);
			} catch (error) {
				console.error("Failed to load dynamics", error);
				if (!cancelled && !hasInitial) setFailed(true);
				// 有首批种子时即使全量失败也放行计数/懒加载
				if (!cancelled) setCatalogReady(true);
			} finally {
				window.clearTimeout(timer);
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
			controller.abort();
			window.clearTimeout(timer);
		};
	}, [source, memos, allYearsText, hasInitial]);

	useEffect(() => {
		const next = entries.filter((entry) => {
			const yearOk =
				year === "all" ||
				String(new Date(entry.published).getUTCFullYear()) === year;
			const queryOk = !query || entry.searchText.includes(query);
			const kindOk =
				kindFilter === "all" ||
				detectDynamicKind(entry.html, entry.images?.length ?? 0) === kindFilter;
			return yearOk && queryOk && kindOk;
		});
		setFiltered(next);
		if (catalogReady) syncPageCount(next);
		// 筛选变化：回到首批，避免继续挂着旧的超大 visibleCount
		setVisibleCount(next.length === 0 ? 0 : Math.min(batch, next.length));
	}, [entries, query, year, kindFilter, batch, catalogReady]);

	useEffect(() => {
		const plainTitle = (_html: string, searchText: string) => {
			const fallback = (searchText || "").trim();
			return fallback ? fallback.slice(0, 64) : "动态";
		};

		document.dispatchEvent(
			new CustomEvent("firefly:dynamic-nav", {
				detail: {
					loading,
					items: filtered.map((entry) => ({
						id: entry.id,
						published: entry.published,
						title: plainTitle(entry.html, entry.searchText),
						pinned: Boolean(entry.pinned),
					})),
				},
			}),
		);

		return () => {
			document.dispatchEvent(
				new CustomEvent("firefly:dynamic-nav", {
					detail: { loading: false, items: [] },
				}),
			);
		};
	}, [filtered, loading]);

	// 触底懒加载
	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !hasMore || loading) return;
		const io = new IntersectionObserver(
			(rows) => {
				if (!rows.some((row) => row.isIntersecting)) return;
				setVisibleCount((n) => Math.min(filtered.length, n + batch));
			},
			{ root: null, rootMargin: "280px 0px", threshold: 0 },
		);
		io.observe(node);
		return () => io.disconnect();
	}, [hasMore, loading, filtered.length, batch, visibleCount]);

	useEffect(() => {
		if (loading) return;

		const jumpToHash = () => {
			const anchorId = decodeURIComponent(window.location.hash.slice(1));
			if (!anchorId) return;
			const anchorIndex = filtered.findIndex(
				(entry) => dynamicAnchor(entry.id) === anchorId,
			);
			if (anchorIndex < 0) return;
			setVisibleCount((n) => Math.max(n, anchorIndex + 1));
			requestAnimationFrame(() => {
				document.getElementById(anchorId)?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		};

		jumpToHash();
		window.addEventListener("hashchange", jumpToHash);
		return () => window.removeEventListener("hashchange", jumpToHash);
	}, [loading, filtered]);

	if (loading) {
		return (
			<div className="dynamic-loading card-base" role="status">
				<span className="dynamic-loading-spinner" aria-hidden="true" />
				<p>{loadingText}</p>
			</div>
		);
	}

	if (failed || entries.length === 0) {
		return (
			<div className="dynamic-empty card-base">
				<p>{emptyText}</p>
			</div>
		);
	}

	if (filtered.length === 0) {
		return (
			<div className="dynamic-no-results card-base">
				<p>{noResultsText}</p>
			</div>
		);
	}

	return (
		<>
			<Timeline size="sm" className="ff-tl--stagger" iconsize="sm">
				{visibleEntries.length === 0 ? (
					<TimelineEmpty>{noResultsText}</TimelineEmpty>
				) : (
					visibleEntries.map((entry, index) => {
						const kind = detectDynamicKind(entry.html, entry.images?.length ?? 0);
						const rail = dynamicKindToRail(kind);
						const status = rail.statusClass as TimelineStatus;
						const side: TimelineSide = index % 2 === 0 ? "left" : "right";
						const anchorId = dynamicAnchor(entry.id);
						const date = new Date(entry.published);
						const shortDate = useLocalTz
							? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
							: formatDateToYYYYMMDD(date);

						return (
							<TimelineItem
								key={entry.id}
								id={anchorId}
								date={shortDate}
								status={status}
								iconColor={kindColor(kind)}
								icon={kindIcon(kind)}
								side={side}
								pinned={entry.pinned}
								showConnector={index !== visibleEntries.length - 1 || hasMore}
							>
								<article
									className="ff-tl-article"
									data-note-layout={kind === "note" ? "split" : undefined}
									aria-labelledby={`${anchorId}-author`}
								>
									<EntryBody
										entry={entry}
										kind={kind}
										anchorId={anchorId}
										showComments={showComments}
										useLocalTz={useLocalTz}
										timezone={timezone}
										profileName={profileName}
										profileUrl={profileUrl}
										avatarUrl={avatarUrl}
										commentsLabel={commentsLabel}
										pinnedLabel={pinnedLabel}
										collapseGalleryLabel={collapseGalleryLabel}
										viewOriginalLabel={viewOriginalLabel}
										prevImageLabel={prevImageLabel}
										nextImageLabel={nextImageLabel}
										viewImageLabel={viewImageLabel}
										selectImageLabel={selectImageLabel}
									/>
								</article>
							</TimelineItem>
						);
					})
				)}
			</Timeline>

			{hasMore ? (
				<div
					ref={sentinelRef}
					className="dynamic-load-more"
					role="status"
					aria-live="polite"
				>
					<span className="dynamic-loading-spinner" aria-hidden="true" />
					<span>{loadMoreLabel}</span>
				</div>
			) : null}
		</>
	);
}

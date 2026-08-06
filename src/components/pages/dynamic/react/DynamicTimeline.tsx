import { Check, Circle, Image as ImageIcon, MapPin, MessageCircle, Pin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
	itemsPerPage: number;
	showComments: boolean;
	emptyText: string;
	noResultsText: string;
	loadingText: string;
	allYearsText: string;
	timezone: string;
	memos?: MemosConfig;
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

	let html = entry.html || "";
	if (entry.images?.length) {
		const imgs = entry.images
			.map(
				(image) =>
					`<img src="${image.src}" alt="${image.alt || ""}" loading="lazy"${
						image.title ? ` title="${image.title}"` : ""
					} />`,
			)
			.join("");
		html += imgs;
	}

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

			<dynamic-gallery
				className="dynamic-gallery"
				data-source-id={contentId}
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
					>
						<MessageCircle className="size-4" />
						<span>{commentsLabel}</span>
					</button>
					<div className="dynamic-comment-panel" data-comment-panel="" hidden />
				</dynamic-inline-comments>
			) : null}
		</div>
	);
}

export default function DynamicTimeline({
	source,
	itemsPerPage,
	showComments,
	emptyText,
	noResultsText,
	loadingText,
	allYearsText,
	timezone,
	memos,
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
	const [entries, setEntries] = useState<DynamicData[]>([]);
	const [filtered, setFiltered] = useState<DynamicData[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	const [query, setQuery] = useState("");
	const [year, setYear] = useState("all");

	const useLocalTz = source.startsWith("http") || Boolean(memos?.enable);

	const pageEntries = useMemo(
		() =>
			filtered.slice(
				(currentPage - 1) * itemsPerPage,
				currentPage * itemsPerPage,
			),
		[filtered, currentPage, itemsPerPage],
	);

	const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

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

		const onSearch = () => setQuery(searchInput?.value.toLocaleLowerCase().trim() || "");
		const onYear = () => setYear(yearSelect?.value || "all");

		searchInput?.addEventListener("input", onSearch);
		yearSelect?.addEventListener("change", onYear);

		return () => {
			searchInput?.removeEventListener("input", onSearch);
			yearSelect?.removeEventListener("change", onYear);
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				let data: DynamicData[];
				if (memos?.enable) {
					data = await fetchMemos(memos.apiUrl, { parent: memos.parent });
				} else {
					const response = await fetch(source);
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					data = (await response.json()) as DynamicData[];
				}
				if (cancelled) return;
				setEntries(data);
				const countEl = document.querySelector("[data-dynamic-page-count]");
				if (countEl) countEl.textContent = String(data.length);

				const page = document.querySelector(".dynamic-page");
				const yearSelect = page?.querySelector<HTMLSelectElement>(
					"[data-year-select]",
				);
				if (yearSelect) {
					yearSelect.replaceChildren();
					const all = document.createElement("option");
					all.value = "all";
					all.textContent = allYearsText;
					yearSelect.append(all);
					const years = [
						...new Set(
							data.map((entry) => new Date(entry.published).getUTCFullYear()),
						),
					];
					for (const y of years) {
						const option = document.createElement("option");
						option.value = String(y);
						option.textContent = String(y);
						yearSelect.append(option);
					}
				}

				const pageParam = Math.max(
					1,
					Number(new URL(window.location.href).searchParams.get("page")) || 1,
				);
				setCurrentPage(pageParam);
			} catch (error) {
				console.error("Failed to load dynamics", error);
				if (!cancelled) setFailed(true);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [source, memos, allYearsText]);

	useEffect(() => {
		const next = entries.filter(
			(entry) =>
				(year === "all" ||
					String(new Date(entry.published).getUTCFullYear()) === year) &&
				(!query || entry.searchText.includes(query)),
		);
		setFiltered(next);
		setCurrentPage((page) => {
			const max = Math.max(1, Math.ceil(next.length / itemsPerPage));
			return Math.min(page, max);
		});
	}, [entries, query, year, itemsPerPage]);

	useEffect(() => {
		const plainTitle = (html: string, searchText: string) => {
			if (typeof document !== "undefined" && html) {
				const box = document.createElement("div");
				box.innerHTML = html;
				const text = (box.textContent || "").replace(/\s+/g, " ").trim();
				if (text) return text.slice(0, 64);
			}
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

	useEffect(() => {
		const current = new URL(window.location.href);
		if (currentPage > 1) current.searchParams.set("page", String(currentPage));
		else current.searchParams.delete("page");
		history.replaceState(history.state, "", current);
	}, [currentPage]);

	useEffect(() => {
		if (loading) return;

		const jumpToHash = () => {
			const anchorId = decodeURIComponent(window.location.hash.slice(1));
			if (!anchorId) return;
			const anchorIndex = filtered.findIndex(
				(entry) => dynamicAnchor(entry.id) === anchorId,
			);
			if (anchorIndex < 0) return;
			const page = Math.floor(anchorIndex / itemsPerPage) + 1;
			if (page !== currentPage) {
				setCurrentPage(page);
				return;
			}
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
	}, [loading, filtered, itemsPerPage, currentPage]);

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
				{pageEntries.length === 0 ? (
					<TimelineEmpty>{noResultsText}</TimelineEmpty>
				) : (
					pageEntries.map((entry, index) => {
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
								showConnector={index !== pageEntries.length - 1}
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

			{totalPages > 1 ? (
				<nav className="ff-tl-pagination" aria-label="pagination">
					<button
						type="button"
						className="btn-regular"
						disabled={currentPage <= 1}
						onClick={() => {
							setCurrentPage((p) => Math.max(1, p - 1));
							document
								.querySelector(".dynamic-page")
								?.scrollIntoView({ behavior: "smooth", block: "start" });
						}}
					>
						‹
					</button>
					<span className="ff-tl-page-indicator">
						{currentPage} / {totalPages}
					</span>
					<button
						type="button"
						className="btn-regular"
						disabled={currentPage >= totalPages}
						onClick={() => {
							setCurrentPage((p) => Math.min(totalPages, p + 1));
							document
								.querySelector(".dynamic-page")
								?.scrollIntoView({ behavior: "smooth", block: "start" });
						}}
					>
						›
					</button>
				</nav>
			) : null}
		</>
	);
}

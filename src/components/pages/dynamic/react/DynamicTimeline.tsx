import { Check, Circle, Flower2, MapPin, MessageCircle, Pin } from "lucide-react";
import {
	type ReactElement,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { agentPersonas } from "@/config/agentPersonas";
import { formatDateToYYYYMMDD, formatTimezoneOffset } from "@/utils/date-utils";
import {
	DYNAMIC_KIND_LABEL,
	type DynamicKind,
	detectDynamicKind,
	dynamicAnchor,
	dynamicEntryTitle,
	dynamicKindToRail,
	dynamicNoteFoldTitle,
	groupConsecutiveNotes,
} from "@/utils/dynamic-utils";
import { fetchMemos } from "@/utils/memos-adapter";
import { registerDynamicGallery } from "../dynamic-gallery";
import { registerDynamicInlineComments } from "../dynamic-inline-comments";
import {
	burstOwnerSealConfetti,
	clearOwnerSeal,
	persistOwnerSeal,
	readOwnerSeals,
} from "../dynamic-owner-seal";
import { Timeline, TimelineEmpty, TimelineItem } from "./timeline";
import type { TimelineColor, TimelineSide, TimelineStatus } from "./types";

/** 小红花盖章仅本地 DEV；生产构建整段裁掉 */
const OWNER_SEAL_DEV = import.meta.env.DEV;

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
	author?: string;
};

/** 角色名录页（徽标跳转目标） */
const AGENTS_URL = "/agents/";

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
	ownerBadgeLabel: string;
	collapseGalleryLabel: string;
	viewOriginalLabel: string;
	prevImageLabel: string;
	nextImageLabel: string;
	viewImageLabel: string;
	selectImageLabel: string;
}

function kindIcon(kind: DynamicKind) {
	if (kind === "note") return <Check className="ff-tl-dot-svg" strokeWidth={2.5} />;
	return <Circle className="ff-tl-dot-svg" strokeWidth={2} />;
}

function kindColor(kind: DynamicKind): TimelineColor {
	if (kind === "note") return "primary";
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

function formatShortDate(date: Date, useLocal: boolean): string {
	if (useLocal) {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
	}
	return formatDateToYYYYMMDD(date);
}

function formatFoldMeta(
	date: Date,
	useLocal: boolean,
	timezone: string,
): string {
	if (useLocal) {
		return date.toLocaleString("zh-CN", {
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	}
	return new Intl.DateTimeFormat("zh-CN", {
		timeZone: timezone,
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).format(date);
}

/** 连续笔记折叠块：小字引用行 + 展开 */
function NoteFoldedBlock({
	folded,
	useLocalTz,
	timezone,
	onExpand,
}: {
	folded: DynamicData[];
	useLocalTz: boolean;
	timezone: string;
	onExpand: () => void;
}) {
	if (folded.length === 0) return null;
	return (
		<div className="dynamic-note-folded">
			<ol className="dynamic-note-folded__list">
				{folded.map((entry) => {
					const anchorId = dynamicAnchor(entry.id);
					const date = new Date(entry.published);
					const title = dynamicNoteFoldTitle(entry.html, entry.searchText);
					return (
						<li key={entry.id} id={anchorId} className="dynamic-note-folded__item">
							<a
								className="dynamic-note-folded__link"
								href={`#${anchorId}`}
								data-no-swup=""
							>
								<time
									className="dynamic-note-folded__time"
									dateTime={date.toISOString()}
								>
									{formatFoldMeta(date, useLocalTz, timezone)}
								</time>
								<span className="dynamic-note-folded__title">{title}</span>
							</a>
						</li>
					);
				})}
			</ol>
			<button
				type="button"
				className="dynamic-note-folded__toggle btn-plain"
				onClick={onExpand}
			>
				展开 {folded.length} 条笔记
			</button>
		</div>
	);
}

/** 按发布者身份解析展示名与头像：entry.author 命中 agent → 用 agent 人格，否则回落园主 */
function resolveAuthorIdentity(
	entry: DynamicData,
	fallbackName: string,
	fallbackAvatar: string,
) {
	const persona = entry.author ? agentPersonas[entry.author] : undefined;
	return {
		name: persona?.name || fallbackName,
		avatar: persona?.avatar || fallbackAvatar,
		isAgent: Boolean(persona),
	};
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
	ownerBadgeLabel,
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
	ownerBadgeLabel: string;
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
	const authorIdentity = resolveAuthorIdentity(entry, profileName, avatarUrl);
	const authorName = authorIdentity.name;
	const authorAvatar = authorIdentity.avatar;
	/** agent 身份点头像/昵称进协作者页；园主仍进个人页 */
	const identityHref = authorIdentity.isAgent ? AGENTS_URL : profileUrl;

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
				<a
					href={identityHref}
					className="dynamic-avatar"
					aria-label={authorName}
					data-agent={authorIdentity.isAgent || undefined}
				>
					{authorAvatar ? (
						<img
							src={authorAvatar}
							alt=""
							width={40}
							height={40}
							decoding="async"
						/>
					) : (
						<span className="ff-tl-avatar-fallback" aria-hidden="true">
							{authorName.slice(0, 1)}
						</span>
					)}
				</a>
				<div className="dynamic-identity">
					<div className="dynamic-identity-row">
						<a href={identityHref} className="dynamic-author">
							<strong id={`${anchorId}-author`}>{authorName}</strong>
						</a>
						<a
							href={AGENTS_URL}
							className="dynamic-author-badge"
							data-agent={authorIdentity.isAgent || undefined}
							title={`${authorName} · ${authorIdentity.isAgent ? "AI 协作者" : ownerBadgeLabel}`}
						>
							{authorIdentity.isAgent ? authorName : ownerBadgeLabel}
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
				<div
					className="dynamic-inline-comments"
					data-dynamic-inline-comments=""
					data-src={`/dynamic/comments/?path=${encodeURIComponent(`/dynamic/${entry.id}/`)}`}
					data-author={entry.author || undefined}
					data-owner-name={profileName}
					data-owner-avatar={avatarUrl}
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
				</div>
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
	ownerBadgeLabel,
	collapseGalleryLabel,
	viewOriginalLabel,
	prevImageLabel,
	nextImageLabel,
	viewImageLabel,
	selectImageLabel,
}: DynamicTimelineProps): ReactElement {
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
	/** all = 不限类型；status/note = 顶卡标签筛选（无图集） */
	const [kindFilter, setKindFilter] = useState<"all" | DynamicKind>("all");
	/** all = 不限；owner = 园主（无 author）；其余 = agent key */
	const [agentFilter, setAgentFilter] = useState("all");
	/** 已展开的连续笔记 run（key = head.id） */
	const [expandedRunIds, setExpandedRunIds] = useState<Set<string>>(
		() => new Set(),
	);
	/** DEV：已盖「作者阅过」的动态 id */
	const [sealedIds, setSealedIds] = useState<Set<string>>(() =>
		OWNER_SEAL_DEV ? readOwnerSeals() : new Set(),
	);
	const [stampingId, setStampingId] = useState<string | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const stampOwnerSeal = (entryId: string, fromBtn: HTMLElement) => {
		if (!OWNER_SEAL_DEV || sealedIds.has(entryId) || stampingId) return;
		const card =
			fromBtn.closest<HTMLElement>(".ff-tl-article") || fromBtn;
		// 先启动取样（函数内同步 capture），再卸按钮，避免原点掉到左上角
		void burstOwnerSealConfetti(card);
		setStampingId(entryId);
		persistOwnerSeal(entryId);
		setSealedIds((prev) => {
			const next = new Set(prev);
			next.add(entryId);
			return next;
		});
		window.setTimeout(() => {
			setStampingId((cur) => (cur === entryId ? null : cur));
		}, 700);
	};

	const unstampOwnerSeal = (entryId: string) => {
		if (!OWNER_SEAL_DEV || !sealedIds.has(entryId) || stampingId) return;
		clearOwnerSeal(entryId);
		setSealedIds((prev) => {
			const next = new Set(prev);
			next.delete(entryId);
			return next;
		});
		setStampingId(null);
	};

	const useLocalTz = source.startsWith("http") || Boolean(memos?.enable);

	/** 默认「全部」且无搜索时，连续笔记折叠 */
	const collapseNotes =
		year === "all" &&
		kindFilter === "all" &&
		agentFilter === "all" &&
		!query;

	const timelineRows = useMemo(
		() => groupConsecutiveNotes(filtered, collapseNotes),
		[filtered, collapseNotes],
	);

	const visibleRows = useMemo(
		() => timelineRows.slice(0, visibleCount),
		[timelineRows, visibleCount],
	);
	const hasMore = visibleCount < timelineRows.length;

	useEffect(() => {
		registerDynamicGallery();
		return registerDynamicInlineComments();
	}, []);

	useEffect(() => {
		const page = document.querySelector(".dynamic-page");
		const searchInput = page?.querySelector<HTMLInputElement>(
			"[data-dynamic-search]",
		);
		const yearSelect = page?.querySelector<HTMLSelectElement>("[data-year-select]");
		const kindSelect = page?.querySelector<HTMLSelectElement>("[data-kind-select]");
		const agentSelect = page?.querySelector<HTMLSelectElement>("[data-agent-select]");

		const onSearch = () => setQuery(searchInput?.value.toLocaleLowerCase().trim() || "");
		const onYear = () => setYear(yearSelect?.value || "all");
		const onKind = () => {
			const value = kindSelect?.value || "all";
			setKindFilter(value === "all" ? "all" : (value as DynamicKind));
		};
		const onAgent = () => setAgentFilter(agentSelect?.value || "all");

		searchInput?.addEventListener("input", onSearch);
		yearSelect?.addEventListener("change", onYear);
		kindSelect?.addEventListener("change", onKind);
		agentSelect?.addEventListener("change", onAgent);

		return () => {
			searchInput?.removeEventListener("input", onSearch);
			yearSelect?.removeEventListener("change", onYear);
			kindSelect?.removeEventListener("change", onKind);
			agentSelect?.removeEventListener("change", onAgent);
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
			const authorKey = entry.author || "";
			const agentOk =
				agentFilter === "all" ||
				(agentFilter === "owner" ? !authorKey : authorKey === agentFilter);
			return yearOk && queryOk && kindOk && agentOk;
		});
		setFiltered(next);
		if (catalogReady) syncPageCount(next);
	}, [entries, query, year, kindFilter, agentFilter, catalogReady]);

	// 筛选 / 折叠门禁变化：按 row 重置懒加载与展开态
	useEffect(() => {
		const rowsLen = groupConsecutiveNotes(filtered, collapseNotes).length;
		setVisibleCount(rowsLen === 0 ? 0 : Math.min(batch, rowsLen));
		setExpandedRunIds(new Set());
	}, [filtered, collapseNotes, batch]);

	useEffect(() => {
		document.dispatchEvent(
			new CustomEvent("firefly:dynamic-nav", {
				detail: {
					loading,
					items: filtered.map((entry) => ({
						id: entry.id,
						published: entry.published,
						title: dynamicEntryTitle(entry.html, entry.searchText),
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

	// 触底懒加载（按 row）
	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !hasMore || loading) return;
		const io = new IntersectionObserver(
			(rows) => {
				if (!rows.some((row) => row.isIntersecting)) return;
				setVisibleCount((n) => Math.min(timelineRows.length, n + batch));
			},
			{ root: null, rootMargin: "280px 0px", threshold: 0 },
		);
		io.observe(node);
		return () => io.disconnect();
	}, [hasMore, loading, timelineRows.length, batch, visibleCount]);

	useEffect(() => {
		if (loading) return;

		const jumpToHash = () => {
			const anchorId = decodeURIComponent(window.location.hash.slice(1));
			if (!anchorId) return;
			const target = filtered.find(
				(entry) => dynamicAnchor(entry.id) === anchorId,
			);
			if (!target) return;

			const rows = groupConsecutiveNotes(filtered, collapseNotes);
			let rowIndex = -1;
			let expandHeadId: string | null = null;
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i];
				if (!row) continue;
				if (row.type === "single") {
					if (row.entry.id === target.id) {
						rowIndex = i;
						break;
					}
					continue;
				}
				if (row.head.id === target.id) {
					rowIndex = i;
					break;
				}
				if (row.folded.some((entry) => entry.id === target.id)) {
					rowIndex = i;
					expandHeadId = row.head.id;
					break;
				}
			}
			if (rowIndex < 0) return;
			if (expandHeadId) {
				setExpandedRunIds((prev) => {
					const next = new Set(prev);
					next.add(expandHeadId);
					return next;
				});
			}
			setVisibleCount((n) => Math.max(n, rowIndex + 1));
			window.setTimeout(() => {
				document.getElementById(anchorId)?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, expandHeadId ? 80 : 0);
		};

		jumpToHash();
		window.addEventListener("hashchange", jumpToHash);
		return () => window.removeEventListener("hashchange", jumpToHash);
	}, [loading, filtered, collapseNotes]);

	const renderSlots = useMemo(() => {
		type Slot = {
			key: string;
			entry: DynamicData;
			kind: DynamicKind;
			folded?: DynamicData[];
			runId?: string;
			showCollapse?: boolean;
		};
		const slots: Slot[] = [];
		for (const row of visibleRows) {
			if (row.type === "single") {
				slots.push({ key: row.entry.id, entry: row.entry, kind: row.kind });
				continue;
			}
			const runExpanded = expandedRunIds.has(row.head.id);
			if (runExpanded || row.folded.length === 0) {
				slots.push({
					key: row.head.id,
					entry: row.head,
					kind: "note",
					runId: row.head.id,
					showCollapse: row.folded.length > 0 && runExpanded,
				});
				if (runExpanded) {
					for (const entry of row.folded) {
						slots.push({
							key: entry.id,
							entry,
							kind: "note",
							runId: row.head.id,
						});
					}
				}
				continue;
			}
			slots.push({
				key: row.head.id,
				entry: row.head,
				kind: "note",
				folded: row.folded,
				runId: row.head.id,
			});
		}
		return slots;
	}, [visibleRows, expandedRunIds]);

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
				{renderSlots.length === 0 ? (
					<TimelineEmpty>{noResultsText}</TimelineEmpty>
				) : (
					renderSlots.map((slot, index) => {
						const { entry, kind } = slot;
						const rail = dynamicKindToRail(kind);
						const status = rail.statusClass as TimelineStatus;
						const side: TimelineSide = index % 2 === 0 ? "left" : "right";
						const anchorId = dynamicAnchor(entry.id);
						const date = new Date(entry.published);
						const shortDate = formatShortDate(date, useLocalTz);

						return (
							<TimelineItem
								key={slot.key}
								id={anchorId}
								date={shortDate}
								status={status}
								iconColor={kindColor(kind)}
								icon={kindIcon(kind)}
								side={side}
								pinned={entry.pinned}
								showConnector={index !== renderSlots.length - 1 || hasMore}
							>
								<article
									className="ff-tl-article"
									data-note-layout={kind === "note" ? "split" : undefined}
									aria-labelledby={`${anchorId}-author`}
								>
									{OWNER_SEAL_DEV &&
									entry.author &&
									agentPersonas[entry.author] ? (
										sealedIds.has(entry.id) ? (
											<button
												type="button"
												className={[
													"dynamic-seal",
													"is-visible",
													"is-action",
													stampingId === entry.id ? "is-stamping" : "",
												]
													.filter(Boolean)
													.join(" ")}
												title="撤销「作者阅过」（再点一次）"
												aria-label="撤销作者阅过"
												onClick={() => unstampOwnerSeal(entry.id)}
											>
												作者阅过
											</button>
										) : (
											<button
												type="button"
												className="dynamic-seal-flower"
												title="盖章「作者阅过」（仅本地 DEV）"
												aria-label="盖章：作者阅过"
												onClick={(e) =>
													stampOwnerSeal(entry.id, e.currentTarget)
												}
											>
												<Flower2 className="size-4" aria-hidden="true" />
											</button>
										)
									) : null}
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
										ownerBadgeLabel={ownerBadgeLabel}
										collapseGalleryLabel={collapseGalleryLabel}
										viewOriginalLabel={viewOriginalLabel}
										prevImageLabel={prevImageLabel}
										nextImageLabel={nextImageLabel}
										viewImageLabel={viewImageLabel}
										selectImageLabel={selectImageLabel}
									/>
									{slot.folded?.length ? (
										<NoteFoldedBlock
											folded={slot.folded}
											useLocalTz={useLocalTz}
											timezone={timezone}
											onExpand={() => {
												if (!slot.runId) return;
												setExpandedRunIds((prev) => {
													const next = new Set(prev);
													next.add(slot.runId as string);
													return next;
												});
											}}
										/>
									) : null}
									{slot.showCollapse && slot.runId ? (
										<button
											type="button"
											className="dynamic-note-folded__toggle btn-plain"
											onClick={() => {
												const runId = slot.runId as string;
												setExpandedRunIds((prev) => {
													const next = new Set(prev);
													next.delete(runId);
													return next;
												});
											}}
										>
											收起笔记
										</button>
									) : null}
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

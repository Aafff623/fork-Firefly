/**
 * 来源展示：悬停引用卡 + Grok 式重叠 favicon pill。
 * 思考链命中行、行内引用角标、来源列表三处共用（不再分散重复）。
 */
import { ExternalLink } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import type { AskSource } from "./ask-types";

/** 站内同源图标；禁止 Google s2（国内常裂） */
export const SITE_ICON = "/favicon/firefly-32.png";

function sourceIcon(src?: AskSource): string {
	if (src?.icon) return src.icon;
	return SITE_ICON;
}

/** 主流引用卡惯例：域名展示去 www，短且可读 */
export function sourceDomain(url: string): string {
	try {
		return new URL(url, window.location.origin).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

/**
 * 悬停引用卡（豆包/Kimi 式）：favicon + 标题 + 域名 + 摘要。
 * 纯 CSS hover/focus 实现，不占 HeroUI HoverCard。
 */
export function SourceHoverCard({
	title,
	url,
	snippet,
	date,
	children,
}: {
	title: string;
	url: string;
	snippet?: string;
	date?: string;
	children: ReactNode;
}): ReactElement {
	return (
		<span className="ask-hovercard">
			{children}
			<span className="ask-hovercard-pop" role="tooltip">
				<span className="ask-cite-card-head">
					<img
						className="ask-cite-card-icon"
						src={SITE_ICON}
						alt=""
						width={20}
						height={20}
						loading="lazy"
						decoding="async"
					/>
					<span className="ask-cite-card-meta">
						<span className="ask-cite-card-title">{title}</span>
						<span className="ask-cite-card-domain">
							{sourceDomain(url)}
							{date ? ` · ${date}` : ""}
						</span>
					</span>
				</span>
				{snippet ? (
					<span className="ask-cite-card-snippet">{snippet}</span>
				) : null}
				<span className="ask-cite-card-open">
					打开原文
					<ExternalLink className="ask-cite-card-open-icon" aria-hidden="true" />
				</span>
			</span>
		</span>
	);
}

/** Grok：重叠 favicon + “N sources” pill，点开行级来源列表（悬停出引用卡） */
export function AskSourcesPill({
	sources,
}: {
	sources: AskSource[];
}): ReactElement | null {
	const [open, setOpen] = useState(false);
	if (!sources.length) return null;
	const preview = sources.slice(0, 3);

	return (
		<div className="ask-sources">
			<button
				type="button"
				className="ask-sources-pill"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
			>
				<span className="ask-sources-favicons" aria-hidden="true">
					{preview.map((s) => (
						<img
							key={`${s.url}-${s.title}`}
							className="ask-sources-favicon"
							src={sourceIcon(s)}
							alt=""
							width={18}
							height={18}
							loading="lazy"
							decoding="async"
							onError={(e) => {
								e.currentTarget.src = SITE_ICON;
							}}
						/>
					))}
				</span>
				<span className="ask-sources-count">{sources.length} sources</span>
			</button>
			{open ? (
				<ul className="ask-sources-list">
					{sources.map((s, i) => (
						<li key={`${s.url}-${s.title}`}>
							<SourceHoverCard
								title={s.title}
								url={s.url}
								snippet={s.snippet}
								date={s.date}
							>
								<a
									href={s.url}
									target="_blank"
									rel="noopener noreferrer"
									className="ask-sources-row"
								>
									<span className="ask-sources-idx" aria-hidden="true">
										{i + 1}
									</span>
									<img
										className="ask-sources-row-icon"
										src={sourceIcon(s)}
										alt=""
										width={16}
										height={16}
										loading="lazy"
										decoding="async"
										onError={(e) => {
											e.currentTarget.src = SITE_ICON;
										}}
									/>
									<span className="ask-sources-row-main">
										<span className="ask-sources-row-title">{s.title}</span>
										<span className="ask-sources-row-domain">
											{sourceDomain(s.url)}
											{s.date ? ` · ${s.date}` : ""}
										</span>
									</span>
									<ExternalLink
										className="ask-sources-row-ext"
										aria-hidden="true"
									/>
								</a>
							</SourceHoverCard>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

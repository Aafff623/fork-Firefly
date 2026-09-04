/**
 * 豆包式思考面板：
 * - 进行中：触发行常开「思考中…」，步骤逐条点亮（spinner → check）
 * - 结束：自动收起为「已思考（用时 N 秒）」，可再展开
 * - reasoning_content（深度思考原文）作为首条目流式展示，吸底滚动
 * - 命中列表：标题链接 + 悬停引用卡，超过 4 条折叠「查看全部」
 */
import {
	Brain,
	Check,
	ChevronDown,
	ExternalLink,
	FileText,
	Loader2,
	type LucideIcon,
	Paperclip,
	Search,
	Sparkles,
} from "lucide-react";
import { type ReactElement, useEffect, useRef, useState } from "react";
import { SourceHoverCard } from "./Sources";
import type { AskHit, TraceKind, TraceStep } from "./ask-types";

const KIND_ICON: Record<TraceKind, LucideIcon> = {
	parse: Brain,
	search: Search,
	read: FileText,
	attachment: Paperclip,
	answer: Sparkles,
};

/** 命中/来源通用行：标题链接 + 悬停引用卡（豆包「浏览 N 个页面」样式） */
function HitRow({ hit }: { hit: AskHit }): ReactElement {
	return (
		<li className="ask-think-hit">
			<SourceHoverCard
				title={hit.title}
				url={hit.url}
				snippet={hit.snippet}
				date={hit.date}
			>
				<a
					className="ask-think-hit-link"
					href={hit.url}
					target="_blank"
					rel="noopener noreferrer"
					onClick={(e) => e.stopPropagation()}
				>
					<span>{hit.title}</span>
					<ExternalLink className="ask-think-hit-ext" aria-hidden="true" />
				</a>
			</SourceHoverCard>
			{hit.date ? <span className="ask-think-hit-date">{hit.date}</span> : null}
		</li>
	);
}

function HitsBlock({ hits }: { hits: AskHit[] }): ReactElement | null {
	const [all, setAll] = useState(false);
	if (!hits.length) return null;
	const shown = all ? hits : hits.slice(0, 4);
	return (
		<div className="ask-think-hits">
			<ul>
				{shown.map((h) => (
					<HitRow key={`${h.url}-${h.title}`} hit={h} />
				))}
			</ul>
			{hits.length > 4 ? (
				<button
					type="button"
					className="ask-think-more"
					onClick={() => setAll((v) => !v)}
				>
					{all ? "收起" : `查看全部 ${hits.length} 条`}
				</button>
			) : null}
		</div>
	);
}

/** 深度思考原文块：流式时吸底 */
function ReasoningBlock({ text, live }: { text: string; live: boolean }) {
	const ref = useRef<HTMLDivElement>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: text 是吸底滚动的触发器而非读取值
	useEffect(() => {
		const el = ref.current;
		if (el && live) el.scrollTop = el.scrollHeight;
	}, [text, live]);
	return (
		<div
			ref={ref}
			className="ask-think-reasoning"
			data-live={live ? "" : undefined}
		>
			{text}
		</div>
	);
}

type AskThinkingProps = {
	steps: TraceStep[];
	/** 思考/作答进行中：触发行显示 spinner，结束时自动收起 */
	running?: boolean;
	/** reasoning_content 聚合文本（可能为空） */
	reasoning?: string;
	/** 完成后耗时文案，如「用时 4 秒」 */
	durationText?: string;
	/** 首次挂载即展开（live 面板用） */
	defaultOpen?: boolean;
};

export function AskThinking({
	steps,
	running = false,
	reasoning = "",
	durationText = "",
	defaultOpen = false,
}: AskThinkingProps): ReactElement | null {
	const [open, setOpen] = useState(defaultOpen || running);
	const wasRunning = useRef(running);

	useEffect(() => {
		if (running) setOpen(true);
	}, [running]);

	// 主流做法（DeepSeek/豆包）：作答开始即收起思考，用户可再点开
	useEffect(() => {
		if (wasRunning.current && !running) setOpen(false);
		wasRunning.current = running;
	}, [running]);

	if (!steps.length && !reasoning) return null;

	// 收起态也透出真实检索结果数（来自 search 步骤的 hits）
	const searchStep = steps.find((s) => s.kind === "search");
	const hitCount = searchStep?.hits?.length ?? 0;

	return (
		<div className="ask-think" data-open={open ? "" : undefined}>
			<button
				type="button"
				className="ask-think-trigger"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
			>
				{running ? (
					<Loader2 className="ask-think-spin" aria-hidden="true" />
				) : (
					<Brain className="ask-think-trigger-icon" aria-hidden="true" />
				)}
					<span className="ask-think-trigger-text">
						{running
							? reasoning
								? "深度思考中…"
								: "思考中…"
							: durationText
								? `已深度思考（${durationText}）`
								: "已深度思考"}
					</span>
					{!running && hitCount > 0 ? (
						<span className="ask-think-trigger-hits">
							· 找到 {hitCount} 篇相关笔记
						</span>
					) : null}
				<ChevronDown className="ask-think-chevron" aria-hidden="true" />
			</button>

			{open ? (
				<div className="ask-think-body">
					{reasoning ? (
						<div className="ask-think-step" data-kind="parse">
							<span className="ask-think-step-icon" aria-hidden="true">
								<Brain />
							</span>
							<div className="ask-think-step-main">
								<div className="ask-think-step-head">
									<span className="ask-think-step-label">深度思考</span>
									{running ? (
										<Loader2
											className="ask-think-spin ask-think-status"
											aria-hidden="true"
										/>
									) : (
										<Check className="ask-think-status" aria-hidden="true" />
									)}
								</div>
								<ReasoningBlock text={reasoning} live={running} />
							</div>
						</div>
					) : null}

					{steps.map((step) => {
						const Icon = KIND_ICON[step.kind] ?? Sparkles;
						const done = step.status === "done";
						return (
							<div
								key={step.id}
								className="ask-think-step"
								data-kind={step.kind}
								data-status={step.status}
							>
								<span className="ask-think-step-icon" aria-hidden="true">
									<Icon />
								</span>
								<div className="ask-think-step-main">
									<div className="ask-think-step-head">
										<span className="ask-think-step-label">{step.label}</span>
										{done ? (
											<Check className="ask-think-status" aria-hidden="true" />
										) : (
											<Loader2
												className="ask-think-spin ask-think-status"
												aria-hidden="true"
											/>
										)}
									</div>
									{step.summary ? (
										<p className="ask-think-step-summary">{step.summary}</p>
									) : null}
									{step.hits?.length ? <HitsBlock hits={step.hits} /> : null}
								</div>
							</div>
						);
					})}
				</div>
			) : null}
		</div>
	);
}

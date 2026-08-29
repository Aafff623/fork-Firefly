/**
 * Vendored & adapted from timDeHof/shadcn-timeline (MIT)
 * https://github.com/timDeHof/shadcn-timeline
 * Extended: side left/right stagger + children rich slot for Firefly dynamic feed.
 * 星轨移植：行进视口渐显（whileInView, once）+ 调用方可传 transition delay。
 * （原 timeline.tsx 被 OneDrive 同步循环回滚 2026-08-29，换名后新路径同步正常。）
 */
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import * as React from "react";
import type { TimelineColor, TimelineSide, TimelineStatus } from "./types";
import { cn } from "./utils";

type TimelineVariantSchema = {
	size: {
		sm: string;
		md: string;
		lg: string;
	};
};

type ForwardRefComponent<Element, Props> = React.ForwardRefExoticComponent<
	React.PropsWithoutRef<Props> & React.RefAttributes<Element>
>;

// Astro SSR 注入的 window 桩缺 addEventListener/removeEventListener，
// framer-motion 的 projection 会因此崩；SSR 下补空实现（客户端桩本来就有，不受影响）
if (typeof window !== "undefined" && typeof (window as unknown as Record<string, unknown>).addEventListener !== "function") {
	const noop = () => {};
	const w = window as unknown as Record<string, unknown>;
	w.addEventListener = noop;
	w.removeEventListener = noop;
}


const timelineVariants = cva("ff-tl relative flex w-full flex-col", {
	variants: {
		size: {
			sm: "gap-4",
			md: "gap-6",
			lg: "gap-8",
		},
	},
	defaultVariants: {
		size: "md",
	},
}) as ReturnType<typeof cva<TimelineVariantSchema>>;

interface TimelineProps
	extends React.HTMLAttributes<HTMLOListElement>,
		VariantProps<typeof timelineVariants> {
	iconsize?: "sm" | "md" | "lg";
}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
	({ className, iconsize, size, children, ...props }, ref) => {
		const items = React.Children.toArray(children);

		if (items.length === 0) {
			return <TimelineEmpty />;
		}

		return (
			<ol
					ref={ref}
					aria-label="Timeline"
					className={cn(timelineVariants({ size }), "ff-tl-root", className)}
					{...props}
				>
				{React.Children.map(children, (child, index) => {
					if (
						React.isValidElement(child) &&
						typeof child.type !== "string" &&
						// 注意：Fragment 的 type 是 Symbol 原始值，`in` 判别会抛错；用属性访问兜底
						(child.type as { displayName?: string }).displayName ===
							"TimelineItem"
					) {
						return React.cloneElement(child, {
							iconsize,
							showConnector: index !== items.length - 1,
						} as React.ComponentProps<typeof TimelineItem>);
					}
					return child;
				})}
			</ol>
		);
	},
) as ForwardRefComponent<HTMLOListElement, TimelineProps>;
Timeline.displayName = "Timeline";

interface TimelineItemProps extends Omit<HTMLMotionProps<"li">, "ref"> {
	date?: string;
	title?: string;
	description?: string;
	icon?: React.ReactNode;
	iconColor?: TimelineColor;
	status?: TimelineStatus;
	connectorColor?: TimelineColor;
	showConnector?: boolean;
	iconsize?: "sm" | "md" | "lg";
	loading?: boolean;
	error?: string;
	/** Agent Router–style stagger: left or right of center axis */
	side?: TimelineSide;
	/** Rich body (blog HTML / gallery / comments). Prefer over description. */
	children?: React.ReactNode;
	pinned?: boolean;
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
	(
		{
			className,
			date,
			title,
			description,
			icon,
			iconColor,
			status = "completed",
			connectorColor,
			showConnector = true,
			iconsize,
			loading,
			error,
			side = "left",
			children,
			pinned,
			id,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			initial,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			animate,
			transition,
			...props
		},
		ref,
	) => {
		const commonClassName = cn(
			"ff-tl-item relative w-full",
			pinned && "ff-tl-item--pinned",
			className,
		);

		if (loading) {
			return (
				<motion.li
					ref={ref}
					id={id}
					className={commonClassName}
					data-side={side}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					role="status"
					{...props}
				>
					<div className="ff-tl-grid">
						<div className="ff-tl-rail">
							<div className="ff-tl-dot ff-tl-dot--muted">
								<Loader2 className="ff-tl-dot-svg animate-spin" />
							</div>
							{showConnector && (
								<div className="ff-tl-connector ff-tl-connector--pulse" />
							)}
						</div>
						<div className="ff-tl-panel card-base ff-tl-panel--skeleton">
							<div className="ff-tl-skel ff-tl-skel--sm" />
							<div className="ff-tl-skel ff-tl-skel--md" />
						</div>
					</div>
				</motion.li>
			);
		}

		if (error) {
			return (
				<motion.li
					ref={ref}
					id={id}
					className={cn(commonClassName, "ff-tl-item--error")}
					data-side={side}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					role="alert"
					{...props}
				>
					<div className="ff-tl-grid">
						<div className="ff-tl-rail">
							<div className="ff-tl-dot ff-tl-dot--destructive">
								<AlertCircle className="ff-tl-dot-svg" />
							</div>
							{showConnector && (
								<TimelineConnector status="pending" className="ff-tl-connector" />
							)}
						</div>
						<div className="ff-tl-panel card-base">
							{date && (
								<TimelineTime className="ff-tl-date text-destructive">
									{date}
								</TimelineTime>
							)}
							<TimelineTitle className="text-destructive">
								{title || "Error"}
							</TimelineTitle>
							<TimelineDescription className="text-destructive">
								{error}
							</TimelineDescription>
						</div>
					</div>
				</motion.li>
			);
		}

		const {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			style,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			onDrag,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			onDragStart,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			onDragEnd,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			onAnimationStart,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			onAnimationComplete,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			transformTemplate,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			whileHover,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			whileTap,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			whileDrag,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			whileFocus,
			...filteredProps
		} = props;

		// Astro SSR 可能有 window 桩但无 matchMedia；须双重守卫
		const reduceMotion =
			typeof window !== "undefined" &&
			typeof window.matchMedia === "function" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		return (
			<motion.li
				ref={ref}
				id={id}
				className={commonClassName}
				data-side={side}
				data-status={status}
				initial={reduceMotion ? false : { opacity: 0, y: 16 }}
				whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.15 }}
				transition={
					reduceMotion
						? undefined
						: { duration: 0.35, ease: "easeOut", ...(transition || {}) }
				}
				{...(status === "in-progress" ? { "aria-current": "step" as const } : {})}
				{...filteredProps}
			>
				<div className="ff-tl-grid">
					<div className="ff-tl-rail" aria-hidden="true">
						<div className="relative z-10">
							<TimelineIcon
								icon={icon}
								color={iconColor}
								status={status}
								iconSize={iconsize}
							/>
						</div>
						{showConnector && (
							<TimelineConnector
								status={status}
								color={connectorColor}
								className="ff-tl-connector"
							/>
						)}
					</div>

					<div className="ff-tl-panel card-base">
						{date && (
							<a className="ff-tl-date-link" href={`#${id || ""}`}>
								<TimelineTime className="ff-tl-date">{date}</TimelineTime>
							</a>
						)}
						{(title || description) && !children && (
							<>
								{title && (
									<TimelineHeader>
										<TimelineTitle>{title}</TimelineTitle>
									</TimelineHeader>
								)}
								{description && (
									<TimelineDescription>{description}</TimelineDescription>
								)}
							</>
						)}
						{children}
					</div>
				</div>
			</motion.li>
		);
	},
) as ForwardRefComponent<HTMLLIElement, TimelineItemProps>;
TimelineItem.displayName = "TimelineItem";

interface TimelineTimeProps extends React.HTMLAttributes<HTMLTimeElement> {
	date?: string | Date | number;
	format?: Intl.DateTimeFormatOptions;
}

const defaultDateFormat: Intl.DateTimeFormatOptions = {
	year: "numeric",
	month: "short",
	day: "2-digit",
};

const TimelineTime = React.forwardRef<HTMLTimeElement, TimelineTimeProps>(
	({ className, date, format, children, ...props }, ref) => {
		const formattedDate = React.useMemo(() => {
			if (!date) return "";
			try {
				const dateObj = new Date(date);
				if (Number.isNaN(dateObj.getTime())) return "";
				return new Intl.DateTimeFormat("zh-CN", {
					...defaultDateFormat,
					...format,
				}).format(dateObj);
			} catch {
				return "";
			}
		}, [date, format]);

		return (
			<time
				ref={ref}
				dateTime={date ? new Date(date).toISOString() : undefined}
				className={cn("ff-tl-time", className)}
				{...props}
			>
				{children || formattedDate}
			</time>
		);
	},
) as ForwardRefComponent<HTMLTimeElement, TimelineTimeProps>;
TimelineTime.displayName = "TimelineTime";

const TimelineConnector = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		status?: TimelineStatus;
		color?: TimelineColor;
	}
>(({ className, status = "completed", color, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"ff-tl-connector",
			color === "primary" || (!color && status === "completed")
				? "ff-tl-connector--completed"
				: "",
			color === "muted" || (!color && status === "pending")
				? "ff-tl-connector--pending"
				: "",
			color === "secondary" ? "ff-tl-connector--secondary" : "",
			!color && status === "in-progress" ? "ff-tl-connector--progress" : "",
			className,
		)}
		{...props}
	/>
)) as ForwardRefComponent<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		status?: TimelineStatus;
		color?: TimelineColor;
	}
>;
TimelineConnector.displayName = "TimelineConnector";

const TimelineHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("ff-tl-header", className)} {...props} />
)) as ForwardRefComponent<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>;
TimelineHeader.displayName = "TimelineHeader";

const TimelineTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
	<h3 ref={ref} className={cn("ff-tl-title", className)} {...props}>
		{children}
	</h3>
)) as ForwardRefComponent<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>;
TimelineTitle.displayName = "TimelineTitle";

const TimelineIcon = ({
	icon,
	color = "primary",
	status = "completed",
	iconSize = "md",
}: {
	icon?: React.ReactNode;
	color?: TimelineColor;
	status?: TimelineStatus | "error";
	iconSize?: "sm" | "md" | "lg";
}): React.JSX.Element => {
	const resolvedColor =
		color ||
		(status === "completed"
			? "primary"
			: status === "in-progress"
				? "secondary"
				: status === "error"
					? "destructive"
					: "muted");

	return (
		<div
			className={cn(
				"ff-tl-dot",
				`ff-tl-dot--${iconSize}`,
				`ff-tl-dot--${resolvedColor}`,
			)}
		>
			{icon ? <div className="ff-tl-dot-inner">{icon}</div> : null}
		</div>
	);
};

const TimelineDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p ref={ref} className={cn("ff-tl-desc", className)} {...props} />
)) as ForwardRefComponent<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>;
TimelineDescription.displayName = "TimelineDescription";

const TimelineContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("ff-tl-content", className)} {...props} />
)) as ForwardRefComponent<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>;
TimelineContent.displayName = "TimelineContent";

const TimelineEmpty = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("ff-tl-empty card-base", className)}
		{...props}
	>
		<p>{children || "No timeline items to display"}</p>
	</div>
)) as ForwardRefComponent<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>;
TimelineEmpty.displayName = "TimelineEmpty";

export {
	Timeline,
	TimelineItem,
	TimelineConnector,
	TimelineHeader,
	TimelineTitle,
	TimelineIcon,
	TimelineDescription,
	TimelineContent,
	TimelineTime,
	TimelineEmpty,
};

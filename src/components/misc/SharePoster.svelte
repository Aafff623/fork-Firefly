<script lang="ts">
import QRCode from "qrcode";
import { onMount } from "svelte";
import Icon from "@/components/common/Icon.svelte";
import { siteConfig } from "@/config";
import iconsData from "@/constants/icons-data.json";
import { url as withBase } from "@/utils/url-utils";
import I18nKey from "../../i18n/i18nKey";
import { i18n } from "../../i18n/translation";

export let title: string;
export let author: string;
export let description = "";
export let pubDate: string;
export let coverImage: string | null = null;
export let coverImageSelector: string | null = null;
export let url: string;
export let siteTitle: string;
export let avatar: string | null = null;
export let avatarSelector: string | null = null;

let showModal = false;
let posterImage: string | null = null;
let generating = false;
let themeColor = "#558e88"; // Default blue
/** 与惊喜信封落款同气质 */
const brandTitleColor = "#8a6c3c";
const BRAND_FONT_STACK =
	'"Segoe Script", "Apple Chancery", "Snell Roundhand", "Caveat", cursive';

onMount(() => {
	// Get theme color from CSS variable
	const temp = document.createElement("div");
	temp.style.color = "var(--primary)";
	temp.style.display = "none";
	document.body.appendChild(temp);
	const computedColor = getComputedStyle(temp).color;
	document.body.removeChild(temp);

	if (computedColor) {
		themeColor = computedColor;
	}

	ensureBrandFontLink();
});

/** 补 Caveat 作跨平台兜底（与标签墙同 CDN） */
function ensureBrandFontLink() {
	if (typeof document === "undefined") return;
	if (document.querySelector('link[data-share-brand-font="1"]')) return;
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href =
		"https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&display=swap";
	link.dataset.shareBrandFont = "1";
	document.head.appendChild(link);
}

async function ensureBrandFontReady() {
	ensureBrandFontLink();
	if (!document.fonts?.load) return;
	try {
		await Promise.all([
			document.fonts.load(`600 18px ${BRAND_FONT_STACK}`),
			document.fonts.load(`700 18px "Caveat", cursive`),
		]);
	} catch {
		/* canvas 仍可回退系统 cursive */
	}
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => {
			if (!src.includes("images.weserv.nl")) {
				const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&output=png`;
				const proxyImg = new Image();
				proxyImg.crossOrigin = "anonymous";
				proxyImg.onload = () => resolve(proxyImg);
				proxyImg.onerror = () => {
					resolve(null);
				};
				proxyImg.src = proxyUrl;
			} else {
				resolve(null);
			}
		};
		img.src = src;
	});
}

function resolveImageSource(
	src: string | null,
	selector: string | null,
): string | null {
	if (!selector) return src;
	const image = document.querySelector<HTMLImageElement>(selector);
	return image?.currentSrc || image?.src || src;
}

// 站点 Logo：图标优先复用导航栏已渲染的 SVG（astro-icon 覆盖完整图标库），图片复用导航栏已优化的地址
function serializeNavbarIcon(color: string, size: number): string | null {
	const svg = document.querySelector<SVGSVGElement>("#navbar svg.navbar-logo");
	if (!svg) return null;

	const clone = svg.cloneNode(true) as SVGSVGElement;
	clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	// 导航栏图标宽高是 1em，脱离文档后需要显式尺寸才能被 canvas 光栅化
	clone.setAttribute("width", String(size));
	clone.setAttribute("height", String(size));
	clone.removeAttribute("class");
	// 让图标内部的 currentColor 解析成海报里的颜色
	clone.setAttribute("style", `color:${color}`);

	const markup = new XMLSerializer().serializeToString(clone);
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function buildIconDataUrl(icon: string, color: string): string | null {
	const [prefix, name] = icon.split(":");
	if (!prefix || !name) return null;

	const collection = (
		iconsData as Record<
			string,
			{
				icons?: Record<string, { body: string }>;
				width?: number;
				height?: number;
			}
		>
	)[prefix];
	const body = collection?.icons?.[name]?.body;
	if (!body) return null;

	const iconWidth = collection.width ?? 24;
	const iconHeight = collection.height ?? 24;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconWidth}" height="${iconHeight}" viewBox="0 0 ${iconWidth} ${iconHeight}">${body.replaceAll("currentColor", color)}</svg>`;

	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function resolveSiteLogoSource(color: string, size: number): string | null {
	const logo = siteConfig.navbar.logo;
	if (!logo?.value) return null;

	if (logo.type === "icon") {
		// icons-data.json 只含 Svelte 组件用到的图标子集，因此优先取导航栏的 SVG
		return (
			serializeNavbarIcon(color, size) ?? buildIconDataUrl(logo.value, color)
		);
	}

	// src 目录下的图片经 Astro 优化后只有导航栏能拿到最终地址
	// 海报背景是白色，因此固定取亮色版本的 Logo
	const navbarLogo =
		document.querySelector<HTMLImageElement>(
			'#navbar img.navbar-logo[data-logo-theme="light"]',
		) ?? document.querySelector<HTMLImageElement>("#navbar img.navbar-logo");
	const navbarLogoSrc = navbarLogo?.currentSrc || navbarLogo?.src;
	if (navbarLogoSrc) return navbarLogoSrc;

	if (logo.type === "url") return logo.value;
	// public 目录下的图片可直接拼接 base 路径，src 目录下的则无法在客户端还原
	return logo.value.startsWith("/") || logo.value.startsWith("http")
		? withBase(logo.value)
		: null;
}

function getLines(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
): string[] {
	const chars = text.split("");
	const lines: string[] = [];
	let currentLine = "";

	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		const width = ctx.measureText(currentLine + char).width;
		if (width < maxWidth) {
			currentLine += char;
		} else {
			lines.push(currentLine);
			currentLine = char;
		}
	}
	if (currentLine) {
		lines.push(currentLine);
	}
	return lines;
}

function fitText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
): string {
	if (ctx.measureText(text).width <= maxWidth) return text;

	const ellipsis = "...";
	const fittedChars = Array.from(text);
	while (
		fittedChars.length > 0 &&
		ctx.measureText(`${fittedChars.join("")}${ellipsis}`).width > maxWidth
	) {
		fittedChars.pop();
	}

	return fittedChars.length > 0
		? `${fittedChars.join("")}${ellipsis}`
		: ellipsis;
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

async function generatePoster() {
	showModal = true;
	// 版式升级后强制重绘，避免会话内旧海报缓存
	posterImage = null;

	generating = true;
	try {
		await ensureBrandFontReady();

		const scale = 2;
		const width = 460 * scale;
		const padding = 32 * scale;
		const logoBox = 24 * scale;
		const paperBg = "#faf7f2";
		const ink = "#1f2937";
		const mutedInk = "#6b7280";
		const bodyFont = "'Roboto', sans-serif";
		const ruleColor = "rgba(44, 36, 22, 0.1)";

		// 1. Prepare resources
		const qrCodeUrl = await QRCode.toDataURL(url, {
			margin: 1,
			width: 100 * scale,
			color: { dark: "#1f2937", light: "#faf7f2" },
		});
		const resolvedCoverImage = resolveImageSource(
			coverImage,
			coverImageSelector,
		);
		const resolvedAvatar = resolveImageSource(avatar, avatarSelector);
		const resolvedSiteLogo = resolveSiteLogoSource(brandTitleColor, logoBox);
		const [qrImg, coverImg, avatarImg, logoImg] = await Promise.all([
			loadImage(qrCodeUrl),
			resolvedCoverImage
				? loadImage(resolvedCoverImage)
				: Promise.resolve(null),
			resolvedAvatar ? loadImage(resolvedAvatar) : Promise.resolve(null),
			resolvedSiteLogo ? loadImage(resolvedSiteLogo) : Promise.resolve(null),
		]);

		// 2. Setup Canvas
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Canvas context not available");

		canvas.width = width;
		canvas.height = 1400 * scale;

		// 3. Layout — 纸质礼品卡：留白松、正文用原简洁字体
		const contentWidth = width - padding * 2;
		let currentY = 0;

		const coverHeight = (coverImg ? 236 : 96) * scale;
		const headerBand = (coverImg ? 52 : 0) * scale;
		currentY += coverHeight;
		currentY += 28 * scale;

		ctx.font = `700 ${24 * scale}px ${bodyFont}`;
		const titleLines = getLines(ctx, title, contentWidth);
		const titleLineHeight = 34 * scale;
		const titleHeight = titleLines.length * titleLineHeight;
		currentY += titleHeight;
		currentY += 22 * scale;

		let descHeight = 0;
		const descLineHeight = 26 * scale;
		let displayDescLines: string[] = [];
		if (description) {
			ctx.font = `400 ${14 * scale}px ${bodyFont}`;
			const descLines = getLines(ctx, description, contentWidth - 16 * scale);
			displayDescLines = descLines.slice(0, 5);
			descHeight = displayDescLines.length * descLineHeight;
			currentY += descHeight;
			currentY += 22 * scale;
		} else {
			currentY += 12 * scale;
		}

		currentY += 18 * scale;
		const footerHeight = 92 * scale;
		currentY += footerHeight;
		currentY += 26 * scale;

		const minCardHeight = 600 * scale;
		canvas.height = Math.max(currentY, minCardHeight);
		const extraBreath =
			canvas.height > currentY ? (canvas.height - currentY) / 2 : 0;

		// 4. 纸面：暖白 + 极淡纹线（纸质，不花哨）
		ctx.fillStyle = paperBg;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.save();
		ctx.strokeStyle = "rgba(201, 168, 106, 0.07)";
		ctx.lineWidth = 1;
		for (let y = 28 * scale; y < canvas.height; y += 22 * scale) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
		ctx.restore();

		// 内缘细线（像卡纸压边，很轻）
		ctx.strokeStyle = "rgba(44, 36, 22, 0.08)";
		ctx.lineWidth = 1 * scale;
		ctx.strokeRect(
			8 * scale,
			8 * scale,
			width - 16 * scale,
			canvas.height - 16 * scale,
		);
		// Parse Date
		let dateObj: { day: string; month: string; year: string } | null = null;
		try {
			const d = new Date(pubDate);
			if (!Number.isNaN(d.getTime())) {
				dateObj = {
					day: d.getDate().toString().padStart(2, "0"),
					month: (d.getMonth() + 1).toString().padStart(2, "0"),
					year: d.getFullYear().toString(),
				};
			}
		} catch (e) {}

		const dateText = dateObj
			? `${dateObj.year}.${dateObj.month}.${dateObj.day}`
			: "";

		// Cover / brand header band
		if (coverImg) {
			const imgRatio = coverImg.width / coverImg.height;
			const targetRatio = width / coverHeight;
			let sx: number;
			let sy: number;
			let sWidth: number;
			let sHeight: number;

			if (imgRatio > targetRatio) {
				sHeight = coverImg.height;
				sWidth = sHeight * targetRatio;
				sx = (coverImg.width - sWidth) / 2;
				sy = 0;
			} else {
				sWidth = coverImg.width;
				sHeight = sWidth / targetRatio;
				sx = 0;
				sy = (coverImg.height - sHeight) / 2;
			}
			ctx.drawImage(
				coverImg,
				sx,
				sy,
				sWidth,
				sHeight,
				0,
				0,
				width,
				coverHeight,
			);
			const grad = ctx.createLinearGradient(0, 0, 0, headerBand + 20 * scale);
			grad.addColorStop(0, "rgba(250, 247, 242, 0.94)");
			grad.addColorStop(1, "rgba(250, 247, 242, 0)");
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, width, headerBand + 28 * scale);
		} else {
			ctx.fillStyle = paperBg;
			ctx.fillRect(0, 0, width, coverHeight);
		}

		// Brand row（艺术字保留）
		const brandY = coverImg ? headerBand / 2 + 4 * scale : 44 * scale;
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		ctx.fillStyle = mutedInk;
		ctx.font = `${11 * scale}px ${bodyFont}`;
		const dateWidth = dateText ? ctx.measureText(dateText).width : 0;
		if (dateText) {
			ctx.fillText(dateText, width - padding, brandY);
		}

		ctx.textAlign = "left";
		ctx.fillStyle = brandTitleColor;
		ctx.font = `600 ${22 * scale}px ${BRAND_FONT_STACK}`;

		const logoGap = 10 * scale;
		let logoW = 0;
		let logoH = 0;
		if (logoImg) {
			const ratio =
				logoImg.width && logoImg.height ? logoImg.width / logoImg.height : 1;
			logoW = ratio >= 1 ? logoBox : logoBox * ratio;
			logoH = ratio >= 1 ? logoBox / ratio : logoBox;
		}
		const siteTitleX = logoImg ? padding + logoW + logoGap : padding;

		const siteTitleText = fitText(
			ctx,
			siteTitle,
			contentWidth -
				(siteTitleX - padding) -
				(dateWidth > 0 ? dateWidth + 18 * scale : 0),
		);

		if (logoImg) {
			const metrics = ctx.measureText(siteTitleText);
			const ascent = metrics.actualBoundingBoxAscent;
			const descent = metrics.actualBoundingBoxDescent;
			const titleCenterY =
				Number.isFinite(ascent) && Number.isFinite(descent)
					? brandY + (descent - ascent) / 2
					: brandY;
			ctx.drawImage(logoImg, padding, titleCenterY - logoH / 2, logoW, logoH);
		}
		ctx.fillText(siteTitleText, siteTitleX, brandY);

		let drawY = coverHeight + 28 * scale + extraBreath * 0.35;

		// Title — 原简洁无衬线
		ctx.textBaseline = "top";
		ctx.textAlign = "left";
		ctx.font = `700 ${24 * scale}px ${bodyFont}`;
		ctx.fillStyle = ink;
		titleLines.forEach((line) => {
			ctx.fillText(line, padding, drawY);
			drawY += titleLineHeight;
		});
		drawY += 22 * scale;

		// Description — 无引用框，原字体 + 细竖线
		if (description && displayDescLines.length) {
			ctx.fillStyle = "#e5e7eb";
			drawRoundedRect(
				ctx,
				padding,
				drawY - 2 * scale,
				3 * scale,
				descHeight + 4 * scale,
				1.5 * scale,
			);
			ctx.fill();

			ctx.font = `400 ${14 * scale}px ${bodyFont}`;
			ctx.fillStyle = mutedInk;
			displayDescLines.forEach((line) => {
				ctx.fillText(line, padding + 14 * scale, drawY);
				drawY += descLineHeight;
			});
			drawY += 22 * scale;
		} else {
			drawY += 12 * scale;
		}

		// Footer divider
		drawY += 8 * scale + extraBreath * 0.65;
		ctx.beginPath();
		ctx.strokeStyle = ruleColor;
		ctx.lineWidth = 1 * scale;
		ctx.moveTo(padding, drawY);
		ctx.lineTo(width - padding, drawY);
		ctx.stroke();
		drawY += 18 * scale;

		const footerY = drawY;
		const qrSize = 68 * scale;
		const qrX = width - padding - qrSize;
		const authorY = footerY + 4 * scale;
		const avatarSize = 56 * scale;

		if (avatarImg) {
			ctx.save();
			const avatarX = padding;
			ctx.beginPath();
			ctx.arc(
				avatarX + avatarSize / 2,
				authorY + avatarSize / 2,
				avatarSize / 2,
				0,
				Math.PI * 2,
			);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatarImg, avatarX, authorY, avatarSize, avatarSize);
			ctx.restore();

			ctx.beginPath();
			ctx.arc(
				avatarX + avatarSize / 2,
				authorY + avatarSize / 2,
				avatarSize / 2,
				0,
				Math.PI * 2,
			);
			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 2 * scale;
			ctx.stroke();
		}

		const authorTextX =
			padding + (resolvedAvatar ? avatarSize + 14 * scale : 0);
		const authorMaxWidth = qrX - 20 * scale - authorTextX;
		const textCenterY = authorY + avatarSize / 2;

		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillStyle = mutedInk;
		ctx.font = `${11 * scale}px ${bodyFont}`;
		ctx.fillText(i18n(I18nKey.author), authorTextX, textCenterY - 18 * scale);

		// 作者名保留艺术字
		ctx.fillStyle = brandTitleColor;
		ctx.font = `600 ${18 * scale}px ${BRAND_FONT_STACK}`;
		ctx.fillText(
			fitText(ctx, author, authorMaxWidth),
			authorTextX,
			textCenterY + 2 * scale,
		);

		ctx.fillStyle = "#ffffff";
		ctx.shadowColor = "rgba(0, 0, 0, 0.04)";
		ctx.shadowBlur = 4 * scale;
		ctx.shadowOffsetY = 1 * scale;
		drawRoundedRect(ctx, qrX, footerY, qrSize, qrSize, 4 * scale);
		ctx.fill();
		ctx.shadowColor = "transparent";

		const qrInnerSize = 56 * scale;
		const qrPad = (qrSize - qrInnerSize) / 2;
		if (qrImg) {
			ctx.drawImage(
				qrImg,
				qrX + qrPad,
				footerY + qrPad,
				qrInnerSize,
				qrInnerSize,
			);
		}

		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillStyle = mutedInk;
		ctx.font = `${10 * scale}px ${bodyFont}`;
		ctx.fillText(
			fitText(ctx, i18n(I18nKey.scanToRead), qrSize + 8 * scale),
			qrX + qrSize / 2,
			footerY + qrSize + 8 * scale,
		);

		posterImage = canvas.toDataURL("image/png");
		generating = false;
	} catch (error) {
		console.error("Failed to generate poster:", error);
		generating = false;
	}
}

function downloadPoster() {
	if (posterImage) {
		const a = document.createElement("a");
		a.href = posterImage;
		a.download = `poster-${title.replace(/\s+/g, "-")}.png`;
		a.click();
	}
}

function closeModal() {
	showModal = false;
}

function handleKeydown(e: KeyboardEvent) {
	if (e.key === "Escape" && showModal) {
		closeModal();
	}
}

let copied = false;
function copyLink() {
	navigator.clipboard.writeText(url);
	copied = true;
	setTimeout(() => {
		copied = false;
	}, 2000);
}

function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		},
	};
}
</script>

<!-- Trigger Button -->
<button
  type="button"
  class="share-bar__action share-bar__action--poster"
  on:click={generatePoster}
  aria-label={i18n(I18nKey.shareArticle)}
>
  <span class="share-bar__action-icon" aria-hidden="true">
    <Icon icon="lucide:share-2" class="share-bar__action-glyph" />
  </span>
  <span>{i18n(I18nKey.shareArticle)}</span>
</button>

<svelte:window on:keydown={handleKeydown} />

<!-- Modal -->
{#if showModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    use:portal
    class="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-opacity"
    role="dialog"
    aria-modal="true"
    aria-label={i18n(I18nKey.shareArticle)}
    on:click={closeModal}
  >
    <div
      class="relative overflow-hidden rounded-2xl max-w-[440px] w-full max-h-[92vh] flex flex-col shadow-2xl transform transition-all border border-black/8 bg-[#f3efe8] dark:bg-gray-900 dark:border-gray-700"
      on:click={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        class="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white/95 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800/95 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        on:click={closeModal}
        aria-label={i18n(I18nKey.announcementClose)}
        title={i18n(I18nKey.announcementClose)}
      >
        <Icon icon="lucide:x" class="h-3.5 w-3.5" />
      </button>

      <div class="px-3.5 pt-4 pb-2 flex justify-center items-center">
        {#if posterImage}
          <img src={posterImage} alt="Poster" class="max-w-full h-auto rounded-xl shadow-[0_10px_28px_rgba(0,0,0,0.12)] ring-1 ring-black/6" />
        {:else}
           <div class="flex flex-col items-center gap-3 py-16">
             <div class="w-7 h-7 border-2 border-gray-200 rounded-full animate-spin" style="border-top-color: {themeColor}"></div>
             <span class="text-sm text-gray-500 dark:text-gray-400">{i18n(I18nKey.generatingPoster)}</span>
           </div>
        {/if}
      </div>
      
      <div class="share-poster-modal__footer px-3.5 pb-3.5 pt-1">
        <div class="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            class="share-poster-modal__btn"
            on:click={copyLink}
          >
            <span class="share-poster-modal__btn-icon" aria-hidden="true">
              {#if copied}
                <Icon icon="lucide:check" class="share-poster-modal__btn-glyph" />
              {:else}
                <Icon icon="lucide:link" class="share-poster-modal__btn-glyph" />
              {/if}
            </span>
            <span>{copied ? i18n(I18nKey.copied) : i18n(I18nKey.copyLink)}</span>
          </button>
          <button
            type="button"
            class="share-poster-modal__btn share-poster-modal__btn--primary"
            on:click={downloadPoster}
            disabled={!posterImage}
          >
            <span class="share-poster-modal__btn-icon" aria-hidden="true">
              <Icon icon="lucide:download" class="share-poster-modal__btn-glyph" />
            </span>
            <span>{i18n(I18nKey.savePoster)}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.share-poster-modal__btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    min-height: 2rem;
    padding: 0.35rem 0.55rem;
    border-radius: 0.45rem;
    border: 1px solid oklch(0% 0 0 / 0.08);
    background: oklch(99% 0.004 260 / 0.92);
    color: oklch(38% 0.02 260);
    font-size: 0.75rem;
    font-weight: 600;
    transition:
      border-color 0.16s ease,
      background 0.16s ease;
  }

  :global(html.dark .share-poster-modal__btn) {
    border-color: oklch(100% 0 0 / 0.1);
    background: oklch(24% 0.02 260);
    color: oklch(88% 0.01 260);
  }

  :global(.share-poster-modal__btn-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.35rem;
    height: 1.35rem;
    border-radius: 0.35rem;
    background: oklch(96% 0.008 260);
    color: oklch(48% 0.02 260);
    flex-shrink: 0;
  }

  :global(html.dark .share-poster-modal__btn-icon) {
    background: oklch(30% 0.02 260);
    color: oklch(76% 0.02 260);
  }

  :global(.share-poster-modal__btn-glyph) {
    width: 0.75rem !important;
    height: 0.75rem !important;
    font-size: 0.75rem !important;
  }

  :global(.share-poster-modal__btn--primary) {
    border-color: color-mix(in oklch, var(--primary) 35%, transparent);
    background: color-mix(in oklch, var(--primary) 92%, white);
    color: white;
  }

  :global(html.dark .share-poster-modal__btn--primary) {
    background: color-mix(in oklch, var(--primary) 78%, black);
    color: oklch(98% 0.01 260);
  }

  :global(.share-poster-modal__btn--primary .share-poster-modal__btn-icon) {
    background: oklch(100% 0 0 / 0.16);
    color: inherit;
  }

  :global(.share-poster-modal__btn:hover:not(:disabled)) {
    border-color: color-mix(in oklch, var(--primary) 24%, oklch(0% 0 0 / 0.08));
  }

  :global(.share-poster-modal__btn:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

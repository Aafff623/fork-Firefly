export const OWNER_GITHUB_ID = 182515127;
export const OWNER_SESSION_COOKIE = "firefly_owner_session";
export const OAUTH_TRANSACTION_COOKIE = "firefly_oauth_transaction";

const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const OAUTH_TTL_MS = 10 * 60 * 1000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const devFallbackSecret = randomToken(48);
const mutationWindows = new Map<number, number[]>();

export type OwnerSession = Readonly<{
	role: "owner" | "user";
	githubId: number;
	login: string;
	avatarUrl: string;
	csrf: string;
	expiresAt: number;
}>;

type SignedSessionPayload = Readonly<{
	type: "session";
	version: 1;
	githubId: number;
	login: string;
	avatarUrl: string;
	csrf: string;
	expiresAt: number;
}>;

type OAuthTransactionPayload = Readonly<{
	type: "oauth";
	version: 1;
	state: string;
	verifier: string;
	returnTo: string;
	expiresAt: number;
}>;

export type MutationValidation =
	| Readonly<{ ok: true; session: OwnerSession }>
	| Readonly<{ ok: false; status: number; error: string }>;

function randomToken(byteLength: number): string {
	const bytes = new Uint8Array(byteLength);
	crypto.getRandomValues(bytes);
	return toBase64Url(bytes);
}

function toBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array | null {
	try {
		const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
		const binary = atob(padded);
		return Uint8Array.from(binary, (character) => character.charCodeAt(0));
	} catch {
		return null;
	}
}

async function signature(value: string, secret: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const bytes = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
	return toBase64Url(new Uint8Array(bytes));
}

function constantTimeEqual(left: string, right: string): boolean {
	if (left.length !== right.length) return false;
	let mismatch = 0;
	for (let index = 0; index < left.length; index += 1) {
		mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
	}
	return mismatch === 0;
}

async function signPayload(payload: object, secret: string): Promise<string> {
	const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
	return `${body}.${await signature(body, secret)}`;
}

async function verifyPayload<T>(
	token: string,
	secret: string,
): Promise<T | null> {
	const separator = token.lastIndexOf(".");
	if (separator <= 0) return null;
	const body = token.slice(0, separator);
	const suppliedSignature = token.slice(separator + 1);
	const expectedSignature = await signature(body, secret);
	if (!constantTimeEqual(suppliedSignature, expectedSignature)) return null;
	const bytes = fromBase64Url(body);
	if (!bytes) return null;
	try {
		return JSON.parse(decoder.decode(bytes)) as T;
	} catch {
		return null;
	}
}

export async function createOwnerSession(
	viewer: Readonly<{ id: number; login: string; avatarUrl: string }>,
	secret: string,
	now: number = Date.now(),
): Promise<string> {
	const payload: SignedSessionPayload = {
		type: "session",
		version: 1,
		githubId: viewer.id,
		login: viewer.login.slice(0, 80),
		avatarUrl: viewer.avatarUrl.slice(0, 500),
		csrf: randomToken(24),
		expiresAt: now + SESSION_TTL_MS,
	};
	return signPayload(payload, secret);
}

export async function verifyOwnerSession(
	token: string,
	secret: string,
	now: number = Date.now(),
): Promise<OwnerSession | null> {
	const payload = await verifyPayload<SignedSessionPayload>(token, secret);
	if (
		payload?.type !== "session" ||
		payload.version !== 1 ||
		!Number.isSafeInteger(payload.githubId) ||
		!payload.login ||
		!payload.csrf ||
		payload.expiresAt <= now
	) {
		return null;
	}
	return {
		role: payload.githubId === OWNER_GITHUB_ID ? "owner" : "user",
		githubId: payload.githubId,
		login: payload.login,
		avatarUrl: payload.avatarUrl,
		csrf: payload.csrf,
		expiresAt: payload.expiresAt,
	};
}

function safeReturnTo(value: string | undefined): string {
	if (!value?.startsWith("/") || value.startsWith("//")) return "/";
	try {
		const parsed = new URL(value, "https://firefly.invalid");
		if (parsed.origin !== "https://firefly.invalid") return "/";
		return `${parsed.pathname}${parsed.search}${parsed.hash}`;
	} catch {
		return "/";
	}
}

export async function createOAuthTransaction(
	options: Readonly<{ returnTo?: string }>,
	secret: string,
	now: number = Date.now(),
): Promise<
	Readonly<{
		state: string;
		verifier: string;
		challenge: string;
		returnTo: string;
		cookieValue: string;
	}>
> {
	const state = randomToken(24);
	const verifier = randomToken(48);
	const digest = await crypto.subtle.digest(
		"SHA-256",
		encoder.encode(verifier),
	);
	const payload: OAuthTransactionPayload = {
		type: "oauth",
		version: 1,
		state,
		verifier,
		returnTo: safeReturnTo(options.returnTo),
		expiresAt: now + OAUTH_TTL_MS,
	};
	return {
		state,
		verifier,
		challenge: toBase64Url(new Uint8Array(digest)),
		returnTo: payload.returnTo,
		cookieValue: await signPayload(payload, secret),
	};
}

export async function verifyOAuthTransaction(
	token: string,
	secret: string,
	now: number = Date.now(),
): Promise<OAuthTransactionPayload | null> {
	const payload = await verifyPayload<OAuthTransactionPayload>(token, secret);
	if (
		payload?.type !== "oauth" ||
		payload.version !== 1 ||
		!payload.state ||
		!payload.verifier ||
		payload.expiresAt <= now
	) {
		return null;
	}
	return { ...payload, returnTo: safeReturnTo(payload.returnTo) };
}

export function readCookie(request: Request, name: string): string | null {
	const cookie = request.headers.get("cookie") ?? "";
	for (const part of cookie.split(";")) {
		const [key, ...value] = part.trim().split("=");
		if (key === name) return value.join("=") || null;
	}
	return null;
}

export function ownerCookie(
	name: string,
	value: string,
	options: Readonly<{ secure: boolean; maxAgeSeconds: number }>,
): string {
	return [
		`${name}=${value}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		options.secure ? "Secure" : "",
		`Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`,
	]
		.filter(Boolean)
		.join("; ");
}

export function isLoopbackHostname(hostname: string): boolean {
	return (
		hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
	);
}

export function isLoopbackAddress(address: string | undefined): boolean {
	if (!address) return false;
	const normalized = address.trim().toLowerCase();
	return (
		normalized === "::1" ||
		normalized === "127.0.0.1" ||
		normalized === "::ffff:127.0.0.1"
	);
}

export function canUseOwnerDevBypass(
	request: Request,
	isDev: boolean,
	clientAddress: string | undefined,
): boolean {
	return (
		isDev &&
		process.env.OWNER_DEV_BYPASS === "1" &&
		isLoopbackHostname(new URL(request.url).hostname) &&
		isLoopbackAddress(clientAddress)
	);
}

export function resolveOwnerSessionSecret(
	request: Request,
	isDev: boolean,
	clientAddress?: string,
): string | null {
	const configured = process.env.OWNER_SESSION_SECRET?.trim();
	if (configured && configured.length >= 32) return configured;
	return canUseOwnerDevBypass(request, isDev, clientAddress)
		? devFallbackSecret
		: null;
}

export async function readSessionFromRequest(
	request: Request,
	secret: string,
	now: number = Date.now(),
): Promise<OwnerSession | null> {
	const token = readCookie(request, OWNER_SESSION_COOKIE);
	return token ? verifyOwnerSession(token, secret, now) : null;
}

export async function validateMutationRequest(
	request: Request,
	secret: string,
	now: number = Date.now(),
): Promise<MutationValidation> {
	const validation = await validateSessionMutationRequest(request, secret, now);
	if (!validation.ok) return validation;
	if (validation.session.role !== "owner") {
		return { ok: false, status: 401, error: "owner_required" };
	}
	return validation;
}

export async function validateSessionMutationRequest(
	request: Request,
	secret: string,
	now: number = Date.now(),
): Promise<MutationValidation> {
	const expectedOrigin = new URL(request.url).origin;
	if (request.headers.get("origin") !== expectedOrigin) {
		return { ok: false, status: 403, error: "origin_mismatch" };
	}
	const session = await readSessionFromRequest(request, secret, now);
	if (!session) {
		return { ok: false, status: 401, error: "session_required" };
	}
	if (
		!constantTimeEqual(
			request.headers.get("x-firefly-csrf") ?? "",
			session.csrf,
		)
	) {
		return { ok: false, status: 403, error: "csrf_mismatch" };
	}
	return { ok: true, session };
}

export function checkOwnerMutationRate(
	session: OwnerSession,
	now: number = Date.now(),
	limit = 20,
	windowMs = 60_000,
): boolean {
	const recent = (mutationWindows.get(session.githubId) ?? []).filter(
		(timestamp) => now - timestamp < windowMs,
	);
	if (recent.length >= limit) {
		mutationWindows.set(session.githubId, recent);
		return false;
	}
	recent.push(now);
	mutationWindows.set(session.githubId, recent);
	return true;
}

export function isAllowedOwnerPath(value: string): boolean {
	const normalized = value.trim().replace(/\\/g, "/");
	if (!normalized || normalized.startsWith("/") || normalized.includes("..")) {
		return false;
	}
	return /^(?:[a-z0-9][a-z0-9-]*\.(?:md|mdx)|[a-z0-9][a-z0-9-]*\/(?:index\.(?:md|mdx)|images\/[a-zA-Z0-9._-]+\.(?:avif|gif|jpe?g|png|webp)))$/.test(
		normalized,
	);
}

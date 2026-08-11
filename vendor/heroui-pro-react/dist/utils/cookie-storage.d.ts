import type { LayoutStorage } from "react-resizable-panels";
export declare function getCookie(name: string): string | null;
export declare function setCookie(name: string, value: string, maxAge?: number): void;
/**
 * Create a `LayoutStorage` adapter backed by cookies. Reads fall back to
 * `localStorage` (for client-only apps); writes go to both cookie and
 * `localStorage` so cross-tab readers stay in sync.
 *
 * Pass the returned object to `<Resizable storage={…}>` alongside
 * `autoSaveId` for SSR-friendly persisted panel sizes.
 *
 * @example
 * ```tsx
 * import {createCookieStorage, Resizable} from "@heroui-pro/react";
 *
 * const storage = createCookieStorage();
 *
 * <Resizable autoSaveId="app:panels" storage={storage}>
 *   <Resizable.Panel defaultSize={30} />
 *   <Resizable.Handle />
 *   <Resizable.Panel defaultSize={70} />
 * </Resizable>
 * ```
 */
export declare function createCookieStorage(maxAge?: number): LayoutStorage;

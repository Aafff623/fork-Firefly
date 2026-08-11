export type ParsedShortcut = {
    alt: boolean;
    ctrl: boolean;
    key: string;
    meta: boolean;
    mod: boolean;
    shift: boolean;
};
export declare const parseToggleShortcut: (shortcut: string) => ParsedShortcut | null;
export declare const matchesShortcut: (event: KeyboardEvent, shortcut: ParsedShortcut) => boolean;

import type { ComponentProps } from "react";
import { EmojiReactionButtonCount, EmojiReactionButtonEmoji, EmojiReactionButtonRoot } from "./emoji-reaction-button";
export declare const EmojiReactionButton: (({ children, className, defaultSelected, excludeFromTabOrder, isReadOnly, isSelected, onChange, onClick, onPress, onPressChange, onPressEnd, onPressStart, onPressUp, size, ...props }: import("./emoji-reaction-button").EmojiReactionButtonRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Count: ({ children, className, ...props }: import("./emoji-reaction-button").EmojiReactionButtonCountProps) => import("react/jsx-runtime").JSX.Element;
    Emoji: ({ children, className, ...props }: import("./emoji-reaction-button").EmojiReactionButtonEmojiProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, className, defaultSelected, excludeFromTabOrder, isReadOnly, isSelected, onChange, onClick, onPress, onPressChange, onPressEnd, onPressStart, onPressUp, size, ...props }: import("./emoji-reaction-button").EmojiReactionButtonRootProps) => import("react/jsx-runtime").JSX.Element;
};
export type EmojiReactionButton = {
    Props: ComponentProps<typeof EmojiReactionButtonRoot>;
    RootProps: ComponentProps<typeof EmojiReactionButtonRoot>;
    EmojiProps: ComponentProps<typeof EmojiReactionButtonEmoji>;
    CountProps: ComponentProps<typeof EmojiReactionButtonCount>;
};
export { EmojiReactionButtonRoot, EmojiReactionButtonEmoji, EmojiReactionButtonCount };
export type { EmojiReactionButtonRootProps, EmojiReactionButtonRootProps as EmojiReactionButtonProps, EmojiReactionButtonEmojiProps, EmojiReactionButtonCountProps, } from "./emoji-reaction-button";
export { emojiReactionButtonVariants } from "./emoji-reaction-button.styles";
export type { EmojiReactionButtonVariants } from "./emoji-reaction-button.styles";

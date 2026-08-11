import type { ReactNode } from "react";
interface TreeMotionProviderProps {
    children: ReactNode;
    reduceMotion?: boolean;
}
declare const TreeMotionProvider: ({ children, reduceMotion }: TreeMotionProviderProps) => import("react/jsx-runtime").JSX.Element;
export { TreeMotionProvider };

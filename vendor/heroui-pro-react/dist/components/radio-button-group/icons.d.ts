import type { SVGProps } from "react";
type IconSvgProps = SVGProps<SVGSVGElement> & {
    width?: number;
    height?: number;
};
export declare const CheckIcon: (props: SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
export declare const MasterCardIcon: ({ height, width, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
export declare const VisaIcon: ({ height, width, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
export declare const PayPalIcon: ({ height, width, ...props }: IconSvgProps) => import("react/jsx-runtime").JSX.Element;
export {};

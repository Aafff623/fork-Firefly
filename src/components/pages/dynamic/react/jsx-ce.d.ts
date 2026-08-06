import type { DetailedHTMLProps, HTMLAttributes } from "react";

type CEProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> &
	Record<`data-${string}`, string | boolean | undefined>;

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			"dynamic-gallery": CEProps;
			"dynamic-inline-comments": CEProps;
		}
	}
}

export {};

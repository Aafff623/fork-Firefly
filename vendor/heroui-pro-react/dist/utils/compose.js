"use client";
import{composeRenderProps as n}from"react-aria-components/composeRenderProps";import{cx as o}from"tailwind-variants";function t(t,r){return n(t,(n,t)=>{const e="function"==typeof r?r(t)??"":r??"";return o(e,n??"")??""})}function r(n,o,t){return"function"==typeof n?n({...t??{},className:o}):o}export{r as composeSlotClassName,t as composeTwRenderProps};

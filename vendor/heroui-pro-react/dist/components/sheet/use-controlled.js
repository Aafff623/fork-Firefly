"use client";
import*as e from"react";function r({controlled:r,default:t,onChange:n}){const{current:u}=e.useRef(void 0!==r),[o,c]=e.useState(t),a=u?r:o,s=e.useRef(n);return s.current=n,[a,e.useCallback(e=>{u||c(e),s.current?.(e)},[])]}export{r as useControlled};

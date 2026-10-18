import { useCallback, useEffect, useState, type RefObject } from "react";
import { prefersReducedMotion } from "../../../lib/motion";

/** Returns a function that brings `ref`'s element into view once the render it was called in has committed, so it
 *  can ask for an element that the same click is about to mount or reveal. */
export function useScrollIntoView(ref: RefObject<HTMLElement | null>) {
  const [asked, setAsked] = useState(0);

  useEffect(() => {
    if (asked) ref.current?.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [asked, ref]);

  return useCallback(() => setAsked((n) => n + 1), []);
}

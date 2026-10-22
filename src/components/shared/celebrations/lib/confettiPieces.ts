import type { CSSProperties } from "react";

// Signal, then the eight lines in the order Platform draws series; tokens, so each theme brings its own.
const COLS = ["signal", "line-2", "line-4", "line-6", "line-7", "line-8", "line-3", "line-5", "line-1"].map((t) => `var(--${t})`);

export const DEFAULT_PIECES = 26;

/** Scatter for one burst: three random draws per piece, in this order. */
export function confettiPieces(count: number): CSSProperties[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100 + "vw",
    background: COLS[i % COLS.length],
    animationDuration: 0.9 + Math.random() * 1.2 + "s",
    animationDelay: Math.random() * 0.3 + "s",
  }));
}

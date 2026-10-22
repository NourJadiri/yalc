import type { Glyph } from "./glyph";
import { PLATFORM_GLYPHS as P } from "./platform";

/* Platform's arrow at the seven other angles its Pictogram turns it to, and its chevron-right mirrored. */
export const MARK_GLYPHS = {
  x: P.cross,
  "chevron-left": [["s", "M14.25 7.5L9.75 12L14.25 16.5"]],
  "arrow-right": P.arrow,
  "arrow-up-right": [["f", "M4.4 17.13L10.76 10.76L6.87 6.87L18.36 5.64L17.13 17.13L13.24 13.24L6.87 19.6Z"]],
  "arrow-up": [["f", "M10.25 21V12H4.75L12 3L19.25 12H13.75V21Z"]],
  "arrow-up-left": [["f", "M17.13 19.6L10.76 13.24L6.87 17.13L5.64 5.64L17.13 6.87L13.24 10.76L19.6 17.13Z"]],
  "arrow-left": [["f", "M21 13.75H12V19.25L3 12L12 4.75V10.25H21Z"]],
  "arrow-down-left": [["f", "M19.6 6.87L13.24 13.24L17.13 17.13L5.64 18.36L6.87 6.87L10.76 10.76L17.13 4.4Z"]],
  "arrow-down": [["f", "M13.75 3V12H19.25L12 21L4.75 12H10.25V3Z"]],
  "arrow-down-right": [["f", "M6.87 4.4L13.24 10.76L17.13 6.87L18.36 18.36L6.87 17.13L10.76 13.24L4.4 6.87Z"]],
} satisfies Record<string, Glyph>;

import type { Glyph } from "./glyph";
import { PLATFORM_GLYPHS as P } from "./platform";

export const CONTROL_GLYPHS = {
  square: [["f", "M6.75 6.75H17.25V17.25H6.75Z"]],
  // Platform's refresh, mirrored to run anticlockwise.
  "rotate-ccw": [["s", "M6.35 10.1A6.4 6.4 0 1 0 12 6.7"], ["s", "M13.4 3.8L10.5 6.7L13.4 9.6"]],
  timer: P.clock,
  send: [["s", "M4 4.75L19.5 12L4 19.25L7 12Z"], ["s", "M7 12H12"]],
  copy: [["s", "M9 15H4V4H15V9"], ["s", "M9 9H20V20H9Z"]],
  lightbulb: [["s", "M9.25 16V14.05A5.75 5.75 0 1 1 14.75 14.05V16Z"], ["s", "M10 20.25H14"]],
  terminal: [["s", "M4.5 6.5L10 12L4.5 17.5"], ["s", "M13 17.5H19.5"]],
} satisfies Record<string, Glyph>;

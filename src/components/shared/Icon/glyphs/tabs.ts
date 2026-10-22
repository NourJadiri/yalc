import type { Glyph } from "./glyph";

export const TAB_GLYPHS = {
  route: [["s", "M3 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z"], ["s", "M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z"], ["s", "M9 18H11.5L18 11.5V9"]],
  code: [["s", "M7.5 7.5L3 12L7.5 16.5"], ["s", "M16.5 7.5L21 12L16.5 16.5"], ["s", "M13.5 5L10.5 19"]],
  chart: [["f", "M4.5 12H8V17.5H4.5ZM10.25 6H13.75V17.5H10.25ZM16 9H19.5V17.5H16Z"], ["s", "M3 20.75H21"]],
} satisfies Record<string, Glyph>;

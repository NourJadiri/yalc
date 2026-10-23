import type { Glyph } from "./glyph";

export const CONTENT_GLYPHS = {
  "book-open": [["s", "M12 7L8.75 4.75H2.75V17.75H8.75L12 20L15.25 17.75H21.25V4.75H15.25Z"], ["s", "M12 7V20"]],
  "list-checks": [["s", "M3.5 5.75L5.75 8L9.5 4.25"], ["s", "M3.5 17.75L5.75 20L9.5 16.25"], ["s", "M13 6.25H20.5M13 12H20.5M13 18.25H20.5"]],
  "circle-check": [["s", "M2.75 12a9.25 9.25 0 1 0 18.5 0a9.25 9.25 0 1 0 -18.5 0Z"], ["s", "M7.75 12.5L10.75 15.5L16.25 9.5"]],
} satisfies Record<string, Glyph>;

import type { Glyph } from "./glyph";

export const SYNC_GLYPHS = {
  "qr-code": [["s", "M4.25 4.25H9.75V9.75H4.25Z"], ["s", "M14.25 4.25H19.75V9.75H14.25Z"], ["s", "M4.25 14.25H9.75V19.75H4.25Z"], ["f", "M13 13H15.75V15.75H13ZM18.25 13H21V15.75H18.25ZM15.75 15.75H18.25V18.25H15.75ZM13 18.25H15.75V21H13ZM18.25 18.25H21V21H18.25Z"]],
} satisfies Record<string, Glyph>;

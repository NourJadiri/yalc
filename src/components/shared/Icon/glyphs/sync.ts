import type { Glyph } from "./glyph";

/* One cloud for every state, so only the mark inside it changes; cloud-off parts it around the slash. */
const CLOUD = "M7.25 19A4.5 4.5 0 0 1 7.02 10.01A5.75 5.75 0 0 1 18.39 11.61A3.75 3.75 0 0 1 17.5 19Z";

export const SYNC_GLYPHS = {
  "cloud-check": [["s", CLOUD], ["s", "M8.5 14L11 16.5L15.75 11.75"]],
  "cloud-upload": [["s", CLOUD], ["s", "M12.25 19V10.75"], ["s", "M9.25 13.75L12.25 10.75L15.25 13.75"]],
  "cloud-off": [["s", "M14.05 19H7.25A4.5 4.5 0 0 1 5.43 10.38"], ["s", "M10.27 5.31A5.75 5.75 0 0 1 18.39 11.61A3.75 3.75 0 0 1 21.13 16.18"], ["s", "M3.5 3.5L20.5 20.5"]],
  "qr-code": [["s", "M4.25 4.25H9.75V9.75H4.25Z"], ["s", "M14.25 4.25H19.75V9.75H14.25Z"], ["s", "M4.25 14.25H9.75V19.75H4.25Z"], ["f", "M13 13H15.75V15.75H13ZM18.25 13H21V15.75H18.25ZM15.75 15.75H18.25V18.25H15.75ZM13 18.25H15.75V21H13ZM18.25 18.25H21V21H18.25Z"]],
} satisfies Record<string, Glyph>;

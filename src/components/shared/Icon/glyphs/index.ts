import { ASSISTANT_GLYPHS } from "./assistant";
import { CONTENT_GLYPHS } from "./content";
import { CONTROL_GLYPHS } from "./controls";
import type { Glyph } from "./glyph";
import { MARK_GLYPHS } from "./marks";
import { PLATFORM_GLYPHS } from "./platform";
import { PROGRESS_GLYPHS } from "./progress";
import { SYNC_GLYPHS } from "./sync";
import { TAB_GLYPHS } from "./tabs";

const ALL = {
  ...PLATFORM_GLYPHS,
  ...TAB_GLYPHS,
  ...MARK_GLYPHS,
  ...PROGRESS_GLYPHS,
  ...CONTROL_GLYPHS,
  ...SYNC_GLYPHS,
  ...CONTENT_GLYPHS,
  ...ASSISTANT_GLYPHS,
};

export type IconName = keyof typeof ALL;

export const GLYPHS: Record<IconName, Glyph> = ALL;

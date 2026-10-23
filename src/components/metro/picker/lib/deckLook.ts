import type { DeckId } from "../../../../types";
import type { BulletLine } from "../../../ui/Bullet";

interface LookBase {
  /** Redemption, the delayed service: closed until you owe it cards. */
  delayed?: true;
}

interface MixLook extends LookBase {
  /** The interchange: no line of its own, scored across every line. */
  mix: true;
}

interface LineLook extends LookBase {
  mix?: undefined;
  line: BulletLine;
  glyph: string;
}

export type DeckLook = MixLook | LineLook;

const LOOK: Record<DeckId, DeckLook> = {
  mix: { mix: true },
  graphs: { line: 6, glyph: "G" },
  bt: { line: 1, glyph: "B" },
  dp: { line: 8, glyph: "D" },
  ds: { line: 3, glyph: "H" },
  redo: { line: 7, glyph: "R", delayed: true },
};

export const deckLook = (id: DeckId): DeckLook => LOOK[id];

export function subline(look: DeckLook, n: number, pct: number | null): string {
  if (look.delayed) return n ? n + " missed · win them back" : "no misses yet — clean sheet";
  if (look.mix) return n + " cards · " + (pct === null ? "weakest first" : pct + "% · weakest first");
  return n + " cards · " + (pct === null ? "not yet ridden" : pct + "% right");
}

export const isClosed = (look: DeckLook, n: number): boolean => !!look.delayed && n === 0;

/** The status on a row's flaps, or null when the row shows its platform instead. */
export function tagLabel(look: DeckLook, n: number, selected: boolean): string | null {
  if (selected) return "NOW BOARDING";
  return look.delayed && n > 0 ? "DELAYED · " + n : null;
}

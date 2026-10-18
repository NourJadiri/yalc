import { StateEffect, StateField, type Range } from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin, type DecorationSet } from "@codemirror/view";

/** How long the band stays; theme.ts fades it over the same time. */
export const JUMP_FLASH_MS = 1500;

const flashLines = StateEffect.define<{ from: number; to: number }>();
const endFlash = StateEffect.define<null>();

/* The band on the lines a jump landed on. Any edit ends it, like the red band on a blamed line. */
const flash = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) {
      if (e.is(endFlash)) return Decoration.none;
      if (e.is(flashLines)) {
        const band = Decoration.line({ class: "cm-jumpline" });
        const bands: Range<Decoration>[] = [];
        for (let n = e.value.from; n <= e.value.to; n++) bands.push(band.range(tr.state.doc.line(n).from));
        return Decoration.set(bands);
      }
    }
    return tr.docChanged ? Decoration.none : deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

/* Takes the band away once it has faded. A second jump starts the clock again, and a rebuilt editor drops it with the view. */
const expiry = ViewPlugin.define((view) => {
  let timer = 0;
  return {
    update(u) {
      if (!u.transactions.some((tr) => tr.effects.some((e) => e.is(flashLines)))) return;
      clearTimeout(timer);
      timer = window.setTimeout(() => view.dispatch({ effects: endFlash.of(null) }), JUMP_FLASH_MS);
    },
    destroy: () => clearTimeout(timer),
  };
});

export const jumpLine = [flash, expiry];

/* Lines count from 1; what isn't a line number at all lands on the first. */
const clamp = (n: number, max: number) => Math.min(Math.max(Math.trunc(n) || 1, 1), max);

/** The cursor to the start of line `from` (counted from 1, kept inside the document), centred and focused, with lines `from` to `to` flashed. */
export function jumpToLine(view: EditorView, from: number, to = from): void {
  const { doc } = view.state;
  const first = clamp(from, doc.lines);
  const last = Math.max(first, clamp(to, doc.lines));
  const start = doc.line(first).from;
  /* A bare cursor, never a selection: the next keystroke must not replace anything. */
  view.dispatch({
    selection: { anchor: start },
    effects: [EditorView.scrollIntoView(start, { y: "center" }), flashLines.of({ from: first, to: last })],
  });
  view.focus();
}

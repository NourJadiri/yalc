import { StateField, type Range, type Text } from "@codemirror/state";
import { Decoration, EditorView, type DecorationSet } from "@codemirror/view";

/* `# 3.` at the start of a line, after its indentation, and a space after it: how a reference solution says where each
   of the notes' numbered steps begins. */
const STEP = /^[ \t]*(# \d+\.)(?= )/;

const mark = Decoration.mark({ class: "cm-stepmark" });

function marks(doc: Text): DecorationSet {
  const found: Range<Decoration>[] = [];
  for (let n = 1; n <= doc.lines; n++) {
    const line = doc.line(n);
    const m = STEP.exec(line.text);
    const step = m?.[1];
    if (m && step) {
      const from = line.from + m[0].length - step.length;
      found.push(mark.range(from, from + step.length));
    }
  }
  return Decoration.set(found);
}

/** The step markers in bold ink, like the numbers of the steps they belong to, out of the comment's muted slant. */
export const stepMarks = [
  StateField.define<DecorationSet>({
    create: (state) => marks(state.doc),
    update: (deco, tr) => (tr.docChanged ? marks(tr.state.doc) : deco),
    provide: (f) => EditorView.decorations.from(f),
  }),
  /* The comment's own colour and slant sit on a span inside the mark, so the mark's style has to reach it. */
  EditorView.baseTheme({ ".cm-stepmark, .cm-stepmark *": { color: "var(--ink)", fontWeight: "600", fontStyle: "normal" } }),
];

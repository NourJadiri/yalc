import { pythonTokens } from "./pythonTokens";

export interface CodeRun {
  text: string;
  /** `hl-<kind>` (plus `hl-def` for a name being defined), `blank` for the hole, none for plain text. */
  className?: string;
}

const HOLE = "____";

/** The code as runs of text, each with the class that colours it; every `____` is a run of its own. */
export function codeRuns(code: string): CodeRun[] {
  const runs: CodeRun[] = [];
  for (const { text, kind, def } of pythonTokens(code)) {
    const className = kind && (def ? `hl-${kind} hl-def` : `hl-${kind}`);
    text.split(HOLE).forEach((part, i) => {
      if (i > 0) runs.push({ text: HOLE, className: "blank" });
      if (part) runs.push({ text: part, className });
    });
  }
  return runs;
}

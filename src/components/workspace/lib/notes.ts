import { sections } from "./markdown";

/** A problem's notes.md: the short version a stuck reader gets first, and the long walkthrough behind it. */
export interface Notes {
  pattern: string;
  idea: string;
  /** Markdown: the numbered list. */
  steps: string;
  cost: string;
  /** Markdown: the bullets; empty when the notes have no Pitfalls. */
  pitfalls: string;
  /** Approach, Complexity and any other section, as markdown with its heading. */
  walkthrough: string;
}

const SHORT = ["pattern", "key idea", "steps", "cost"];
const PITFALLS = "pitfalls";

/** Null when any of the four short sections is missing or empty: those notes show whole, as they always did. */
export function parseNotes(md: string): Notes | null {
  const all = sections(md);
  const body = (title: string) => all.find((s) => s.title.toLowerCase() === title)?.body.trim() ?? "";
  const [pattern, idea, steps, cost] = SHORT.map(body);
  if (!pattern || !idea || !steps || !cost) return null;

  const walkthrough = all
    .filter((s) => ![...SHORT, PITFALLS].includes(s.title.toLowerCase()))
    .map((s) => `## ${s.title}\n${s.body}`)
    .join("\n");
  return { pattern, idea, steps, cost, pitfalls: body(PITFALLS), walkthrough };
}

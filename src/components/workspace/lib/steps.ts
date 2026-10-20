import type { ProblemRef } from "../../../data/tracks";
import { loadDraft } from "../../../lib/drafts";
import type { Problem } from "../../../types";

export interface StepPlace {
  /** The build's steps, in order. */
  steps: Problem[];
  /** This problem's index among them. */
  at: number;
}

/** Where a problem sits in its build, or null for a problem that isn't a step of one. */
export function stepPlace({ prob, day }: ProblemRef): StepPlace | null {
  if (!day.steps) return null;
  const at = day.probs.findIndex((p) => p.id === prob.id);
  return at < 0 ? null : { steps: day.probs, at };
}

export interface Carried {
  code: string;
  /** "step 2": where the code came from, as the workspace says it. */
  from: string;
}

/** The latest earlier step's draft, which a step starts from until it has a draft of its own. */
export function carriedCode(place: StepPlace | null): Carried | null {
  if (!place) return null;
  for (let k = place.at - 1; k >= 0; k--) {
    const prev = place.steps[k];
    const code = prev ? loadDraft(prev.id) : null;
    if (code) return { code, from: "step " + (k + 1) };
  }
  return null;
}

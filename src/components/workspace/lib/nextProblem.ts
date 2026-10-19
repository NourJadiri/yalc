import { hasProblem } from "../../../data/problems";
import { TRACKS, specOf, type ProblemRef } from "../../../data/tracks";
import type { Problem, TrackData } from "../../../types";

/** Where passing leads: on the problem's own line, the next one in the plan's order (wrapping round to the start) that isn't ticked
 *  and opens in the workspace, which the timed mocks don't. Null when there is none. */
export function nextProblem({ prob, track }: ProblemRef, done: TrackData["done"]): Problem | null {
  const probs = TRACKS[track].plan.flatMap((day) => day.probs);
  const at = probs.findIndex((p) => p.id === prob.id);
  const after = [...probs.slice(at + 1), ...probs.slice(0, at)];
  return after.find((p) => !done[p.id] && hasProblem(specOf(p))) ?? null;
}

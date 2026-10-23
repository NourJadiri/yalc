import { PLAN } from "./plan";
import { AWS_PLAN } from "./aws";
import { ENG_PLAN } from "./eng";
import { AWS_RANKS, ENG_RANKS, RANKS } from "./meta";
import type { Day, Problem, Track, TrackId } from "../types";

export const TRACKS: Record<TrackId, Track> = {
  google: {
    id: "google",
    name: "Onsite Express",
    company: "Google",
    line: 2,
    bullet: "G",
    title: ["Onsite", "Express"],
    blurb: "Two rounds between you and the terminus. Twenty-four stations, one line. Board anywhere.",
    terminus: "GOOGLE",
    unit: "Day",
    plan: PLAN,
    ranks: RANKS,
    badges: [
      "first", "ritual5", "metro100", "perfect", "bugs20", "streak3", "streak7",
      "half", "line", "noogler", "green", "green25",
    ],
    award: { first: "first", half: "half", line: "line", top: "noogler" },
    terminusCopy: (cleared) =>
      cleared === PLAN.length
        ? "All " + PLAN.length + " stations cleared. Walk in like you own the whiteboard."
        : cleared + " of " + PLAN.length +
          " stations behind you. The terminus isn't going anywhere — you are.",
    perfectCopy: "Perfect run. The doors open at Google.",
  },
  aws: {
    id: "aws",
    name: "Day One Local",
    company: "Amazon",
    line: 4,
    bullet: "A",
    title: ["Day One", "Local"],
    blurb: "The slow train to Amazon. Thirteen stops, one idea each, easy problems only — and no timetable. The Local waits for you.",
    terminus: "DAY ONE",
    unit: "Stop",
    plan: AWS_PLAN,
    ranks: AWS_RANKS,
    badges: [
      "aws1", "metro100", "perfect", "bugs20", "streak3", "streak7",
      "awsHalf", "awsLine", "awsTop", "green", "green25",
    ],
    award: { first: "aws1", half: "awsHalf", line: "awsLine", top: "awsTop" },
    terminusCopy: (cleared) =>
      cleared === AWS_PLAN.length
        ? "All " + AWS_PLAN.length + " stops behind you. The doors at Day One are open."
        : cleared + " of " + AWS_PLAN.length +
          " stops behind you. There's no timetable on the Local — ride when you can.",
    perfectCopy: "Perfect run. Day One is getting closer.",
  },
  eng: {
    id: "eng",
    name: "Engineering Works",
    company: "ElevenLabs · SIG",
    line: 5,
    bullet: "E",
    title: ["Engineering", "Works"],
    blurb: "Seven systems you'd actually ship, each built in steps: the core first, then one feature at a time until it's whole. Every step opens on your code from the last one. Tuned for ElevenLabs and SIG.",
    terminus: "SHIPPED",
    unit: "Build",
    plan: ENG_PLAN,
    ranks: ENG_RANKS,
    badges: [
      "eng1", "ritual5", "metro100", "perfect", "bugs20", "streak3", "streak7",
      "engHalf", "engLine", "engTop", "green", "green25",
    ],
    award: { first: "eng1", half: "engHalf", line: "engLine", top: "engTop" },
    terminusCopy: (cleared) =>
      cleared === ENG_PLAN.length
        ? "All " + ENG_PLAN.length + " builds shipped. Bring any of them to the interview and talk it through."
        : cleared + " of " + ENG_PLAN.length +
          " builds shipped. Every step you pass is code you can explain out loud.",
    perfectCopy: "Perfect run. Ship it.",
  },
};

export const TRACK_IDS: readonly TrackId[] = ["google", "aws", "eng"];

export const isTrackId = (x: unknown): x is TrackId => TRACK_IDS.some((id) => id === x);

export interface ProblemRef {
  prob: Problem;
  day: Day;
  track: TrackId;
}

// Keyed by string: ids come off the persisted blob, and a stale one has to be able to miss.
// Ids are unique across lines; a collision would cross-wire progress, so it throws at load.
export const PROB_INDEX: Record<string, ProblemRef> = {};
export const DAY_INDEX: Record<string, { day: Day; track: TrackId }> = {};

for (const id of TRACK_IDS) {
  for (const day of TRACKS[id].plan) {
    if (DAY_INDEX[day.id]) throw new Error("Duplicate station id " + day.id);
    DAY_INDEX[day.id] = { day, track: id };
    for (const prob of day.probs) {
      if (PROB_INDEX[prob.id]) throw new Error("Duplicate problem id " + prob.id);
      PROB_INDEX[prob.id] = { prob, day, track: id };
    }
  }
}

export const totalOf = (id: TrackId): number =>
  TRACKS[id].plan.reduce((a, d) => a + d.probs.length, 0);

/** The problem-bank key a row opens in the workspace: a drill's id, else its slug. Timed mocks have neither. */
export const specOf = (p: Problem): string | null => p.drill ?? p.slug ?? null;

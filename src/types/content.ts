/** Index 0 always exists, so "current rank" and "last day" need no undefined branch. */
export type NonEmpty<T> = readonly [T, ...T[]];

export type Diff = "E" | "M" | "H";

/** "mix" covers mock days and pattern days with no quiz deck of their own. */
export type Phase = "graphs" | "bt" | "dp" | "ds" | "mix";

/** Pattern match, bug hunt, missing line, complexity. */
export type QType = "pat" | "bug" | "line" | "cx";

export interface Problem {
  id: string;
  n: string;
  diff: Diff;
  /** Links to LeetCode. Absent on timed mocks (`url`) and in-app drills (`drill`). */
  slug?: string;
  url?: string;
  /** Premium classics ride as in-app drills: the workspace is the only way in. */
  drill?: string;
  /** Our own problem, not a stand-in for a premium one: the row says "original". */
  orig?: true;
  /** Overrides the difficulty's XP; only the timed mocks set it. */
  xp?: number;
  /** The day's last problem, re-drilling an older pattern. */
  warm?: true;
}

export interface Day {
  id: string;
  /** Station number along its line, from 1. */
  d: number;
  stn: string;
  ph: Phase;
  /** The station ends in a timed mock; DayCard mounts the clock. */
  mock?: true;
  name: string;
  note: string;
  /** Morning template drill. The Local has none: no ritual row. */
  ritual?: string;
  /** The station is one build: its problems are the steps, in order, each extending the code of the one before. */
  steps?: true;
  probs: Problem[];
}

export interface Question {
  id: string;
  t: QType;
  ph: Exclude<Phase, "mix">;
  q: string;
  /** Options, stored answer-first and shuffled for display. */
  o: string[];
  /** Index of the correct option before shuffling: always 0. */
  a: number;
  /** Explanation shown on reveal. */
  x: string;
  /** Bug-hunt and missing-line cards only. */
  code?: string;
}

export interface Template {
  /** Group heading; consecutive templates sharing one print under it. */
  g: string;
  id: string;
  n: string;
  tag: string;
  note: string;
  code: string;
}

/** [name, XP needed]. */
export type Rank = readonly [name: string, need: number];

export interface Badge {
  id: string;
  /** Emoji. */
  ic: string;
  n: string;
  /** How it is earned; the tooltip. */
  d: string;
}

/** The quiz phases, plus "redo": the missed-card deck. */
export type DeckId = Phase | "redo";

export interface Deck {
  id: DeckId;
  n: string;
}

export type TrackId = "google" | "aws" | "eng";

/** One of Platform's eight line colours, by number. */
export type LineNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Everything that differs between the lines: riding to Google, to Amazon, or through the Engineering Works. */
export interface Track {
  id: TrackId;
  name: string;
  company: string;
  /** Its Platform line: the colour of its rail, its bullet and everything that marks it, for good. */
  line: LineNumber;
  /** The letter on its bullet. */
  bullet: string;
  /** Hero heading: plain part, then bold part. */
  title: readonly [string, string];
  blurb: string;
  /** The terminus card's heading. */
  terminus: string;
  /** What a station is called in running copy: "Day 4", "Stop 4". */
  unit: string;
  plan: NonEmpty<Day>;
  ranks: NonEmpty<Rank>;
  /** Badge ids this line's Me tab shows, in order. */
  badges: readonly string[];
  /** Badge ids the engine awards for this line's milestones. */
  award: { first: string; half: string; line: string; top: string };
  /** The line under the terminus heading, given stations cleared. */
  terminusCopy: (cleared: number) => string;
  /** What a perfect metro run says on this line. */
  perfectCopy: string;
}

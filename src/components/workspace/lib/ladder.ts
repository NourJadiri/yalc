/** The hint ladder's three hints: what each is called, and what the button that brings it out says. The fourth rung,
 *  the solution, has no hint to show. */
export const RUNGS = [
  { label: "The technique", show: "Show the technique" },
  { label: "The key idea", show: "Show the key idea" },
  { label: "The steps", show: "Show the steps" },
] as const;

export const HINTS = RUNGS.length;

/** The next rung's button, given how many hints are out. */
export const nextRung = (hints: number): string => RUNGS[hints]?.show ?? "Show the solution";

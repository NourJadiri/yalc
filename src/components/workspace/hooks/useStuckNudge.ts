import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { elapsed, type Clock } from "./useStopwatch";

const FIRST_SECS = 20 * 60;
const AGAIN_SECS = 10 * 60;
const POLL_MS = 3000;

interface StuckNudgeOptions {
  clock: RefObject<Clock>;
  /** Stuck, as far as the clock can tell: the solution isn't open, and there is a ladder to offer. */
  active: boolean;
  /** How many hints are out; a new one, from the ladder or the nudge, pushes the next nudge back. */
  hints: number;
}

/** Whether to offer a nudge: twenty minutes of clock time into a problem that isn't solved, then ten after each "not now"
 *  or hint. `minutes` is the clock's reading when the card came up, null while there is no card. */
export function useStuckNudge({ clock, active, hints }: StuckNudgeOptions) {
  const [minutes, setMinutes] = useState<number | null>(null);
  /* In the clock's seconds, so a pause (which stops them) holds the nudge off. */
  const due = useRef(FIRST_SECS);
  const seen = useRef(0);

  const postpone = useCallback(() => {
    due.current = elapsed(clock.current) + AGAIN_SECS;
    setMinutes(null);
  }, [clock]);

  useEffect(() => {
    if (!active) return;
    const look = () => {
      const c = clock.current;
      const secs = elapsed(c);
      /* Seconds only go back when the clock was reset, which starts the count over. */
      if (secs < seen.current) {
        due.current = FIRST_SECS;
        setMinutes(null);
      }
      seen.current = secs;
      if (c.since !== null && secs >= due.current) setMinutes((m) => m ?? Math.floor(secs / 60));
    };
    const t = window.setInterval(look, POLL_MS);
    return () => window.clearInterval(t);
  }, [clock, active]);

  const lastHints = useRef(hints);
  useEffect(() => {
    if (lastHints.current === hints) return;
    lastHints.current = hints;
    postpone();
  }, [hints, postpone]);

  return { minutes: active ? minutes : null, postpone };
}

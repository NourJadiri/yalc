import { useEffect, useRef, useState } from "react";
import { clearDraft, loadDraft, saveDraft } from "../../../lib/drafts";
import { useLatest } from "../../../hooks/useLatest";
import type { Carried } from "../lib/steps";

const SAVE_DELAY_MS = 400;

/** The code in the editor, saved shortly after the last keystroke and on the way out. A draft identical to the starter is no draft at all.
 *  A build's step with no draft of its own starts from the previous step's code instead, and that code is its starter. */
export function useDraft(pid: string, starter: string, carried: Carried | null = null) {
  const base = carried?.code ?? starter;
  const [own] = useState(() => loadDraft(pid));
  const [code, setCode] = useState(own ?? base);
  const [docRev, setDocRev] = useState(0);
  const latest = useLatest(code);
  const saveTimer = useRef(0);

  const persist = (c: string) => (c === base ? clearDraft(pid) : saveDraft(pid, c));

  const onChange = (c: string) => {
    setCode(c);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => persist(c), SAVE_DELAY_MS);
  };

  const save = () => persist(code);

  const reset = () => {
    const ask = carried
      ? `Start this step again from your ${carried.from} code? Your changes to this step are cleared.`
      : "Reset to the starter code? Your draft for this problem is cleared.";
    if (code !== base && !window.confirm(ask)) return;
    setCode(base);
    clearDraft(pid);
    setDocRev((n) => n + 1);
  };

  useEffect(
    () => () => {
      window.clearTimeout(saveTimer.current);
      persist(latest.current);
    },
    /* Unmount only: the body is keyed by problem, so this is "leaving it". */
    []
  );

  /** Where the code first shown came from, when it was the previous step's. */
  const carriedFrom = own === null && carried ? carried.from : null;
  const resetTitle = carried ? `Back to your ${carried.from} code` : "Back to the starter code";

  return { code, docKey: pid + ":" + docRev, onChange, save, reset, resetTitle, carriedFrom };
}

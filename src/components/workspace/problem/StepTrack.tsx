import type { CSSProperties } from "react";
import type { Problem } from "../../../types";
import StepStop from "./StepStop";
import "./StepTrack.css";

interface StepTrackProps {
  steps: Problem[];
  /** The open step's index. */
  at: number;
  /** Ticked on the line, by hand or by passing. */
  done: Record<string, true>;
  /** "step 1" when the editor opened on that step's code. */
  carriedFrom: string | null;
  onOpen: (id: string) => void;
}

export default function StepTrack({ steps, at, done, carriedFrom, onOpen }: StepTrackProps) {
  return (
    <nav className="ws-buildtrack" aria-label={`Step ${at + 1} of ${steps.length}`}>
      <ol style={{ "--n": steps.length } as CSSProperties}>
        {steps.map((p, k) => (
          <StepStop key={p.id} n={k + 1} prob={p} current={k === at} done={!!done[p.id]} onOpen={() => onOpen(p.id)} />
        ))}
      </ol>
      {carriedFrom && <p className="ws-buildtrack-note">{`Your ${carriedFrom} code is in the editor. Build on it.`}</p>}
    </nav>
  );
}

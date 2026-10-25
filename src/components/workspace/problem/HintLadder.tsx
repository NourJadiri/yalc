import { useId, type Ref } from "react";
import Icon from "../../shared/Icon";
import Button from "../../ui/Button";
import { RUNGS, nextRung } from "../lib/ladder";
import type { Notes } from "../lib/notes";
import Markdown from "../Markdown";
import LadderDots from "./LadderDots";
import "./HintLadder.css";

interface HintLadderProps {
  notes: Notes;
  /** How many hints are out, 0 to 3. */
  hints: number;
  /** The solution is open (passed, or revealed), so the button only leads there. */
  open: boolean;
  onClimb: () => void;
  ref?: Ref<HTMLDivElement>;
}

export default function HintLadder({ notes, hints, open, onClimb, ref }: HintLadderProps) {
  const title = useId();
  const bodies = [
    <p className="ws-hint-pattern">{notes.pattern}</p>,
    <Markdown text={notes.idea} />,
    <>
      <Markdown text={notes.steps} />
      <div className="ws-hint-cost">
        <Markdown text={notes.cost} />
      </div>
    </>,
  ];

  return (
    <div className="ws-ladder" role="group" aria-labelledby={title} ref={ref}>
      <div className="ws-ladder-head">
        <Icon name="lightbulb" size={14} />
        <span id={title}>Stuck? One hint at a time.</span>
        <LadderDots hints={hints} open={open} />
      </div>
      {/* Mounted before the first hint, so a screen reader hears each one as it is added. */}
      <div className="ws-ladder-hints" aria-live="polite">
        {RUNGS.slice(0, hints).map((rung, i) => (
          <div key={rung.label} className="ws-hint">
            <p className="ws-hint-label">{rung.label}</p>
            {bodies[i]}
          </div>
        ))}
      </div>
      {/* One button for every rung, so focus stays on it from tap to tap. */}
      <Button onClick={onClimb}>{open ? "Open the solution" : nextRung(hints)}</Button>
    </div>
  );
}

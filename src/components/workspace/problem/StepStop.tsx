import { cx } from "../../../lib/cx";
import type { Problem } from "../../../types";
import Icon from "../../shared/Icon";

interface StepStopProps {
  /** The step's number, from 1. */
  n: number;
  prob: Problem;
  current: boolean;
  done: boolean;
  onOpen: () => void;
}

export default function StepStop({ n, prob, current, done, onOpen }: StepStopProps) {
  const inner = (
    <>
      <span className="ws-buildstop-dot">{done ? <Icon name="check" size={16} /> : n}</span>
      <span className="ws-buildstop-name">{prob.n}</span>
    </>
  );

  return (
    <li className={cx("ws-buildstop", current && "cur", done && "done")}>
      {current ? (
        <span className="ws-buildstop-in" aria-current="step">
          {inner}
        </span>
      ) : (
        <button className="ws-buildstop-in" onClick={onOpen} aria-label={`Open step ${n}: ${prob.n}`}>
          {inner}
        </button>
      )}
    </li>
  );
}

import { cx } from "../../../lib/cx";
import Icon from "../../shared/Icon";
import { VERDICT, type OptionState } from "./lib/optionState";
import "./AnswerOption.css";

interface AnswerOptionProps {
  slot: number;
  label: string | undefined;
  state: OptionState | null;
  onPick: (slot: number) => void;
}

/* The label stays the button's second child node: the suites read it there. */
export default function AnswerOption({ slot, label, state, onPick }: AnswerOptionProps) {
  const verdict = state && VERDICT[state];

  return (
    <button className={cx("opt", state)} disabled={state !== null} onClick={() => onPick(slot)}>
      <span className="k">{"ABCD"[slot]}</span>
      {label}
      {verdict && (
        <span className="verdict">
          <Icon name={verdict.icon} size={20} />
          {verdict.word}
        </span>
      )}
    </button>
  );
}

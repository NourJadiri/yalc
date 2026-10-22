import type { ReactNode } from "react";
import type { CaseResult } from "../../../runner/types";
import Icon, { type IconName } from "../../shared/Icon";
import { caseMark } from "../lib/verdict";
import "./Chips.css";

/* Check for go, warning for caution, the error mark for stop; a case with no verdict keeps a plain dot. */
const MARK: Partial<Record<string, IconName>> = { ok: "check", warn: "alert-triangle", bad: "x" };

interface ResultChipProps {
  status: CaseResult["status"];
  /** The case's full name, for the tooltip. */
  label: string;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}

export default function ResultChip({ status, label, selected, onSelect, children }: ResultChipProps) {
  const mark = caseMark(status);
  const icon = MARK[mark.tone];
  return (
    <button
      role="tab"
      aria-selected={selected}
      className={"ws-chip mark " + mark.tone + (selected ? " on" : "")}
      onClick={onSelect}
      title={label + " — " + mark.word}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

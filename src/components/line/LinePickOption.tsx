import { cx } from "../../lib/cx";
import type { Track } from "../../types";
import Bullet from "../ui/Bullet";
import "./LinePickOption.css";

interface LinePickOptionProps {
  line: Track;
  /** The line being ridden. */
  on: boolean;
  /** Stations cleared on this line. */
  cleared: number;
  onPick: () => void;
}

export default function LinePickOption({ line, on, cleared, onPick }: LinePickOptionProps) {
  return (
    <button role="radio" aria-checked={on} className={cx("linepick", on && "on")} data-track={line.id} onClick={onPick}>
      <Bullet line={line.line} className="lbullet" aria-hidden="true">
        {line.bullet}
      </Bullet>
      <span className="lname">
        <b data-label={line.name}>{line.name}</b>
        <span>{`${line.company} · ${cleared}/${line.plan.length}`}</span>
      </span>
    </button>
  );
}

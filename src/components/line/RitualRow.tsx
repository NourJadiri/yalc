import { RITUAL_XP } from "../../data/plan";
import { cx } from "../../lib/cx";
import Icon from "../shared/Icon";
import XpValue from "../ui/XpValue";
import "./pcheck.css";
import "./RitualRow.css";

interface RitualRowProps {
  ritual: string;
  done: boolean;
  onToggle: () => void;
}

export default function RitualRow({ ritual, done, onToggle }: RitualRowProps) {
  return (
    <button className={cx("ritual", done && "done")} onClick={onToggle} aria-pressed={done}>
      <span className="pcheck">
        <Icon name="check" size={20} />
      </span>
      <span className="rtext">{ritual}</span>
      <XpValue>{"+" + RITUAL_XP}</XpValue>
    </button>
  );
}

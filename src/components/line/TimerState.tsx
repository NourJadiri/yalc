import { cx } from "../../lib/cx";
import Icon from "../shared/Icon";
import "./TimerState.css";

/** The clock's state in a word and a pictogram as well as its colour: under five minutes, then out of time. */
export default function TimerState({ up }: { up: boolean }) {
  return (
    <span className={cx("tstate", up && "up")}>
      <Icon name={up ? "stop" : "warning"} size={16} />
      {up ? "Time up" : "Under 5 min"}
    </span>
  );
}

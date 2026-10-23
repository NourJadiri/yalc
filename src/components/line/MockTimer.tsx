import { cx } from "../../lib/cx";
import { fmtT } from "../../lib/engine";
import { useTimer } from "../../state/TimerProvider";
import type { IconName } from "../shared/Icon";
import XpValue from "../ui/XpValue";
import Flaps from "./Flaps";
import TimerButton from "./TimerButton";
import TimerState from "./TimerState";
import "./MockTimer.css";

type TimerLabel = ReturnType<typeof useTimer>["label"];

const GLYPH: Record<TimerLabel, IconName> = { Start: "play", Pause: "pause", Resume: "play", Done: "check" };

/* Reads the timer itself, so its once-a-second tick re-renders only this and never the line. */
export default function MockTimer() {
  const timer = useTimer();
  const time = fmtT(timer.left);
  const up = timer.left === 0;

  return (
    <div className={cx("timer", timer.low && "low")} data-up={up || undefined}>
      <b role="timer" aria-live="off">
        {time}
      </b>
      <Flaps className="tboard" text={time} />
      <TimerButton icon={GLYPH[timer.label]} onClick={timer.toggle}>
        {timer.label}
      </TimerButton>
      <TimerButton icon="rotate-ccw" onClick={timer.reset}>
        Reset
      </TimerButton>
      {timer.low && <TimerState up={up} />}
      <XpValue>the mock clock</XpValue>
    </div>
  );
}

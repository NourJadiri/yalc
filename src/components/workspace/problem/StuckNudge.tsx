import Icon from "../../shared/Icon";
import Button from "../../ui/Button";
import "./StuckNudge.css";

interface StuckNudgeProps {
  /** What the clock read when the card came up. */
  minutes: number;
  /** The words for the next rung of the ladder. */
  action: string;
  onTake: () => void;
  onLater: () => void;
}

/** A card, not a dialog: it floats over the workspace without taking focus or blocking anything. */
export default function StuckNudge({ minutes, action, onTake, onLater }: StuckNudgeProps) {
  return (
    <div className="ws-nudge" role="status">
      <span className="ws-nudge-tile">
        <Icon name="clock" size={24} />
      </span>
      <div className="ws-nudge-body">
        <p>{minutes} minutes in. Want a nudge?</p>
        <div className="ws-nudge-actions">
          <Button onClick={onTake}>{action}</Button>
          <Button variant="ghost" onClick={onLater}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}

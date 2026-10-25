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
      <p>
        <Icon name="timer" size={14} />
        {minutes} minutes in. Want a nudge?
      </p>
      <div className="ws-nudge-actions">
        <Button variant="primary" onClick={onTake}>
          {action}
        </Button>
        <Button variant="ghost" onClick={onLater}>
          Not now
        </Button>
      </div>
    </div>
  );
}

import type { RefObject } from "react";
import { modKey } from "../../../lib/platform";
import AskButton from "../../assistant/AskButton";
import Icon from "../../shared/Icon";
import Button from "../../ui/Button";
import Stopwatch from "../Stopwatch";
import type { Clock } from "../hooks/useStopwatch";
import "./HeaderActions.css";

interface HeaderActionsProps {
  wide: boolean;
  clock: RefObject<Clock>;
  /** The assistant is open. */
  asking: boolean;
  onAsk: () => void;
  copied: boolean;
  onCopy: () => void;
  busy: boolean;
  onRun: () => void;
  onStop: () => void;
  onSubmit: () => void;
}

export default function HeaderActions({ wide, clock, asking, onAsk, copied, onCopy, busy, onRun, onStop, onSubmit }: HeaderActionsProps) {
  return (
    <div className="ws-actions">
      {wide && <Stopwatch clock={clock} />}
      <AskButton open={asking} wide={wide} onClick={onAsk} />
      <Button variant="ghost" size="compact" tone={copied ? "ok" : undefined} onClick={onCopy} title="Problem, code and last result, ready to paste into Claude">
        <Icon name={copied ? "check" : "copy"} size={16} />
        {wide && (copied ? "Copied" : "Copy for Claude")}
      </Button>
      {busy ? (
        <Button size="compact" onClick={onStop} title="Stop">
          <Icon name="square" size={16} />
          Stop
        </Button>
      ) : (
        <Button size="compact" onClick={onRun} title={"Run the cases (" + modKey() + "+Enter)"}>
          <Icon name="play" size={16} />
          Run
        </Button>
      )}
      <Button variant="primary" size="compact" onClick={onSubmit} disabled={busy} title={"Run every test (" + modKey() + "+Shift+Enter)"}>
        <Icon name="send" size={16} />
        Submit
      </Button>
    </div>
  );
}

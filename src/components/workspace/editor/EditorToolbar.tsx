import * as runner from "../../../runner/runner";
import Icon from "../../shared/Icon";
import IconButton from "../../ui/IconButton";
import LinkButton from "../../ui/LinkButton";
import Spacer from "../../ui/Spacer";
import { useRunnerStatus } from "../hooks/useRunnerStatus";
import RunnerBadge from "./RunnerBadge";
import "./EditorToolbar.css";

interface EditorToolbarProps {
  fontSize: number;
  onFontStep: (delta: number) => void;
  onReset: () => void;
  /** What Reset goes back to, as its tooltip says it. */
  resetTitle: string;
}

export default function EditorToolbar({ fontSize, onFontStep, onReset, resetTitle }: EditorToolbarProps) {
  const { phase } = useRunnerStatus();

  return (
    <div className="ws-toolbar">
      <span className="ws-lang">Python 3.14</span>
      <RunnerBadge phase={phase} />
      {phase === "failed" && <LinkButton onClick={() => void runner.warm().catch(() => {})}>Retry</LinkButton>}
      <Spacer />
      <IconButton size="sm" icon="minus" label="Smaller text" title="Smaller text" onClick={() => onFontStep(-1)} />
      <span className="ws-font">{fontSize}px</span>
      <IconButton size="sm" icon="plus" label="Larger text" title="Larger text" onClick={() => onFontStep(1)} />
      <LinkButton onClick={onReset} title={resetTitle}>
        <Icon name="rotate-ccw" size={16} />
        Reset
      </LinkButton>
    </div>
  );
}

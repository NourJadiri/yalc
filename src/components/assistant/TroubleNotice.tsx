import { cx } from "../../lib/cx";
import Icon from "../shared/Icon";
import Button from "../ui/Button";
import type { Trouble } from "./lib/trouble";
import "./TroubleNotice.css";

interface Props {
  trouble: Trouble;
  onRetry: () => void;
  onNewChat: () => void;
}

export default function TroubleNotice({ trouble, onRetry, onNewChat }: Props) {
  /* A failed answer is an error; a deployment without Bana, or a chat too long to send, is a warning. */
  const tone = trouble.kind === "other" ? "danger" : "warning";
  return (
    <div className={cx("asst-trouble", tone)} role="alert">
      <Icon name={tone === "danger" ? "stop" : "warning"} size={24} />
      <span>{trouble.text}</span>
      {trouble.kind === "other" && (
        <Button size="compact" onClick={onRetry}>
          Retry
        </Button>
      )}
      {trouble.kind === "full" && (
        <Button size="compact" onClick={onNewChat}>
          New chat
        </Button>
      )}
    </div>
  );
}

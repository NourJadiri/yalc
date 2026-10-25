import { cx } from "../../lib/cx";
import "./QuickReplies.css";

/* The Worker's brief knows these four by their exact words, so they are sent as written. */
const REPLIES = ["Next hint", "Shorter", "Show me the fix", "Why?"];

interface Props {
  /** In a mode with a face they read like a messenger's suggested replies. */
  chat: boolean;
  onAsk: (question: string) => void;
}

export default function QuickReplies({ chat, onAsk }: Props) {
  return (
    <div className={cx("asst-quick", chat && "chat")} role="group" aria-label="Quick replies">
      {REPLIES.map((reply) => (
        <button key={reply} type="button" onClick={() => onAsk(reply)}>
          {reply}
        </button>
      ))}
    </div>
  );
}

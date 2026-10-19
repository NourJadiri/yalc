import Markdown from "../Markdown";
import "./InShort.css";

/** The task in one line, above the story: what you're given and what you return, before anything else. */
export default function InShort({ text }: { text: string }) {
  return (
    <div className="ws-inshort">
      <h3 className="ws-inshort-label">In short</h3>
      <Markdown text={text} />
    </div>
  );
}

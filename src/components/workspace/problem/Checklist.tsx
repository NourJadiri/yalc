import { useState } from "react";
import { cx } from "../../../lib/cx";
import "../Markdown.css";
import "./Checklist.css";

/** One checkbox per item, each item given as HTML (see listItems). Ticks are only this component's: they last while it is on screen. */
export default function Checklist({ items }: { items: string[] }) {
  const [ticked, setTicked] = useState<ReadonlySet<number>>(new Set());

  const toggle = (i: number) =>
    setTicked((prev) => {
      const next = new Set(prev);
      if (!next.delete(i)) next.add(i);
      return next;
    });

  return (
    <ul className="ws-checklist">
      {items.map((html, i) => (
        <li key={i} className={cx(ticked.has(i) && "done")}>
          <label>
            <input type="checkbox" checked={ticked.has(i)} onChange={() => toggle(i)} />
            <span className="md" dangerouslySetInnerHTML={{ __html: html }} />
          </label>
        </li>
      ))}
    </ul>
  );
}

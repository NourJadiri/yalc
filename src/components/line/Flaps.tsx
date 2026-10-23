import { cx } from "../../lib/cx";
import "./Flaps.css";

/** Each character on its own split flap, flipping into place when it changes, as on a departure board. Hidden from
 *  assistive technology, which would read the characters one by one: give it the text another way. */
export default function Flaps({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cx("flaps", className)} aria-hidden="true">
      {[...text].map((ch, i) => (
        <span key={i + ch} className="flap">
          {ch}
        </span>
      ))}
    </span>
  );
}

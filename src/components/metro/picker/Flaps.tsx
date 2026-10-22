import type { CSSProperties } from "react";
import "./Flaps.css";

export type FlapStatus = "platform" | "boarding" | "delayed";

interface FlapsProps {
  text: string;
  status: FlapStatus;
  className: string;
}

/** A value on the board's split flaps, a character to each; a new value remounts them, so they flip into place.
 *  The value is said once, in words: the flaps draw their characters from `data-ch` and are hidden from readers. */
export default function Flaps({ text, status, className }: FlapsProps) {
  return (
    <span className={className} data-flaps={status}>
      <span className="flaps-said">{text}</span>
      <span aria-hidden="true">
        {[...text].map((ch, i) => (
          <span key={text + i} className="flap" data-ch={ch} style={{ "--i": i } as CSSProperties} />
        ))}
      </span>
    </span>
  );
}

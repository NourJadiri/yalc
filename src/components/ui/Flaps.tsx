import type { CSSProperties } from "react";
import "./Flaps.css";

type FlapStyle = CSSProperties & { "--i": number };

interface FlapsProps {
  text: string;
  className?: string;
  /** The caller's styling hook, on `data-flaps` (the Metro's board statuses). */
  tone?: string;
  /** Say the text once to assistive technology, visually hidden. Without it the flaps are hidden from it, and the
   *  caller gives the text another way. */
  said?: boolean;
  /** Flip only the characters that change (a clock), instead of the whole value (a status). */
  eachChar?: boolean;
}

/** Platform's split flaps: each character on a flap of its own, flipping into place when it changes. The characters
 *  are drawn from `data-ch`, so the flaps add no text to the page. */
export default function Flaps({ text, className, tone = "", said, eachChar }: FlapsProps) {
  return (
    <span className={className} data-flaps={tone} aria-hidden={said ? undefined : true}>
      {said && <span className="flaps-said">{text}</span>}
      {[...text].map((ch, i) => (
        <span key={eachChar ? `${i}:${ch}` : text + i} className="flap" data-ch={ch} style={{ "--i": i } as FlapStyle} aria-hidden="true" />
      ))}
    </span>
  );
}

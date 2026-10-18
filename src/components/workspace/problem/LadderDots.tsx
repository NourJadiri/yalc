import { cx } from "../../../lib/cx";
import { HINTS } from "../lib/ladder";
import "./LadderDots.css";

interface LadderDotsProps {
  hints: number;
  open: boolean;
}

/** One dot per hint and a last one for the solution, filled as each comes out. */
export default function LadderDots({ hints, open }: LadderDotsProps) {
  const label = `${hints} of ${HINTS} hints shown` + (open ? ", solution open" : "");
  return (
    <span className="ws-dots" role="img" aria-label={label}>
      {Array.from({ length: HINTS + 1 }, (_, i) => (
        <i key={i} className={cx((i < HINTS ? i < hints : open) && "on")} />
      ))}
    </span>
  );
}

import type { Track } from "../../types";
import Station from "./Station";
import "./Terminus.css";

/** The end of the line: the rail stops at a buffer, then the destination and one sentence. */
export default function Terminus({ track, cleared }: { track: Track; cleared: number }) {
  return (
    <Station terminus>
      <div className="terminus-card">
        <h2>{track.terminus}</h2>
        <p>{track.terminusCopy(cleared)}</p>
      </div>
    </Station>
  );
}

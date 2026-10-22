import Icon from "../../shared/Icon";
import "./StopsTrack.css";

interface StopsTrackProps {
  ids: string[];
  /** One entry per answered stop; shorter than `ids` mid-run. */
  results: boolean[];
  /** The stop the run is at, from 0. */
  current: number;
}

function tickClass(result: boolean | undefined) {
  if (result === undefined) return "";
  return result ? "ok" : "ko";
}

/** The run as a Route: answered stops right (go, check) or wrong (stop, cross), the current one ringed, the rest ahead. */
export default function StopsTrack({ ids, results, current }: StopsTrackProps) {
  return (
    <div className="stops-track" aria-hidden="true">
      {ids.map((_, k) => (
        <i key={k} className={tickClass(results[k])} data-now={k === current || undefined}>
          {results[k] !== undefined && <Icon name={results[k] ? "check" : "x"} size={16} />}
        </i>
      ))}
    </div>
  );
}

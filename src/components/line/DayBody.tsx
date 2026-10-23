import { useTrack } from "../../hooks/useTrack";
import { useApp } from "../../state/AppState";
import type { Day } from "../../types";
import MockTimer from "./MockTimer";
import ProblemRow from "./ProblemRow";
import RitualRow from "./RitualRow";
import "./DayBody.css";

/* Always mounted: CSS hides it unless its station is open. */
export default function DayBody({ day }: { day: Day }) {
  const { actions } = useApp();
  const { progress } = useTrack();

  return (
    <div className="daybody">
      <p className="daynote">{day.note}</p>
      {day.steps && (
        <p className="daysteps">{`One build in ${day.probs.length} steps. Each step opens on your code from the one before.`}</p>
      )}
      {day.ritual && (
        <RitualRow
          ritual={day.ritual}
          done={!!progress.rituals[day.id]}
          onToggle={() => actions.toggleRitual(day.id)}
        />
      )}
      <ul className="plist">
        {day.probs.map((p, k) => (
          <ProblemRow
            key={p.id}
            prob={p}
            step={day.steps ? `step ${k + 1}/${day.probs.length}` : undefined}
            done={!!progress.done[p.id]}
            passed={!!progress.accepted[p.id]}
            onToggle={() => actions.toggleProb(p.id)}
            onOpenEditor={() => actions.openWork(p.id)}
          />
        ))}
      </ul>
      {day.mock && <MockTimer />}
    </div>
  );
}

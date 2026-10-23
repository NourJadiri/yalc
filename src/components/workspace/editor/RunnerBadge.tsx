import type { RunnerPhase } from "../../../runner/runner";
import Spinner from "../../ui/Spinner";
import StatusDot from "../../ui/StatusDot";
import "./RunnerBadge.css";

const LABELS: Record<RunnerPhase, string> = {
  cold: "Python idle",
  loading: "Loading Python…",
  ready: "Ready",
  busy: "Running",
  failed: "Python failed to load",
};

const TONES = { cold: "idle", loading: "pulse", ready: "ok", busy: "pulse", failed: "bad" } as const;

export default function RunnerBadge({ phase }: { phase: RunnerPhase }) {
  /* Booting gets the Loader; a run keeps its dot, since the console already shows that run's Loader. */
  return (
    <span className={"ws-runner " + phase}>
      {phase === "loading" ? <Spinner /> : <StatusDot tone={TONES[phase]} aria-hidden="true" />}
      {LABELS[phase]}
    </span>
  );
}

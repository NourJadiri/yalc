import type { Problem } from "../../../types";
import Icon, { type IconName } from "../../shared/Icon";
import Button from "../../ui/Button";
import type { Tone, Verdict } from "../lib/verdict";
import "./VerdictBanner.css";

/* A status verdict carries its pictogram: check for go, warning for caution, stop for stop. Stopped and
   Finished are no status, so their word stands alone. */
const MARK: Partial<Record<Tone, IconName>> = { ok: "check", warn: "warning", bad: "stop" };

interface VerdictBannerProps {
  verdict: Verdict;
  /** Offered as a button: where an accepted submit leads on. Left null for every other verdict. */
  next: Problem | null;
  /** The next problem is the following step of the same build. */
  nextIsStep?: boolean;
  onNext: (id: string) => void;
}

export default function VerdictBanner({ verdict, next, nextIsStep, onNext }: VerdictBannerProps) {
  const mark = MARK[verdict.tone];
  return (
    <div className={"ws-verdict " + verdict.tone}>
      <strong>
        {mark && <Icon name={mark} size={24} />}
        {verdict.title}
      </strong>
      <span>{verdict.detail}</span>
      {next && (
        <Button className="ws-next" onClick={() => onNext(next.id)}>
          {(nextIsStep ? "Next step: " : "Next: ") + next.n}
          <Icon name="arrow" size={20} />
        </Button>
      )}
    </div>
  );
}

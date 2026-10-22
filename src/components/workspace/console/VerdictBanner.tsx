import type { Problem } from "../../../types";
import Icon, { type IconName } from "../../shared/Icon";
import Button from "../../ui/Button";
import type { Tone, Verdict } from "../lib/verdict";
import "./VerdictBanner.css";

/* The verdict's word always comes with its pictogram: check for go, warning for caution, the error mark for stop. */
const MARK: Record<Tone, IconName> = { ok: "check", warn: "alert-triangle", bad: "x", info: "terminal" };

interface VerdictBannerProps {
  verdict: Verdict;
  /** Offered as a button: where an accepted submit leads on. Left null for every other verdict. */
  next: Problem | null;
  /** The next problem is the following step of the same build. */
  nextIsStep?: boolean;
  onNext: (id: string) => void;
}

export default function VerdictBanner({ verdict, next, nextIsStep, onNext }: VerdictBannerProps) {
  return (
    <div className={"ws-verdict " + verdict.tone}>
      <strong>
        <Icon name={MARK[verdict.tone]} size={24} />
        {verdict.title}
      </strong>
      <span>{verdict.detail}</span>
      {next && (
        <Button className="ws-next" onClick={() => onNext(next.id)}>
          {(nextIsStep ? "Next step: " : "Next: ") + next.n}
          <Icon name="arrow-right" size={20} />
        </Button>
      )}
    </div>
  );
}

import type { Problem } from "../../../types";
import Icon from "../../shared/Icon";
import Button from "../../ui/Button";
import { TONE_MARK, type Verdict } from "../lib/verdict";
import "./VerdictBanner.css";

interface VerdictBannerProps {
  verdict: Verdict;
  /** Offered as a button: where an accepted submit leads on. Left null for every other verdict. */
  next: Problem | null;
  /** The next problem is the following step of the same build. */
  nextIsStep?: boolean;
  onNext: (id: string) => void;
}

export default function VerdictBanner({ verdict, next, nextIsStep, onNext }: VerdictBannerProps) {
  const mark = TONE_MARK[verdict.tone];
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

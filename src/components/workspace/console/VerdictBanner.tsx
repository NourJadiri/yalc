import type { Problem } from "../../../types";
import Icon from "../../shared/Icon";
import Button from "../../ui/Button";
import type { Verdict } from "../lib/verdict";
import "./VerdictBanner.css";

interface VerdictBannerProps {
  verdict: Verdict;
  /** Offered as a button: where an accepted submit leads on. Left null for every other verdict. */
  next: Problem | null;
  onNext: (id: string) => void;
}

export default function VerdictBanner({ verdict, next, onNext }: VerdictBannerProps) {
  return (
    <div className={"ws-verdict " + verdict.tone}>
      <strong>{verdict.title}</strong>
      <span>{verdict.detail}</span>
      {next && (
        <Button variant="primary" className="ws-next" onClick={() => onNext(next.id)}>
          {"Next: " + next.n}
          <Icon name="arrow-right" size={13} />
        </Button>
      )}
    </div>
  );
}

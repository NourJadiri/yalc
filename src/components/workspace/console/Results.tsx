import type { Spec } from "../../../data/problems";
import type { Problem } from "../../../types";
import { useSelectedResult } from "../hooks/useSelectedResult";
import { caseLabel } from "../lib/caseLabel";
import { orderLikeCases, type CaseDraft, type RunView } from "../lib/runPlan";
import Block from "./Block";
import CaseDetail from "./CaseDetail";
import ErrorBox from "./ErrorBox";
import ResultChips from "./ResultChips";
import ResultNote from "./ResultNote";
import ResultsEmpty from "./ResultsEmpty";
import ResultsRunning from "./ResultsRunning";
import ValueBox from "./ValueBox";
import VerdictBanner from "./VerdictBanner";

interface ResultsProps {
  spec: Spec;
  cases: CaseDraft[];
  run: RunView | null;
  /** The problem after this one, offered once a submit is accepted. */
  next: Problem | null;
  onNext: (id: string) => void;
}

export default function Results({ spec, cases, run, next, onNext }: ResultsProps) {
  const [sel, setSel] = useSelectedResult(run);

  if (!run) return <ResultsEmpty />;
  const o = run.outcome;
  if (!o) return <ResultsRunning run={run} />;

  const results = run.mode === "run" ? orderLikeCases(run, cases, o.results) : o.results;
  const chosen = results.find((r) => r.i === sel) ?? results[0];
  /* A passing Run only tries the cases: the way on is for a pass of the full suite. */
  const accepted = run.mode === "submit" && run.verdict?.tone === "ok";

  return (
    <div className="ws-results">
      {run.verdict && <VerdictBanner verdict={run.verdict} next={accepted ? next : null} onNext={onNext} />}

      {o.compileError && <ErrorBox err={o.compileError} />}
      {o.entryError && !run.verdict && <ResultNote>{o.entryError}</ResultNote>}
      {o.stdout && (
        <Block title="Printed while loading">
          <ValueBox>{o.stdout}</ValueBox>
        </Block>
      )}

      {results.length > 0 && (
        <ResultChips
          run={run}
          results={results}
          selected={sel}
          onSelect={setSel}
          label={(r) => caseLabel(spec, run, cases, r.i)}
          notRun={o.total - results.length}
        />
      )}

      {chosen && (
        <CaseDetail
          spec={spec}
          result={chosen}
          title={caseLabel(spec, run, cases, chosen.i)}
          abortMsg={o.aborted?.at === chosen.i ? o.aborted.message : null}
        />
      )}
    </div>
  );
}

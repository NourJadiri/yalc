import type { ReactNode, Ref } from "react";
import type { ProblemContent } from "../../../data/problems";
import { useCopied } from "../../../hooks/useCopied";
import Tab from "../../ui/Tab";
import Tabs from "../../ui/Tabs";
import type { Notes } from "../lib/notes";
import HintLadder from "./HintLadder";
import ReferenceSolution from "./ReferenceSolution";
import SolutionVeil from "./SolutionVeil";
import Statement from "./Statement";
import "./ProblemPane.css";

interface ProblemPaneProps {
  content: ProblemContent;
  /** The notes' short version. Having one turns on the hint ladder and the short Solution tab. */
  notes: Notes | null;
  tab: "desc" | "solution";
  onTab: (t: "desc" | "solution") => void;
  /** The solution is open: passed every test at some point, or revealed. */
  open: boolean;
  onReveal: () => void;
  /** How many hints the ladder has shown. */
  hints: number;
  /** The ladder's button: the next hint, then the solution; once that is open, a switch to its tab. */
  onClimb: () => void;
  ladderRef: Ref<HTMLDivElement>;
  fontSize: number;
  /** A build's step track, above the statement. */
  steps?: ReactNode;
}

export default function ProblemPane({ content, notes, tab, onTab, open, onReveal, hints, onClimb, ladderRef, fontSize, steps }: ProblemPaneProps) {
  /* Held here, not in the solution, so the flash survives a trip to the other tab. */
  const [copied, copy] = useCopied(1800);
  const ladder = notes && <HintLadder notes={notes} hints={hints} open={open} onClimb={onClimb} ref={ladderRef} />;

  return (
    <section className="ws-problem" aria-label="Problem">
      <Tabs>
        <Tab icon="file-text" selected={tab === "desc"} onSelect={() => onTab("desc")}>
          Description
        </Tab>
        <Tab icon={open ? "book-open" : "lock"} selected={tab === "solution"} onSelect={() => onTab("solution")}>
          Solution
        </Tab>
      </Tabs>

      <div className="ws-problem-body">
        {tab === "desc" ? (
          <>
            {steps}
            <Statement statement={content.statement} topics={content.spec.topics ?? []} ladder={ladder} />
          </>
        ) : !open ? (
          <SolutionVeil ladder={ladder} onReveal={onReveal} />
        ) : (
          <ReferenceSolution
            content={content}
            notes={notes}
            fontSize={fontSize}
            copied={copied}
            onCopy={() => copy(content.solution)}
          />
        )}
      </div>
    </section>
  );
}

import { useMemo } from "react";
import { listItems } from "../lib/markdown";
import type { Notes } from "../lib/notes";
import { parseStatement } from "../lib/statement";
import Markdown from "../Markdown";
import Checklist from "./Checklist";
import HintBox from "./HintBox";
import ProblemHeading from "./ProblemHeading";
import "./ShortVersion.css";

interface ShortVersionProps {
  notes: Notes;
  /** Whose "Aim for" goes into the walkthrough: the hint ladder took its place on the Description tab. */
  statement: string;
}

/** What the Solution tab opens with: the idea, the steps and the traps, short enough to read in a minute. */
export default function ShortVersion({ notes, statement }: ShortVersionProps) {
  const pitfalls = useMemo(() => listItems(notes.pitfalls), [notes.pitfalls]);
  const walkthrough = useMemo(() => {
    const { aim } = parseStatement(statement);
    return (aim ? `## What to aim for\n\n${aim.body}\n` : "") + notes.walkthrough;
  }, [statement, notes.walkthrough]);

  return (
    <>
      <p className="ws-technique">
        Technique · <b>{notes.pattern}</b>
      </p>
      <ProblemHeading>The trick</ProblemHeading>
      <Markdown text={notes.idea} />
      <ProblemHeading>Steps</ProblemHeading>
      <div className="ws-steps">
        <Markdown text={notes.steps} />
      </div>
      <div className="ws-cost">
        <Markdown text={notes.cost} />
      </div>
      {pitfalls.length > 0 && (
        <>
          <ProblemHeading>Watch out for</ProblemHeading>
          <Checklist items={pitfalls} />
        </>
      )}
      <HintBox icon="book-open" title="Full walkthrough">
        <Markdown text={walkthrough} />
      </HintBox>
    </>
  );
}

import { useMemo, type ReactNode } from "react";
import { parseStatement } from "../lib/statement";
import Markdown from "../Markdown";
import HintBox from "./HintBox";
import InShort from "./InShort";
import ProblemHeading from "./ProblemHeading";
import TopicList from "./TopicList";
import "./Statement.css";

interface StatementProps {
  statement: string;
  topics: string[];
  /** The hint ladder, which stands where the "Aim for" box would. Without one the box is shown. */
  ladder: ReactNode;
}

export default function Statement({ statement, topics, ladder }: StatementProps) {
  const { short, main, aim, follow } = useMemo(() => parseStatement(statement), [statement]);

  return (
    <>
      {topics.length > 0 && <TopicList topics={topics} />}
      {short && <InShort text={short.body} />}
      {main.map((s) => (
        <div key={s.title} className="ws-sec">
          <ProblemHeading>{s.title}</ProblemHeading>
          <Markdown text={s.body} />
        </div>
      ))}
      {ladder ??
        (aim && (
          <HintBox icon="lightbulb" title="Hint — what to aim for">
            <Markdown text={aim.body} />
          </HintBox>
        ))}
      {follow && (
        <HintBox icon="arrow-right" title="Follow-ups an interviewer might ask">
          <Markdown text={follow.body} />
        </HintBox>
      )}
    </>
  );
}

import type { ProblemContent } from "../../../data/problems";
import Icon from "../../shared/Icon";
import LinkButton from "../../ui/LinkButton";
import Editor from "../editor/Editor";
import type { Notes } from "../lib/notes";
import Markdown from "../Markdown";
import ProblemHeading from "./ProblemHeading";
import ShortVersion from "./ShortVersion";
import "./ReferenceSolution.css";

interface ReferenceSolutionProps {
  content: ProblemContent;
  /** The notes' short version. Notes without one are shown whole, as written. */
  notes: Notes | null;
  fontSize: number;
  copied: boolean;
  onCopy: () => void;
}

export default function ReferenceSolution({ content, notes, fontSize, copied, onCopy }: ReferenceSolutionProps) {
  return (
    <>
      {notes ? <ShortVersion notes={notes} statement={content.statement} /> : <Markdown text={content.notes} />}
      <div className="ws-sol-head">
        <ProblemHeading>Reference solution</ProblemHeading>
        <LinkButton onClick={onCopy}>
          <Icon name={copied ? "check" : "copy"} size={13} />
          {copied ? "Copied" : "Copy"}
        </LinkButton>
      </div>
      <div className="ws-sol-code">
        <Editor
          value={content.solution}
          docKey={"solution:" + content.id}
          fontSize={Math.max(11, fontSize - 1)}
          readOnly
          label="Reference solution"
        />
      </div>
    </>
  );
}

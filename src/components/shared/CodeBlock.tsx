import { Fragment, useMemo } from "react";
import { codeRuns } from "./lib/codeRuns";
import "./CodeBlock.css";

interface CodeBlockProps {
  code: string;
  className?: string;
}

/** A Python snippet on a well, in the editor's colours; `____` marks the hole in a missing-line card. */
export default function CodeBlock({ code, className = "code" }: CodeBlockProps) {
  const runs = useMemo(() => codeRuns(String(code)), [code]);
  return (
    <pre className={className}>
      {runs.map((run, i) =>
        run.className ? (
          <span key={i} className={run.className}>
            {run.text}
          </span>
        ) : (
          <Fragment key={i}>{run.text}</Fragment>
        )
      )}
    </pre>
  );
}

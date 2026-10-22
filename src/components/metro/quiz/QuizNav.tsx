import type { ReactNode } from "react";
import Button from "../../ui/Button";
import "./QuizNav.css";

interface QuizNavProps {
  onQuit: () => void;
  /** What sits opposite "End run"; an empty spacer keeps the row's layout when there is nothing. */
  children?: ReactNode;
}

export default function QuizNav({ onQuit, children = <span /> }: QuizNavProps) {
  return (
    <div className="qnav">
      <Button variant="ghost" className="quit" onClick={onQuit}>
        End run
      </Button>
      {children}
    </div>
  );
}

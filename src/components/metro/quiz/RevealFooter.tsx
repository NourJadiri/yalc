import Icon from "../../shared/Icon";
import Button from "../../ui/Button";
import QuizNav from "./QuizNav";
import "./RevealFooter.css";

interface RevealFooterProps {
  explanation: string;
  /** The last stop reads "Finish" instead of "Next stop". */
  last: boolean;
  onNext: () => void;
  onQuit: () => void;
}

export default function RevealFooter({ explanation, last, onNext, onQuit }: RevealFooterProps) {
  return (
    <>
      <div className="explain">{explanation}</div>
      <QuizNav onQuit={onQuit}>
        <Button variant="primary" className="next" onClick={onNext}>
          {last ? "Finish" : "Next stop"}
          <Icon name="arrow" size={20} />
        </Button>
      </QuizNav>
    </>
  );
}

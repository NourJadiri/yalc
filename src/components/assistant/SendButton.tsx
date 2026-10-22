import Icon from "../shared/Icon";
import Button from "../ui/Button";
import "./SendButton.css";

interface Props {
  busy: boolean;
  disabled: boolean;
  onStop: () => void;
}

/* A secondary Button: the panel floats beside the workspace, whose Submit is the view's one primary. */
export default function SendButton({ busy, disabled, onStop }: Props) {
  return busy ? (
    <Button type="button" className="asst-send stop" onClick={onStop} aria-label="Stop" title="Stop">
      <Icon name="square" size={20} />
    </Button>
  ) : (
    <Button type="submit" className="asst-send" disabled={disabled} aria-label="Send" title="Send (Enter)">
      <Icon name="send" size={20} />
    </Button>
  );
}

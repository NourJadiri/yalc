import { DECKS } from "../../../data/questions";
import type { DeckId } from "../../../types";
import Icon from "../../shared/Icon";
import Button from "../../ui/Button";
import "./BoardButton.css";

interface BoardButtonProps {
  deck: DeckId;
  stops: number;
  onBoard: () => void;
}

export default function BoardButton({ deck, stops, onBoard }: BoardButtonProps) {
  const name = DECKS.find((d) => d.id === deck)?.n ?? "Mix";

  return (
    <Button variant="primary" className="board" onClick={onBoard}>
      <Icon name="train" size={20} />
      {"Board " + name + " — " + stops + (stops === 1 ? " stop" : " stops")}
    </Button>
  );
}

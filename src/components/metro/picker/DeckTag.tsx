import Flaps from "./Flaps";
import { tagLabel, type DeckLook } from "./lib/deckLook";
import "./DeckTag.css";

interface DeckTagProps {
  look: DeckLook;
  n: number;
  selected: boolean;
  platform: number;
}

export default function DeckTag({ look, n, selected, platform }: DeckTagProps) {
  const label = tagLabel(look, n, selected);
  if (label === null) return <Flaps className="dplat" status="platform" text={"P" + platform} />;
  return <Flaps className="dtag" status={selected ? "boarding" : "delayed"} text={label} />;
}

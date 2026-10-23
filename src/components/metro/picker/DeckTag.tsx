import Flaps from "../../ui/Flaps";
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
  if (label === null) return <Flaps className="dplat" tone="platform" text={"P" + platform} said />;
  return <Flaps className="dtag" tone={selected ? "boarding" : "delayed"} text={label} said />;
}

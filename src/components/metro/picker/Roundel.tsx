import Bullet from "../../ui/Bullet";
import type { DeckLook } from "./lib/deckLook";
import "./Roundel.css";

/** A deck's mark on the board: its line's bullet, or for Mix the map's interchange. */
export default function Roundel({ look }: { look: DeckLook }) {
  if (look.mix) return <span className="rdl mix" />;
  return (
    <Bullet line={look.line} size="lg" className="rdl">
      {look.glyph}
    </Bullet>
  );
}

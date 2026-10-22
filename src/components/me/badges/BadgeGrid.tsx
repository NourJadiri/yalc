import { BADGES } from "../../../data/meta";
import BadgeTile from "./BadgeTile";
import "./BadgeGrid.css";

interface BadgeGridProps {
  /** The badges this line shows, in order. */
  ids: readonly string[];
  /** Badge id -> the timestamp it was awarded; absent means still locked. */
  badges: Record<string, number>;
}

export default function BadgeGrid({ ids, badges }: BadgeGridProps) {
  const shown = ids.map((id) => BADGES.find((b) => b.id === id)).filter((b) => !!b);
  return (
    <div className="badges">
      {shown.map((b) => (
        <BadgeTile key={b.id} badge={b} earned={!!badges[b.id]} />
      ))}
    </div>
  );
}

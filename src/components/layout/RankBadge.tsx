import "./RankBadge.css";

interface RankBadgeProps {
  name: string;
  /** The line's letter, drawn in its bullet. */
  bullet: string;
}

export default function RankBadge({ name, bullet }: RankBadgeProps) {
  return (
    <div className="rank">
      <span className="rank-bullet" aria-hidden="true">
        {bullet}
      </span>
      <span className="rank-name">{name}</span>
    </div>
  );
}

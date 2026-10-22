import type { Badge } from "../../../types";
import Icon from "../../shared/Icon";
import { BADGE_GLYPHS } from "./badgeGlyphs";
import "./BadgeTile.css";

interface BadgeTileProps {
  badge: Badge;
  earned: boolean;
}

export default function BadgeTile({ badge, earned }: BadgeTileProps) {
  return (
    <div className={"badge" + (earned ? "" : " locked")} title={badge.d}>
      <span className="ic">
        <Icon name={BADGE_GLYPHS[badge.id] ?? "star"} size={28} />
      </span>
      <span>{badge.n}</span>
    </div>
  );
}

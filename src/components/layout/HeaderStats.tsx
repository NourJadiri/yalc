import Icon from "../shared/Icon";
import "./HeaderStats.css";

interface HeaderStatsProps {
  streak: number;
  xp: number;
}

export default function HeaderStats({ streak, xp }: HeaderStatsProps) {
  return (
    <div className="hdr-stats">
      <span aria-label={"Streak " + streak}>
        <Icon name="flame" size={16} className="flame" />
        <span className="hdr-word">Streak</span> <b>{streak}</b>
      </span>
      <span>
        <Icon name="zap" size={16} />
        XP <b>{xp}</b>
      </span>
    </div>
  );
}

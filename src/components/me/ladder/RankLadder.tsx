import { rankIdx } from "../../../lib/engine";
import type { NonEmpty, Rank } from "../../../types";
import "./RankLadder.css";

interface RankLadderProps {
  ranks: NonEmpty<Rank>;
  xp: number;
}

/** The line's ranks as a route: the ones climbed travelled, the current one the stop you are at, the rest ahead. */
export default function RankLadder({ ranks, xp }: RankLadderProps) {
  const here = rankIdx(ranks, xp);

  return (
    <ul className="ladder">
      {ranks.map(([name, need], k) => (
        <li key={name} className={k < here ? "past" : k === here ? "cur" : ""}>
          <span className="lmark">
            <i className={"ldot" + (k > here ? " dim" : "")} />
          </span>
          {name}
          <span className="lxp">{need + " XP"}</span>
        </li>
      ))}
    </ul>
  );
}

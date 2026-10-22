import { DECKS } from "../../../data/questions";
import Icon from "../../shared/Icon";
import "./BoardHead.css";

export default function BoardHead() {
  return (
    <div className="dboard-head">
      <span className="dboard-title">
        <Icon name="train" size={28} />
        Departures — pick a line
      </span>
      <span className="dboard-live">{DECKS.length + " lines"}</span>
    </div>
  );
}

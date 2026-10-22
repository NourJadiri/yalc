import Icon from "../../shared/Icon";
import "../syncpop.css";
import "./LinkedCard.css";

export default function LinkedCard() {
  return (
    <div className="qrlinked" role="status">
      <span className="ic">
        <Icon name="check" size={44} />
      </span>
      <p>Linked</p>
    </div>
  );
}

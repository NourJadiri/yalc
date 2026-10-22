import Icon from "../../shared/Icon";
import "./LinkedCard.css";

export default function LinkedCard() {
  return (
    <div className="qrlinked" role="status">
      <span className="ic">
        <Icon name="check" size={32} />
      </span>
      <p>Linked</p>
    </div>
  );
}

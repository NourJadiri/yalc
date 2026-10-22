import { cx } from "../../lib/cx";
import type { Template } from "../../types";
import Icon from "../shared/Icon";
import Tag from "../ui/Tag";
import TemplateCode from "./TemplateCode";
import "./TemplateCard.css";

interface TemplateCardProps {
  tpl: Template;
  open: boolean;
  shown: boolean;
  onToggle: (id: string) => void;
  onReveal: (id: string) => void;
}

export default function TemplateCard({ tpl, open, shown, onToggle, onReveal }: TemplateCardProps) {
  return (
    <div className={cx("tcard", open && "open")}>
      <button className="thead" onClick={() => onToggle(tpl.id)} aria-expanded={open}>
        <h3>{tpl.n}</h3>
        <Tag className="ttag">{tpl.tag}</Tag>
        <Icon name="chevron-down" size={20} className="chev" />
      </button>
      <div className="tbody">
        <p className="tnote">{tpl.note}</p>
        <TemplateCode code={tpl.code} shown={shown} onReveal={() => onReveal(tpl.id)} />
      </div>
    </div>
  );
}

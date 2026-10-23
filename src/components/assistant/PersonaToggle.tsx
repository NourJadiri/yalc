import type { Persona } from "../../../shared/assistantContract";
import { cx } from "../../lib/cx";
import IconButton from "../ui/IconButton";
import { PERSONA_LOOKS } from "./lib/personas";
import "./PersonaToggle.css";

interface Props {
  value: Persona;
  onChange: (persona: Persona) => void;
}

export default function PersonaToggle({ value, onChange }: Props) {
  return (
    <div className="asst-voices" role="group" aria-label="Bana's mode">
      {PERSONA_LOOKS.map((p) => (
        <IconButton
          key={p.id}
          type="button"
          size="sm"
          icon={p.icon}
          label={p.label}
          title={p.label}
          className={cx("asst-voice", value === p.id && "on")}
          aria-pressed={value === p.id}
          onClick={() => onChange(p.id)}
        />
      ))}
    </div>
  );
}

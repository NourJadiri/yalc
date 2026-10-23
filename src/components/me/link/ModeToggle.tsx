import Segment from "../../ui/Segment";
import SegmentedControl from "../../ui/SegmentedControl";
import type { SheetMode } from "./lib/mode";
import "./ModeToggle.css";

interface ModeToggleProps {
  mode: SheetMode;
  onChange: (mode: SheetMode) => void;
}

/* Two toggle buttons in a group, not tabs: there are no panels to switch between, so the tab roles are taken back off. */
export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const get = mode === "get";
  return (
    <SegmentedControl className="segtoggle" role="group" aria-label="What this device should do">
      <Segment selected={get} onSelect={() => onChange("get")} role={undefined} aria-selected={undefined} aria-pressed={get}>
        Get progress
      </Segment>
      <Segment selected={!get} onSelect={() => onChange("send")} role={undefined} aria-selected={undefined} aria-pressed={!get}>
        Send progress
      </Segment>
    </SegmentedControl>
  );
}

import type { SyncStatus } from "../../../lib/sync";
import Icon from "../../shared/Icon";
import { ago, look } from "./lib/syncDisplay";
import "./SyncStatusCard.css";

interface SyncStatusCardProps {
  status: SyncStatus;
  /** The status just settled: light the card up for a beat. */
  pop: boolean;
  now: number;
}

export default function SyncStatusCard({ status, pop, now }: SyncStatusCardProps) {
  const l = look(status);
  const when = status.held ? "" : ago(status.syncedAt, now);
  return (
    <div className={"synccard" + (pop ? " pop" : "")} style={{ color: l.tone }}>
      <span className="ic">
        <Icon name={l.glyph} size={24} />
      </span>
      <div className="synctext">
        <b>{l.title}</b>
        {when && <span>Last synced {when}</span>}
      </div>
    </div>
  );
}

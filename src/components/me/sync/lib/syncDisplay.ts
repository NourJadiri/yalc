import type { SyncStatus } from "../../../../lib/sync";
import type { IconName } from "../../../shared/Icon";

interface Look {
  glyph: IconName;
  /** A status colour token (go, caution, stop; ink while it works), so every theme comes along for free. */
  tone: string;
  title: string;
  /** The one sentence the card can't say in three words. */
  note: string;
}

export function look(s: SyncStatus): Look {
  if (s.held && s.phase === "error") {
    return {
      glyph: "warning",
      tone: "var(--caution)",
      title: "Update needed",
      note: "The cloud copy is from a newer version of the app. Reload to update; until then this device leaves it alone.",
    };
  }
  switch (s.phase) {
    case "working":
      return { glyph: "refresh", tone: "var(--ink)", title: "Syncing…", note: "" };
    case "pending":
      return {
        glyph: "clock",
        tone: "var(--caution)",
        title: "Changes queued",
        note: "They go up in a moment, or the next time there's a network.",
      };
    case "error":
      return {
        glyph: "stop",
        tone: "var(--stop)",
        title: "Cloud unreachable",
        note: "Progress is safe on this device and will sync when it can.",
      };
    default:
      return {
        glyph: "check",
        tone: "var(--go)",
        title: s.syncedAt ? "All changes synced" : "Sync is on",
        note: "Enter the code above on another device to link it.",
      };
  }
}

/** "just now", "3m ago", "2h ago"; nothing at all if it has never happened. */
export function ago(at: number, now: number): string {
  if (!at) return "";
  const secs = Math.max(0, Math.round((now - at) / 1000));
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

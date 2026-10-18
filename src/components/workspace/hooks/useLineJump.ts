import { useCallback, useEffect, useState, type RefObject } from "react";
import type { EditorHandle } from "../editor/Editor";
import type { MobileTab } from "../layout/MobileLayout";

/* A rebuilt editor has its handle back within a frame or two; if it never does, the jump is dropped. */
const HANDLE_FRAMES = 30;

interface LineJumpOptions {
  editor: RefObject<EditorHandle | null>;
  wide: boolean;
  hideAssistant: () => void;
  onTab: (tab: MobileTab) => void;
}

/** Takes a line number Bana named to the editor. On a phone the assistant is a sheet over the panes and the editor is one tab of three: the sheet steps aside and the Code tab comes up before the jump. */
export function useLineJump({ editor, wide, hideAssistant, onTab }: LineJumpOptions) {
  const [pending, setPending] = useState<{ from: number; to: number } | null>(null);

  /* Runs once the layout with the code on screen has rendered, and jumps as soon as the editor has its handle. */
  useEffect(() => {
    if (!pending) return;
    let frames = HANDLE_FRAMES;
    let frame = 0;
    const attempt = () => {
      if (editor.current) {
        editor.current.goToLine(pending.from, pending.to);
        setPending(null);
      } else if (--frames > 0) {
        frame = requestAnimationFrame(attempt);
      }
    };
    frame = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(frame);
  }, [pending, editor]);

  /* Stable while you type, so the memoised assistant holds still. */
  return useCallback(
    (from: number, to: number) => {
      if (wide) {
        editor.current?.goToLine(from, to);
        return;
      }
      hideAssistant();
      onTab("code");
      setPending({ from, to });
    },
    [wide, editor, hideAssistant, onTab]
  );
}

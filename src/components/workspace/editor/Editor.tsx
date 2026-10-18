import { useEffect, useRef, useState, type RefObject } from "react";
import { historyField } from "@codemirror/commands";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { editorExtensions } from "./extensions";
import { setErrorLine } from "./errorLine";
import { jumpToLine } from "./jumpLine";
import { fontTheme } from "./theme";
import "./Editor.css";

export interface EditorSnapshot {
  docKey: string;
  state: unknown;
}

export interface EditorHandle {
  /** The cursor to the start of line `from` (counted from 1), centred and focused; lines `from` to `to` flash. */
  goToLine(from: number, to?: number): void;
}

export interface EditorProps {
  /** The document to show. Replaced wholesale whenever `docKey` changes; otherwise the editor owns the text and
   *  reports edits via onChange. */
  value: string;
  docKey: string;
  onChange?: (code: string) => void;
  onRun?: () => void;
  onSubmit?: () => void;
  errorLine?: number | null;
  /** Bumped per run, so the same line blamed twice still re-marks it after an edit cleared the first mark. */
  errorRev?: number;
  fontSize: number;
  readOnly?: boolean;
  label: string;
  /** Outlives the editor: a rebuild for the same document resumes from it, undo history included. */
  snapshot?: RefObject<EditorSnapshot | null>;
  /** Set while the view exists (a rebuild sets it again), so whoever holds the ref can move the cursor. */
  handle?: RefObject<EditorHandle | null>;
}

export default function Editor({
  value,
  docKey,
  onChange,
  onRun,
  onSubmit,
  errorLine = null,
  errorRev = 0,
  fontSize,
  readOnly = false,
  label,
  snapshot,
  handle,
}: EditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const [font] = useState(() => new Compartment());
  const callbacks = useRef({ onChange, onRun, onSubmit });
  callbacks.current = { onChange, onRun, onSubmit };

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const extensions = editorExtensions({ callbacks, font, fontSize, label, readOnly });
    const saved = snapshot?.current?.docKey === docKey ? snapshot.current.state : null;
    const state = saved
      ? EditorState.fromJSON(saved, { extensions }, { history: historyField })
      : EditorState.create({ doc: value, extensions });
    const v = new EditorView({ state, parent: el });
    view.current = v;
    if (handle) handle.current = { goToLine: (from, to) => jumpToLine(v, from, to) };
    return () => {
      if (snapshot) snapshot.current = { docKey, state: v.state.toJSON({ history: historyField }) };
      if (handle) handle.current = null;
      v.destroy();
      view.current = null;
    };
    /* Keyed on the document, not the text: a new document is a new editor (fresh undo history, no stale error
       band), while typing never rebuilds. */
  }, [docKey, readOnly]);

  useEffect(() => {
    view.current?.dispatch({ effects: font.reconfigure(fontTheme(fontSize)) });
  }, [fontSize]);

  useEffect(() => {
    view.current?.dispatch({ effects: setErrorLine.of(errorLine) });
  }, [errorLine, errorRev, docKey]);

  return <div className="cm-host" ref={host} />;
}

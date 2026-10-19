import { useEffect, useRef } from "react";

/** Moves focus into the dialog on open and back to whatever opened it on close: the row's editor button, for a keyboard user.
 *  Moving on to another problem inside the open dialog takes the button that did it away, so focus comes back to the dialog then too. */
export function useDialogFocus(pid: string) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => opener?.focus();
  }, []);
  useEffect(() => {
    dialog.current?.focus();
  }, [pid]);
  return dialog;
}

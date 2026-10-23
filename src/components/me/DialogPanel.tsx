import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import "./DialogPanel.css";

interface DialogPanelProps {
  title: string;
  /** The buttons along the foot, the primary one last. */
  actions: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Platform's dialog panel, to sit in a `ui/Dialog` whose own element is the scrim: a heading, the body, the actions. */
export default function DialogPanel({ title, actions, className, children }: DialogPanelProps) {
  return (
    <div className={cx("dlgpanel", className)}>
      <h2 className="dlgpanel-title">{title}</h2>
      {children}
      <div className="dlgpanel-actions">{actions}</div>
    </div>
  );
}

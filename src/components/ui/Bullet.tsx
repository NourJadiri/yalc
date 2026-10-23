import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import type { LineNumber } from "../../types";
import "./Bullet.css";

export type BulletLine = LineNumber | "track" | "ink";

interface BulletProps extends ComponentProps<"span"> {
  /** Whose colour it wears: a Platform line, the line being ridden (`var(--track)`), or ink. */
  line: BulletLine;
  /** 20px, 24px (the default) or 32px across. */
  size?: "sm" | "md" | "lg";
}

/** A line's round mark holding its letter or number, the children. */
export default function Bullet({ line, size = "md", className, ...rest }: BulletProps) {
  return <span className={cx("bullet", size !== "md" && size, className)} data-line={line} {...rest} />;
}

import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./Spinner.css";

interface SpinnerProps extends ComponentProps<"div"> {
  /** Platform's small Loader, for a line of caption text. */
  size?: "sm";
}

export default function Spinner({ size, className, ...rest }: SpinnerProps) {
  return <div className={cx("spinner", size, className)} aria-hidden="true" {...rest} />;
}

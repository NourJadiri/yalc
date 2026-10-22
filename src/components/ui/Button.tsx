import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./Button.css";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "ghost";
  tone?: "ok";
  /** 36px instead of 44px, for the workspace's dense bars. */
  size?: "compact";
}

export default function Button({ variant, tone, size, className, ...rest }: ButtonProps) {
  return <button className={cx("btn", variant, tone, size, className)} {...rest} />;
}

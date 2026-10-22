import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import Icon from "../shared/Icon";
import "./Station.css";

/* Station must stay a direct child of .linewrap: the dashed line ahead keys off `.stn.now ~ .stn`. */
interface StationProps {
  done?: boolean;
  now?: boolean;
  open?: boolean;
  terminus?: boolean;
  children?: ReactNode;
}

export default function Station({ done, now, open, terminus, children }: StationProps) {
  return (
    <div className={cx("stn", done && "done", now && "now", open && "open", terminus && "terminus")}>
      <div className="rail">
        <div className="stop">{done && <Icon name="check" size={16} />}</div>
      </div>
      <div className="stn-body">{children}</div>
    </div>
  );
}

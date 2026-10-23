import type { ReactNode } from "react";
import Icon, { type IconName } from "../shared/Icon";
import Button from "../ui/Button";

interface TimerButtonProps {
  icon: IconName;
  onClick: () => void;
  children: ReactNode;
}

export default function TimerButton({ icon, onClick, children }: TimerButtonProps) {
  return (
    <Button className="tbtn" onClick={onClick}>
      <Icon name={icon} size={20} />
      {children}
    </Button>
  );
}

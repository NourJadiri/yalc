import type { ReactNode } from "react";
import { cx } from "../../../lib/cx";
import Icon from "../../shared/Icon";
import Button from "../../ui/Button";
import LinkButton from "../../ui/LinkButton";
import "./SolutionVeil.css";

interface SolutionVeilProps {
  /** The hint ladder, when the problem has one: hints first, the whole solution on a second thought. */
  ladder: ReactNode;
  onReveal: () => void;
}

export default function SolutionVeil({ ladder, onReveal }: SolutionVeilProps) {
  return (
    <div className={cx("ws-veil", !!ladder && "hinted")}>
      <Icon name="lock" size={22} />
      {ladder ? (
        <>
          <p>
            <b>Try it first.</b> The solution opens by itself once every test passes.
          </p>
          {ladder}
          <LinkButton onClick={onReveal}>Skip to the solution</LinkButton>
        </>
      ) : (
        <>
          <p>
            <b>Try it first.</b> The walkthrough and a reference solution are here when you want them — and they open by
            themselves once every test passes.
          </p>
          <Button onClick={onReveal}>
            <Icon name="eye" size={15} />
            Reveal the solution
          </Button>
        </>
      )}
    </div>
  );
}

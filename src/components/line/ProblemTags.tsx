import { probXP } from "../../data/plan";
import type { Problem } from "../../types";
import DifficultyTag from "../ui/DifficultyTag";
import Tag from "../ui/Tag";
import XpValue from "../ui/XpValue";
import "./ProblemTags.css";

interface ProblemTagsProps {
  prob: Problem;
  step?: string;
  passed: boolean;
}

export default function ProblemTags({ prob, step, passed }: ProblemTagsProps) {
  return (
    <div className="pmeta">
      <DifficultyTag diff={prob.diff} />
      {prob.warm && <Tag>warm-up</Tag>}
      {step ? <Tag>{step}</Tag> : prob.drill && <Tag>{prob.orig ? "original" : "premium"}</Tag>}
      {passed && <Tag tone="passed">passed</Tag>}
      <XpValue>{"+" + probXP(prob) + " XP"}</XpValue>
    </div>
  );
}

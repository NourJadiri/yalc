import type { Spec } from "../../../data/problems";
import { LC } from "../../../data/plan";
import { TRACKS, type ProblemRef } from "../../../data/tracks";
import type { TrackId } from "../../../types";
import Icon from "../../shared/Icon";
import Bullet, { type BulletLine } from "../../ui/Bullet";
import DifficultyTag from "../../ui/DifficultyTag";
import Tag from "../../ui/Tag";
import "./ProblemMeta.css";

/** Each YALC line is one Platform line: Onsite Express 2, Day One Local 4, Engineering Works 5. */
const LINE: Record<TrackId, BulletLine> = { google: 2, aws: 4, eng: 5 };

interface ProblemMetaProps {
  spec: Spec;
  problemRef: ProblemRef;
  /** Ticked on the line, by hand or by passing. */
  done: boolean;
  accepted: boolean;
}

export default function ProblemMeta({ spec, problemRef: { day, track }, done, accepted }: ProblemMetaProps) {
  const T = TRACKS[track];
  const lcLink = spec.lc?.slug ? LC(spec.lc.slug) : null;

  return (
    <div className="ws-meta">
      <DifficultyTag diff={spec.difficulty} />
      <Bullet line={LINE[track]} size="sm" className="ws-bullet" data-track={track} aria-label={T.name}>
        {T.bullet}
      </Bullet>
      <Tag>{`${T.unit} ${day.d} · ${day.stn}`}</Tag>
      {done && (
        <span className="ws-done">
          <Icon name="check" size={16} />
          {accepted ? "passed" : "ticked"}
        </span>
      )}
      {lcLink ? (
        <a className="ws-lc" href={lcLink} target="_blank" rel="noopener">
          {"LC " + (spec.lc?.num ?? "")}
          <Icon name="external" size={16} />
        </a>
      ) : spec.lc?.premium ? (
        <Tag>{"LC " + spec.lc.num + " · premium"}</Tag>
      ) : null}
    </div>
  );
}

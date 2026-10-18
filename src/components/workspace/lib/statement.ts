import { sections } from "./markdown";

const AIM = /^aim for$/i;
const FOLLOW = /^follow-ups?/i;

/** A statement's sections, with the two the workspace folds away ("Aim for", "Follow-ups") told apart from the rest. */
export function parseStatement(statement: string) {
  const parts = sections(statement);
  return {
    main: parts.filter((s) => !AIM.test(s.title) && !FOLLOW.test(s.title)),
    aim: parts.find((s) => AIM.test(s.title)),
    follow: parts.find((s) => FOLLOW.test(s.title)),
  };
}

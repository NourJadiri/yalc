import { sections } from "./markdown";

const SHORT = /^in short$/i;
const AIM = /^aim for$/i;
const FOLLOW = /^follow-ups?/i;

/** A statement's sections, with the three the workspace sets apart ("In short" above the rest, "Aim for" and
 *  "Follow-ups" folded below) told apart from the rest. */
export function parseStatement(statement: string) {
  const parts = sections(statement);
  const apart = (title: string) => SHORT.test(title) || AIM.test(title) || FOLLOW.test(title);
  return {
    short: parts.find((s) => SHORT.test(s.title)),
    main: parts.filter((s) => !apart(s.title)),
    aim: parts.find((s) => AIM.test(s.title)),
    follow: parts.find((s) => FOLLOW.test(s.title)),
  };
}

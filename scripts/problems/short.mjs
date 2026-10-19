/* The short versions a reader gets first: the one line at the top of statement.md (In short), four
 * sections at the top of notes.md (Pattern, Key idea, Steps, Cost) and a `# N.` marker in
 * solution.py where each step starts. validate.mjs runs these checks with the rest; check-short.mjs
 * runs only these, without loading Python. */

export const SHORT = ["Pattern", "Key idea", "Steps", "Cost"];
export const IN_SHORT = "In short";
const SUMMARY_WORDS = 25;

/* `# 3. Walk in from both ends.`: a step marker, at the indentation of the code it heads. */
const MARK = /^(\s*)# (\d+)\. (.*)$/;
const MAX_WORDS = 30;

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/** A markdown file's ## sections, in order. Fence-aware, like the app's own reader. */
export function sections(md) {
  const out = [];
  let cur = null;
  let fenced = false;
  for (const line of md.replace(/\r\n/g, "\n").split("\n")) {
    if (/^(```|~~~)/.test(line)) fenced = !fenced;
    if (!fenced && line.startsWith("## ")) {
      cur = { title: line.slice(3).trim(), body: "" };
      out.push(cur);
    } else if (cur) {
      cur.body += line + "\n";
    }
  }
  return out;
}

export function checkShort(notes, solution) {
  const errors = [];
  const warnings = [];
  const secs = sections(notes);
  const titles = secs.slice(0, SHORT.length).map((s) => s.title);
  if (titles.join("|") !== SHORT.join("|")) {
    errors.push(`notes.md must open with ${SHORT.map((t) => "## " + t).join(", ")}, in that order`);
    return { errors, warnings };
  }
  const body = (t) => secs.find((s) => s.title === t).body.trim();

  const pattern = body("Pattern");
  if (!pattern || pattern.includes("\n")) errors.push("## Pattern is one line: the technique's name");
  else {
    if (words(pattern) > 6) errors.push(`## Pattern has ${words(pattern)} words; name the technique in 6 or fewer`);
    if (pattern.endsWith(".")) errors.push("## Pattern is a name, without a final period");
  }

  const idea = body("Key idea");
  if (!idea) errors.push("## Key idea is empty");
  else if (/\n\s*\n/.test(idea) || /^(```|~~~|\s*[-*] |\s*\d+\. )/m.test(idea))
    errors.push("## Key idea is one sentence: no blank lines, lists or code blocks");
  else if (words(idea) > MAX_WORDS) errors.push(`## Key idea has ${words(idea)} words; keep it to ${MAX_WORDS}`);

  const steps = body("Steps").split("\n").filter((l) => l.trim());
  steps.forEach((line, i) => {
    const head = `${i + 1}. `;
    if (!line.startsWith(head)) errors.push(`## Steps line ${i + 1} must read "${head}…": one line per step, no sub-items`);
    else if (words(line.slice(head.length)) > MAX_WORDS)
      errors.push(`step ${i + 1} has ${words(line.slice(head.length))} words; keep each step to ${MAX_WORDS}`);
  });
  if (steps.length < 2 || steps.length > 6) errors.push(`## Steps has ${steps.length}; write 2 to 6 (3 to 5 is typical)`);

  const cost = body("Cost");
  if (!cost || cost.includes("\n")) errors.push("## Cost is one line: `O(…)` time · `O(…)` space");
  else {
    if (!/\btime\b/.test(cost) || !/\bspace\b/.test(cost)) errors.push("## Cost names both time and space");
    if (cost.length > 100) warnings.push(`## Cost is ${cost.length} characters; it reads best under 100`);
  }

  const lines = solution.split("\n");
  const marks = [];
  lines.forEach((line, i) => {
    const m = MARK.exec(line);
    if (m) marks.push({ n: Number(m[2]), indent: m[1], at: i });
  });
  const got = marks.map((m) => m.n).join(",");
  const want = steps.map((_, i) => i + 1).join(",");
  if (got !== want)
    errors.push(
      `solution.py's step markers read ${got ? marks.map((m) => `# ${m.n}.`).join(" ") : "nothing"}; ` +
        `## Steps needs # 1. to # ${steps.length}., once each and in order`
    );
  for (const m of marks) {
    const next = lines.slice(m.at + 1).find((l) => l.trim());
    const indent = next === undefined ? null : /^\s*/.exec(next)[0];
    if (indent !== m.indent) errors.push(`solution.py line ${m.at + 1}: put "# ${m.n}." at the indentation of the code below it`);
  }
  return { errors, warnings };
}

/** The statement's one line: what you're given → what you return, before the story starts. */
export function checkSummary(statement) {
  const errors = [];
  const secs = sections(statement);
  if (secs[0]?.title !== IN_SHORT || secs[1]?.title !== "The task") {
    errors.push(`statement.md must open with "## ${IN_SHORT}", right before "## The task"`);
    return { errors, warnings: [] };
  }
  const line = secs[0].body.trim();
  if (!line || line.includes("\n")) errors.push(`## ${IN_SHORT} is one line`);
  else {
    if (!line.includes(" → ")) errors.push(`## ${IN_SHORT} reads "<what you get> → <what you return>", with a " → "`);
    if (words(line) > SUMMARY_WORDS) errors.push(`## ${IN_SHORT} has ${words(line)} words; keep it to ${SUMMARY_WORDS}`);
  }
  return { errors, warnings: [] };
}

/** Whether `now` is `before` with the In short section put in front of ## The task and nothing else changed. */
export function onlySummaryAdded(before, now) {
  const from = now.search(/^## In short$/m);
  const at = now.search(/^## The task/m);
  return from >= 0 && at > from && now.slice(0, from) + now.slice(at) === before && sections(now.slice(from, at)).length === 1;
}

/** Whether `now` is `before` with step markers added and nothing else: a marker line inserted, or `N. `
 *  put in front of a comment line that was already there. */
export function onlyMarkersAdded(before, now) {
  const a = before.split("\n");
  let j = 0;
  for (const line of now.split("\n")) {
    if (j < a.length && line === a[j]) {
      j++;
      continue;
    }
    const m = MARK.exec(line);
    if (!m) return false;
    if (j < a.length && a[j] === `${m[1]}# ${m[3]}`) j++;
  }
  return j === a.length;
}

/** Whether `now` is `before` with the short version put in front and nothing else changed. */
export function onlyShortAdded(before, now) {
  const at = now.search(/^## Approach/m);
  return at >= 0 && now.slice(at) === before && sections(now.slice(0, at)).map((s) => s.title).join("|") === SHORT.join("|");
}

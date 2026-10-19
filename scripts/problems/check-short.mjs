/* Checks the short versions (statement.md's In short line, the first four sections of notes.md) and
 * the step markers in solution.py, in a second and without running any Python tests.
 *
 *   node scripts/problems/check-short.mjs                       # every problem
 *   node scripts/problems/check-short.mjs two-sum ...           # just these
 *   node scripts/problems/check-short.mjs --base <ref> two-sum  # and nothing else changed since <ref>
 *
 * With --base, each file is either as it was at <ref> or that file plus its short version and
 * nothing else: statement.md with the In short section put in front of The task, notes.md with the
 * four sections put in front, solution.py with markers added (python3 also confirms its code is
 * unchanged). The rules themselves are in short.mjs; AUTHORING.md explains them.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkShort, checkSummary, onlyMarkersAdded, onlyShortAdded, onlySummaryAdded } from "./short.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const BANK = path.join(ROOT, "src/data/problems");

const argv = process.argv.slice(2);
const b = argv.indexOf("--base");
const base = b >= 0 ? argv[b + 1] : null;
if (b >= 0 && !base) {
  console.error("--base needs a git ref");
  process.exit(2);
}
const wanted = argv.filter((a, i) => !a.startsWith("--") && !(b >= 0 && i === b + 1));
const ids = wanted.length
  ? wanted
  : fs.readdirSync(BANK).filter((d) => fs.statSync(path.join(BANK, d)).isDirectory()).sort();

const atBase = (id, f) => execFileSync("git", ["show", `${base}:src/data/problems/${id}/${f}`], { cwd: ROOT, encoding: "utf8" });

/* Comments aren't in Python's AST, so equal dumps mean the markers changed no code. */
function sameCode(before, now) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "short-"));
  try {
    const a = path.join(dir, "a.py");
    const c = path.join(dir, "b.py");
    fs.writeFileSync(a, before);
    fs.writeFileSync(c, now);
    const dump = "import ast,sys\nd=[ast.dump(ast.parse(open(p).read())) for p in sys.argv[1:]]\nsys.exit(0 if d[0]==d[1] else 1)";
    execFileSync("python3", ["-I", "-c", dump, a, c], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

let failed = 0;
for (const id of ids) {
  const dir = path.join(BANK, id);
  const read = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), "utf8") : null);
  const statement = read("statement.md");
  const notes = read("notes.md");
  const solution = read("solution.py");
  if (statement === null || notes === null || solution === null) {
    console.log(`FAIL ${id}\n  - missing statement.md, notes.md or solution.py`);
    failed++;
    continue;
  }
  const { errors, warnings } = checkShort(notes, solution);
  errors.push(...checkSummary(statement).errors);
  if (base) {
    const said = atBase(id, "statement.md");
    if (statement !== said && !onlySummaryAdded(said, statement))
      errors.push(`statement.md: only the In short section may be added, right before ## The task; everything else must stay as it was at ${base}`);
    const noted = atBase(id, "notes.md");
    if (notes !== noted && !onlyShortAdded(noted, notes))
      errors.push(`notes.md: only the four short sections may be added in front; everything from ## Approach on must stay as it was at ${base}`);
    const before = atBase(id, "solution.py");
    if (solution !== before && !onlyMarkersAdded(before, solution))
      errors.push(`solution.py: only "# N." markers may be added (new lines, or put in front of an existing comment); nothing else may change`);
    else if (solution !== before && !sameCode(before, solution)) errors.push("solution.py: the code itself changed (a marker landed inside a string?)");
  }
  if (errors.length) {
    failed++;
    console.log(`FAIL ${id}`);
    for (const e of errors) console.log("  - " + e);
  } else {
    console.log(`ok   ${id}`);
  }
  for (const w of warnings) console.log("  ~ " + w);
}
console.log(`\n${ids.length - failed}/${ids.length} ok`);
process.exit(failed ? 1 : 0);

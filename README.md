# YALC

**Y**et **A**nother **L**eetCode **C**lone: interview prep laid out as a metro line, with a
Python editor in every problem.

- **Onsite Express** (Google): a 24-day study plan, five problems a day, ending in timed mocks.
- **Day One Local** (Amazon): thirteen stops through Seattle, one idea per stop, LeetCode Easy only.
- **Engineering Works** (ElevenLabs · SIG): seven systems you'd actually ship (an order book, a rate
  limiter, a key-value store, a voice stream receiver, a checkout, a file system, diff and merge), each
  built in steps: the core first, then one feature at a time until it's whole.

Every problem opens in a workspace with its own statement, a CodeMirror editor and tests
that run in the browser on real CPython (Pyodide). No LeetCode account needed.

## Features

- **Line**: the study plan. Tick problems, open them in the workspace, log the daily
  ritual, run the mock-interview clocks. Switching lines retints the app.
- **Metro**: a thumb-only quiz for the commute. 120 cards, ten stops a run, streaks
  multiply the XP, and missed cards come back in the Redemption deck.
- **Dojo**: 15 algorithm templates, blurred until you've written them from memory.
- **Me**: stats, the rank ladder, badges, export/import and cloud sync.
- **Builds**: on the Engineering Works every station is one system in three or four steps. Each
  step is a full problem whose tests re-run the earlier steps', and it opens on your code from the
  step before, so the build reads as one program growing. A track above the statement shows the
  steps; passing one offers the next.
- **Workspace**: every problem opens with its task in one line, above the story. Run the
  examples, Submit the full hidden suite; passing it ticks the problem and offers the next
  one in the plan. Drafts are saved per problem. When you're stuck, a hint ladder gives
  one piece at a time (the technique, the key idea, the steps) before the solution, and
  after 20 minutes without a pass a small card offers the next hint. The Solution tab
  opens on a short version: the trick, numbered steps that match the `# 1.`, `# 2.`
  comments in the reference code, the cost and a checklist of pitfalls, with the full
  walkthrough folded below.
- **Bana** (optional): `⌘K` / `Ctrl+K` in the workspace opens a small chat with
  Claude that already knows the problem, your code and your last run. Three modes, picked
  in its header: Normal, Tough love (roasts your code, then shows you exactly where it's
  wrong) and Goth catgirl (who texts you, her face changing with her mood), each with its
  own look. Her answers lead with the answer in bold, take one bug at a time and end with
  one next step. Following up is a tap, not typing: four quick replies sit under her
  latest answer, and when she says "line 7" it is a button that takes you to that line of
  your code.

Progress is stored in `localStorage`. Cloud sync and the assistant are optional; without
them the app is fully local. It loads nothing from other origins: its fonts are served by
the app itself, and there are no analytics.

## Tech

React 19, TypeScript (strict), Vite, CodeMirror 6, Pyodide in a web worker. Deployed as a
Cloudflare Worker that serves the static build and two small APIs: `/api/state` (sync,
backed by D1) and `/api/assistant` (Anthropic API).

## Design

The interface is drawn in **Platform**, a design system that borrows its rules from transit
wayfinding: metro maps, station signs and departure boards. Bold type, one message per sign,
colour-coded lines, numbers that line up.

- **Themes.** Day, Night and High contrast, all in `src/styles/tokens.css` under the same
  token names. The app follows the system: Night when it is dark, High contrast when it asks
  for more contrast. `data-theme` on `<html>` (`light`, `dark` or `contrast`) overrides it,
  and `data-theme="dark"` on any element lights just that element at night (the Metro's
  departures board, Bana's catgirl window).
- **Lines.** Each line of the app is one Platform line, drawn in its colour with its letter
  everywhere: Onsite Express is line 2 (G), Day One Local line 4 (A), Engineering Works
  line 5 (E). `Track.line` holds the number; `var(--track)` is the colour of the line being
  ridden. The Metro's decks are lines too. Signal yellow is never a line: it marks the one
  way forward on each screen, the primary button.
- **Type.** Barlow and Barlow Condensed (SIL Open Font License, in `public/fonts/`), set
  through Platform's type styles: `font: var(--t-label)` in CSS, the `t-label` class in markup.
- **Parts.** The shared primitives in `src/components/ui/` (Button, Bullet, Tabs,
  SegmentedControl, the status chips, the Loader) and the pictograms in
  `src/components/shared/Icon/` are Platform's; every area composes them.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173 (no Worker: sync and the assistant are off)
```

To run with the Worker, its local D1 and the assistant:

```bash
npm run build
npx wrangler dev   # http://localhost:8787
```

For the assistant locally, create a `.dev.vars` file at the repo root (it is git-ignored):

```
ANTHROPIC_API_KEY=sk-ant-...
ASSISTANT_PASSWORD=some-long-random-string
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | typecheck, then build to `dist/` |
| `npm run preview` | serve the build |
| `npm run typecheck` | `tsc` only |
| `npm run problems` | validate the problem bank's reference solutions in Pyodide |

## Deploying

The whole Worker config is in `wrangler.jsonc`.

1. **D1 database** (for sync): `npx wrangler d1 create yalc`, then put its id in
   `database_id` under `d1_databases` in `wrangler.jsonc`. The table creates itself on
   first use. Without a database, remove the `d1_databases` block: sync then reports the
   cloud as unreachable and everything else works.
2. **Assistant secrets** (optional): in the Cloudflare dashboard, Worker → Settings →
   Variables and Secrets, add `ANTHROPIC_API_KEY` and `ASSISTANT_PASSWORD` as **Secrets**
   (or `npx wrangler secret put <NAME>`). Use an API key from a Console workspace with a
   low monthly spend limit. `ANTHROPIC_BASE_URL` optionally points the Worker at another
   endpoint.
3. **Deploy**: `npm run build && npx wrangler deploy`, or connect the repo in the dashboard
   (Workers & Pages → Create → Import a repository) with build command `npm run build` and
   deploy command `npx wrangler deploy`. The Worker's name must match `name` in
   `wrangler.jsonc`.

`public/_headers` turns on cross-origin isolation, which lets Stop and time limits
interrupt Python without reloading the interpreter, and caches `/pyodide/*` for good.

## Using sync

On one device: **Me → Sync → Turn on sync**. On another: **I have a code → Connect** with
that code, or **Link a device** to pair with a QR code. The code is the only credential,
so treat it like a password. Edits are pushed in the background; when two devices
disagree, the later save wins.

## Project layout

```
src/
  App.tsx, app/      the page shell and tab views
  styles/            Platform's tokens, the fonts, the base styles
  components/        one folder per area: line/, metro/, dojo/, me/, workspace/,
                     assistant/, layout/, shared/, and ui/ for shared primitives
  lib/engine/        the rules (XP, ranks, badges, streaks, quiz runs) as pure functions
  lib/sync/          the cloud sync client
  state/             the app store: reducer, actions, effect hooks
  types/             the shared types
  data/              the plans, quiz cards, templates, ranks and badges
  data/problems/     the problem bank: statements, tests, reference solutions
  runner/            the Python runner (Pyodide worker and test harness)
worker/              the Cloudflare Worker: sync and assistant endpoints
scripts/             data extraction, problem validation, regression checks
```

## Checks

`npm run build` typechecks the app. For refactors there are browser regression suites
(Playwright) and a differential test for the engine:

```bash
npm install --no-save playwright@1.56.1
scripts/regress/ws-check.sh   . 8810 ws-before     # workspace
scripts/regress/me-check.sh   . 8910 me-before     # Me tab and sync
scripts/regress/tabs-check.sh . 8970 tabs-before   # Line, Metro, Dojo, shell
# ...change the code, run again with an -after label, then:
python3 -I scripts/regress/ws-diff.py ws-before ws-after

node scripts/regress/engine-diff.mjs <git-ref>     # engine vs an earlier commit
```

Each run records scripted sessions and screenshots under `/tmp/yalc-regress/runs/`;
`ws-diff.py` reports any changed assertion or pixel. Two switches cover the themes:
`REGRESS_CONTRAST=more` runs every page in High contrast (give such a run its own label),
and `REGRESS_AUDIT=1` measures the contrast of all visible text at every screenshot and
records the misses in the run's `contrast.jsonl` (`REGRESS_AUDIT_AAA=1` holds text to 7:1,
the bar High contrast promises).

`REFACTOR.md` records the code cleanup and `FOLLOW-UPS.md` lists known issues and ideas.

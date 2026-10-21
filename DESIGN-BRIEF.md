# YALC redesign brief

This is a brief for Claude Design. Paste everything below the line and attach the three screenshot sheets of the current app: `yalc-now-desktop.png`, `yalc-now-phone.png` and `yalc-now-lines.png`. Round 1 asks for directions only. Round 2 starts once one is picked.

---

We're redesigning YALC, a browser-based interview-prep app. It works well and has a strong concept, but its look is borrowed: it reads as a Google Material clone with an AI-generated palette. We want a visual identity of our own, built on a color system that is simple and where every color means one thing. This round is exploration. Show us 2–3 directions, not the whole app.

The attached screenshots show the current app. Use them for structure and content only; the look is what we're replacing.

## What the app is

Interview prep for software engineers, laid out as a metro system. Each study plan is a **line**, each day or topic is a **station**, and the interview is the **terminus**. Every problem opens in a LeetCode-style workspace where the tests run on real Python in the browser. No account needed, and progress stays on the device unless you turn on sync.

There are three lines:

- **Onsite Express.** 24 stations, one per day, 115 problems, ending in timed mock interviews. Built around a Google onsite. The stations have transit names: Pathfinding, Backtrack Jct., Constraint St., Memo Bridge, Tabulation Sq., Grid Gardens, Interchange, Priority Yard, Window Seat, Midpoint Halt… Design District, Final Approach.
- **Day One Local.** The slow train: 13 stops through Seattle (Pike Place, Pioneer Square, Ballard Locks, Fremont… Mount Rainier), one idea per stop, Easy problems only, no timetable. Built around Amazon.
- **Engineering Works.** Seven systems built in steps: Checkout, Rate Limiter, Key-Value Store, Voice Stream, File System, Order Book, Diff & Merge. Each build has 3–4 steps, and each step opens on your code from the step before. Built around ElevenLabs and SIG.

The screens:

- **Line** (home). The chosen line as a vertical route with its stations. Each station card holds a short note, a "write from memory" ritual and its problems (check circle, title, difficulty, XP, open in the editor). Some stations carry mock-interview timers, and a terminus card ends the route. A line picker switches lines, and switching retints the app.
- **Workspace** (opens from any problem). Problem statement with Description and Solution tabs, an "In short" one-liner, tags, examples and a hint ladder (technique, key idea, steps, then the solution). Python editor, and a tests pane with Testcase and Result tabs and case chips. Run, Submit, a stopwatch, and Copy for Claude. On a Build, a step track (1–4) sits above the statement. On a phone the three panes become Problem / Code / Tests.
- **Metro.** A one-thumb quiz for the commute. A departures board lists the decks: Mix, Graphs, Backtracking, DP, Heaps & tries, and Redemption for missed cards. A run is 10 cards, and streaks multiply XP (×2 at 3, ×3 at 6). Card types: Pattern, Bug hunt, Missing line, Complexity.
- **Dojo.** 15 algorithm templates, blurred until you've written them from memory, plus the day's ritual.
- **Me.** Stats, the rank ladder (Wanderer, Pathfinder, Backtracker… Offer Letter), badges (called "hardware"), export and import, and cloud sync with QR device linking.
- **Bana** (optional, ⌘K in the workspace). An AI tutor chat that knows the problem and your code, with three personas: Normal, Tough love, and Goth catgirl. The catgirl has her own avatar art with mood faces; keep it.
- **Shell.** A header with rank, XP bar, streak and the current station, and bottom tabs on phones.

Audience: engineers a few weeks out from interviews, studying on a laptop in the evening and on a phone on the commute.

Voice: dry and confident, a little like a transit announcement ("The terminus isn't going anywhere — you are.", "No keyboard, no excuses."). Keep the existing copy and don't add marketing fluff.

## What's wrong today

- **It's Google's identity, not ours.** The palette is Google's four brand colors, the font stack asks for Google Sans and Roboto, the components are Material (pills, soft shadows, rounded cards), and the app icon is a four-color ring. The Amazon line copies AWS's palette (smile orange, squid ink), and Engineering Works uses the stock "AI violet".
- **Color means nothing.** The same four hues stand for line identity, station dots (which just cycle), Metro decks, quiz categories, rank steps, difficulty and pass/fail. A DP station can be red, yellow or green, while the DP deck is yellow.
- **Generated-UI habits.** Every tab has a "Light **Bold**" split heading, tiny uppercase monospace labels sit above everything, and there are dashed outline boxes, rainbow dots and confetti.
- **Desktop is a stretched phone.** It's a 720px column with a bottom tab bar on a 1440px screen.

## What to keep

- **The workspace's LeetCode structure.** The statement sits on the left, the editor over the tests on the right, Run and Submit top right, with Testcase/Result tabs and case chips. Someone coming from LeetCode should feel at home in five seconds. Differentiate it through identity, not layout. Places to do that: a header that reads like a platform sign (line bullet plus station), the Build step track, the verdicts, the editor theme, and the reading typography of the statement.
- **The metro concept.** Keep its vocabulary (line, station, stop, build, terminus, departures), the line bullets (a letter in a shape) and the route on the Line tab.
- **Phone-first ergonomics.** Metro works with one thumb, and touch targets are at least 44px.
- **Light and dark themes** of equal quality, following the OS.

## Direction: transit wayfinding, as a discipline rather than a costume

Borrow how real transit systems design signage and maps: the NYC subway's Unimark manual, London Underground, the Paris Métro, Tokyo Metro, Swiss railways. That means neutral surfaces, one color per line, bullets and route diagrams, strict type, and information first. Use it with restraint: a few signature elements (the route, the bullets, the share card) and everything else quiet. No departure-board flip animations, no ticket skeuomorphism inside the app, no train emoji.

One idea worth trying: in New York, local services use a circle bullet and express services a diamond. **Onsite Express** could get a diamond, **Day One Local** a circle, and **Engineering Works** a square in the colors of construction and planned-works signage (black on amber). Shape plus letter plus color means a line can be read without its color. The letters (G, A, E) came from the companies and can change.

## The color system (the most important part)

The rule in one sentence: **the app is a neutral station, the only color on screen is the line you're riding, and green and red only ever mean pass and fail.**

1. **Neutrals carry the interface.** Paper and ink in light mode, a true night (not blue-grey) in dark mode, two or three surface levels and hairline rules. No brand tint creeping into the greys.
2. **One color per line, used only for wayfinding.** It colors the line's bullet, its route, the current station, the selected tab, focus rings and the primary button (Submit, Board) while you're on that line. The route is one color; stations aren't colored individually. Each line color needs a fill, a text color that sits on that fill, a pale tint, and dark-mode equivalents of all three. Line colors can't be red or green (taken by status), violet, or any company's brand color. Leave room for two or three more lines later, the way a transit authority keeps a table of line colors.
3. **Status is pass and fail only.** That covers Accepted, Wrong Answer, Runtime Error and Time Limit verdicts, right and wrong quiz answers, and sync errors. Always pair the color with an icon or a word.
4. **Difficulty isn't a status.** Easy, Medium and Hard shouldn't reuse pass green and fail red. Try a neutral label with pips (●○○ ●●○ ●●●) or a change in weight.
5. **Everything else is neutral.** Metro decks are departures, not lines: letter bullets in ink, with the selected deck in the line's color. Quiz categories are words with icons. Ranks are a ladder in ink with your current rank in the line's color. Badges stay monochrome until earned. If rewards (XP gained, streaks) need a highlight, use one color and keep it for that alone.
6. **Code has its own palette.** A Python syntax theme built from the system, the same on every line, readable for hours in light and in dark.

Deliver it as a token table with role names (for example `surface`, `surface-raised`, `ink`, `ink-muted`, `rule`, `line-accent`, `line-on-accent`, `line-tint`, `pass`, `fail`), with light and dark values and contrast ratios. Text needs at least 4.5:1 and UI elements 3:1, and no meaning can be carried by color alone.

## Type, shape, layout, motion

- **Type.** UI text uses the system font stack, because the app loads nothing from other origins. Use at most one self-hosted typeface (open license, small woff2), and only if it earns its place in headings, numbers and bullets. A signage grotesk in the spirit of DIN, Highway Gothic or Johnston fits better than another Inter, Space Grotesk or Poppins. Monospace is for code and machine data (counts, timers, XP), not for every label.
- **Shape.** Flatter than now: hairlines over shadows, solid fills, one stroke weight for routes, circles only where they mean a station or a bullet, no dashed boxes.
- **Layout.** Desktop gets a real layout, for example a left nav with the route beside the open station. Phones keep bottom tabs.
- **Motion.** Rare and meaningful, like the "you are here" marker moving to the next station when you clear one. No confetti, and respect reduced-motion settings.

## Constraints

- It's a React app styled with plain CSS custom properties, so everything has to be expressible as CSS tokens and inline SVG. The wordmark, the bullets and the icons are SVG.
- It installs as a web app, so the icon has to work from 16px to 512px, including a maskable version.
- "YALC" is a working name and may change, so the identity shouldn't depend on those letters.
- Don't use Google, Amazon, ElevenLabs or SIG colors, logos or lookalikes. The companies are named in text only.

## Round 1: what to make now

Make 2–3 distinct directions within this brief. For each one:

1. A short rationale and its token table, in light and dark.
2. The three line bullets, the wordmark, and the app icon at 512px and at 32px.
3. The same three screens with real content:
   - **Line tab, phone, light.** Onsite Express, mid-journey: rank Pathfinder, 140 XP, "110 XP to Backtracker", a 3-day streak. Day 1 · Pathfinding is open: "Paths as first-class objects", the ritual "Write from memory: a DFS collecting all root-to-leaf paths" (+15 XP), then All Paths From Source to Target (Medium, done), Binary Tree Paths (Easy, done), Path Sum II (Medium) and Last Stone Weight (Easy, warm-up). Day 2 · Backtrack Jct. and Day 3 · Constraint St. sit closed below it.
   - **Workspace, desktop, dark.** "All Paths From Source to Target" after a failed run: Wrong Answer, 1 / 3 cases passed. The failing case has input `graph = [[1,2,3],[4],[1,4],[4],[]]`, output `[]` and expected `[[0,1,4],[0,2,1,4],[0,2,4],[0,3,4]]`.
   - **Metro card, phone.** Bug hunt, card 1 of 10: "Bellman-Ford capped at k stops, but answers use too many edges." Show its four-line loop, the right answer revealed ("Rounds share one array — relax off a frozen copy") and the explanation below it.

Don't design the rest yet.

## Round 2, after we pick a direction (for context only, don't start it)

- The design system: tokens, type scale, and components (buttons, tabs, chips, rows, cards, dialogs, toasts, the route).
- Every screen on phone and desktop, light and dark, including Bana's three persona skins.
- Distribution assets:
  - a first-run "pick your line" screen
  - a one-page landing page whose hero is the three lines drawn as a transit diagram with their real station names
  - share cards (station cleared, line complete, rank up) at 1200×630 and 1080×1350
  - Open Graph images
  - the web-app icon set
  - a GitHub social preview at 1280×640

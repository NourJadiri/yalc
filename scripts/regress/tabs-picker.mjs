// The line picker under the Line's hero (05): which lines it offers, what it says about each, what switching does
// to the page, to the open cards, to the scroll and to the saved blob, and how each line and the chosen one are drawn.

import { finish } from "./me-lib.mjs";
import { F, PF, edit, hdr, hdrModel, heroLine, rail, railModel, terminusCopy, TERMINUS, clearedOf, planOf, shape } from "./tabs-kit.mjs";
import { LPF } from "./tabs-line.mjs";

const picker = (page) =>
  page.locator(".lines").evaluate((g) => ({
    role: g.getAttribute("role"),
    label: g.getAttribute("aria-label"),
    picks: [...g.querySelectorAll(".linepick")].map((b) => ({
      role: b.getAttribute("role"),
      checked: b.getAttribute("aria-checked"),
      cls: b.className,
      track: b.dataset.track,
      bullet: b.querySelector(".lbullet").textContent,
      name: b.querySelector(".lname b").textContent,
      sub: b.querySelector(".lname span").textContent,
    })),
  }));

const pickerModel = (blob) => ({
  role: "radiogroup",
  label: "Choose a line",
  picks: [
    { track: "google", bullet: "G", name: "Onsite Express", company: "Google" },
    { track: "aws", bullet: "A", name: "Day One Local", company: "Amazon" },
    { track: "eng", bullet: "E", name: "Engineering Works", company: "ElevenLabs · SIG" },
  ].map((p) => ({
    role: "radio",
    checked: String(blob.track === p.track),
    cls: "linepick" + (blob.track === p.track ? " on" : ""),
    track: p.track,
    bullet: p.bullet,
    name: p.name,
    sub: `${p.company} · ${clearedOf(blob, p.track)}/${planOf(p.track).length}`,
  })),
});

const openStations = async (page) => (await rail(page)).filter((r) => r.cls.includes("open")).map((r) => r.eyebrow);
const pick = (page, track) => page.locator(`.linepick[data-track="${track}"]`);
const html = (page) => page.evaluate(() => document.documentElement.dataset.track);
/** How a pick is drawn: its edge, the outline that doubles it when chosen, its name's weight and its bullet. */
const look = (A, track) =>
  pick(A.page, track).evaluate((b) => {
    const c = getComputedStyle(b);
    const n = getComputedStyle(b.querySelector(".lname b"));
    const u = getComputedStyle(b.querySelector(".lbullet"));
    return {
      edge: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`,
      outline: c.outlineStyle === "none" ? "none" : `${c.outlineWidth} ${c.outlineStyle} ${c.outlineColor} ${c.outlineOffset}`,
      name: n.fontWeight,
      bullet: `${u.width} ${u.backgroundColor} ${u.color}`,
    };
  });
const C = LPF.light;

export default function register(scenario) {
  scenario("05-line-picker", "the line picker: the three lines and their numbers, switching, which stations open, scroll, saved track, accents, keyboard", async (s) => {
    const A = await s.device({ motion: true });
    await A.open();
    const page = A.page;
    let blob = F.fresh;

    // ---- the picker at rest
    await s.expect("the picker is a radio group named 'Choose a line' with the three lines: Onsite Express (G, Google), Day One Local (A, Amazon) and Engineering Works (E, ElevenLabs · SIG); the Google one is on", () => picker(page), pickerModel(blob));
    await s.expect("…in words: 'Google · 0/24', 'Amazon · 0/13' and 'ElevenLabs · SIG · 0/7' under the names", async () => (await picker(page)).picks.map((p) => `${p.bullet} ${p.name} / ${p.sub}`), ["G Onsite Express / Google · 0/24", "A Day One Local / Amazon · 0/13", "E Engineering Works / ElevenLabs · SIG · 0/7"]);
    await s.expect("the Google line is showing: data-track google, its hero and the first station open", async () => ({ track: await html(page), title: (await heroLine(page)).title, open: await openStations(page) }), { track: "google", title: "Onsite Express", open: ["Day 1 · Pathfinding"] });
    await s.expect("the pick being ridden has a doubled ink edge (its 2px border and a 2px outline inside it) and a bold name; an off pick has the 2px control-edge grey and a semibold name; each bullet is a 24px Platform bullet in its own line's colour (G line 2, A line 4) with the on-line letter", async () => ({
      on: await look(A, "google"),
      off: await look(A, "aws"),
      bulletType: await A.props(pick(page, "google").locator(".lbullet"), ["height", "font-weight", "font-size", "border-top-left-radius"]),
    }), {
      on: { edge: "2px solid " + C.ink, outline: `2px solid ${C.ink} -4px`, name: "700", bullet: `24px ${C.line2} ${C.onLine}` },
      off: { edge: "2px solid " + C.border, outline: "none", name: "600", bullet: `24px ${C.line4} ${C.onLine}` },
      bulletType: { height: "24px", "font-weight": "700", "font-size": "15px", "border-top-left-radius": "9999px" },
    });
    await s.pin("the on pick's tint and the off bullet's ground", { on: (await A.props(pick(page, "google"), ["background-color"]))["background-color"], off: (await A.props(pick(page, "aws").locator(".lbullet"), ["background-color"]))["background-color"] });
    await s.pin("a pick's geometry", { pick: await A.props(pick(page, "google"), ["padding-top", "padding-left", "border-top-left-radius", "gap", "display"]), rect: await A.rect(pick(page, "google")), group: await A.props(".lines", ["display", "gap", "margin-top", "flex-wrap"]) });
    await s.marked(A, "the picker", ".lines");
    await A.shot("picker", { locator: page.locator(".lines") });
    await A.setDark(true);
    await s.expect("Night: the bullets take Night's brighter line colours with the dark on-line letter, and the chosen pick's edge is Night's ink", async () => ({ bullet: await A.props(pick(page, "google").locator(".lbullet"), ["background-color", "color"]), edge: (await look(A, "google")).edge }), { bullet: { "background-color": LPF.dark.line2, color: LPF.dark.onLine }, edge: "2px solid " + LPF.dark.ink });
    await A.shot("picker", { locator: page.locator(".lines") });
    await A.setDark(false);

    // ---- switching to the Local
    await A.scrollTo(150);
    await pick(page, "aws").click();
    blob = edit(blob, (b) => { b.track = "aws"; });
    await s.expect("pressing the Local: data-track becomes aws, the hero, counts and rail are the Local's", async () => ({ track: await html(page), hero: await heroLine(page), rail: await rail(page), copy: await terminusCopy(page) }), {
      track: "aws",
      hero: { title: "Day One Local", bold: "Local", blurb: "The slow train to Amazon. Thirteen stops, one idea each, easy problems only — and no timetable. The Local waits for you.", stats: "0 / 55 problems · 0 / 13 stations cleared" },
      rail: railModel(blob, ["a1"]).days,
      copy: TERMINUS.aws.copy(0),
    });
    await s.expect("…the picker moved its 'on' to the Local", () => picker(page), pickerModel(blob));
    await s.expect("…the page went back to the top", () => A.scrollY(), 0);
    await s.expect("…the Local's first stop is open (its focus), the Google day that was open does not show here", () => openStations(page), ["Stop 1 · Pike Place"]);
    await s.expect("…the header is the Local's: Applicant, Stop 1 Pike Place, 40 XP to Online Assessment", () => hdr(page), { rank: "Applicant", bullet: "A", streak: "Streak 0/0", xp: "0", fill: "0%", where: "Stop 1 | Pike Place", next: "40 XP to Online Assessment" });
    await s.expect("…and the saved blob has only changed its track", async () => shape(await A.saved()), shape(blob));
    await A.resume();
    await s.expect("the Local's pick now has the doubled ink edge and the bold name; the Google pick is back to the grey edge, each bullet still in its own line's colour", async () => ({ on: await look(A, "aws"), off: await look(A, "google") }), {
      on: { edge: "2px solid " + C.ink, outline: `2px solid ${C.ink} -4px`, name: "700", bullet: `24px ${C.line4} ${C.onLine}` },
      off: { edge: "2px solid " + C.border, outline: "none", name: "600", bullet: `24px ${C.line2} ${C.onLine}` },
    });
    await s.expect("on the Local the current tab stays ink and the focus ring stays ink and signal yellow: switching lines changes only the line's own marks", async () => ({ tab: (await A.props(page.locator("nav.tabs .tab.on"), ["color"])).color, ring: await (async () => { await page.keyboard.press("Tab"); return (await A.props(page.locator(":focus"), ["box-shadow"]))["box-shadow"]; })() }), { tab: PF.light.ink, ring: PF.light.ring });
    await A.scrollTo(0);
    await A.shot("picker-local", { locator: page.locator(".lines") });
    await A.shot("local-top");
    await A.setDark(true);
    await A.shot("picker-local", { locator: page.locator(".lines") });
    await A.shot("local-top");
    await A.setDark(false);

    // ---- pressing the line that is already on does nothing, not even a scroll
    await A.scrollTo(150);
    await pick(page, "aws").click();
    await s.expect("pressing the Local while on the Local leaves the scroll where it was", () => A.scrollY(), 150);

    // ---- back to Google, and the cards that were open stay open
    await pick(page, "google").click();
    blob = edit(blob, (b) => { b.track = "google"; });
    await s.expect("back on Google: its hero, and day 1 (open before) still open, with no day added", async () => ({ track: await html(page), title: (await heroLine(page)).title, open: await openStations(page), rail: await rail(page) }), { track: "google", title: "Onsite Express", open: ["Day 1 · Pathfinding"], rail: railModel(blob, ["d1"]).days });
    await page.locator(".linewrap > .stn").nth(1).locator(".dayhead").click();
    await pick(page, "aws").click();
    await pick(page, "google").click();
    await s.expect("Google's open cards (days 1 and 2) are kept across a trip to the Local and back", () => openStations(page), ["Day 1 · Pathfinding", "Day 2 · Backtrack Jct."]);
    await A.pause();
    await A.advance(400);
    await s.expect("the saved track is google again", async () => (await A.blob()).track, "google");
    await A.resume();
    await pick(page, "aws").click();
    await A.pause();
    await A.advance(400);
    await A.reload();
    await s.expect("after a reload the app boots on the Local (the track is saved), its first stop open", async () => ({ track: await html(page), title: (await heroLine(page)).title, open: await openStations(page) }), { track: "aws", title: "Day One Local", open: ["Stop 1 · Pike Place"] });

    // ---- with progress on both lines
    const M = await s.device({ seed: F.awsMid, motion: true });
    await M.open();
    await s.expect("seeded on the Local: its counts under each name (Google 2/24 stations, Amazon 2/13), the Local on", () => picker(M.page), pickerModel(F.awsMid));
    await s.expect("…and 2/24, 2/13 spelled out, the Works still at 0/7", async () => (await picker(M.page)).picks.map((p) => p.sub), ["Google · 2/24", "Amazon · 2/13", "ElevenLabs · SIG · 0/7"]);
    await s.expect("it boots with the Local's focus stop (3) open", () => openStations(M.page), ["Stop 3 · Ballard Locks"]);
    await pick(M.page, "google").click();
    const toG = edit(F.awsMid, (b) => { b.track = "google"; });
    await s.expect("to Google: its focus day (3) opens beside the Local's stop that was open; this line shows day 3 open and the stop's id is not a day here", async () => ({ open: await openStations(M.page), rail: await rail(M.page), hdr: await hdr(M.page) }), { open: ["Day 3 · Constraint St."], rail: railModel(toG, ["a3", "d3"]).days, hdr: hdrModel(toG) });
    await pick(M.page, "aws").click();
    await s.expect("back to the Local: stop 3 once, not twice (a line whose focus is open is not given a second entry)", () => openStations(M.page), ["Stop 3 · Ballard Locks"]);
    await pick(M.page, "google").click();
    await s.expect("…and day 3 stays open once on Google", () => openStations(M.page), ["Day 3 · Constraint St."]);

    // ---- the keyboard
    const K = await s.device({ motion: true });
    await K.open();
    await K.page.keyboard.press("Tab");
    await s.expect("Tab from the top of the page lands on the Google pick, ringed with Platform's focus ring (ink hugging it, then signal yellow) outside its doubled ink edge", async () => ({ on: await K.page.evaluate(() => document.activeElement.dataset.track), visible: await K.page.evaluate(() => document.activeElement.matches(":focus-visible")), ring: await K.props(K.page.locator(":focus"), ["box-shadow", "outline-style", "outline-color", "outline-offset"]) }), { on: "google", visible: true, ring: { "box-shadow": PF.light.ring, "outline-style": "solid", "outline-color": C.ink, "outline-offset": "-4px" } });
    await K.page.keyboard.press("Tab");
    await K.page.keyboard.press("Enter");
    await s.expect("Tab then Enter on the Local pick switches to the Local; the same button keeps the focus ring, which the line never changes (ink and signal yellow), and now wears the doubled ink edge", async () => ({ track: await html(K.page), on: await K.page.evaluate(() => document.activeElement.dataset.track), ring: await K.props(K.page.locator(":focus"), ["box-shadow", "outline-color"]) }), { track: "aws", on: "aws", ring: { "box-shadow": PF.light.ring, "outline-color": C.ink } });
    finish(s);
  });
}

// The Line tab's structure (02): hero, the transit rail and its stations, day cards open and closed, problem rows
// and their links, the terminus, both lines. Checking, milestones and the picker are in tabs-check.mjs and
// tabs-picker.mjs; the mock clock in tabs-timer.mjs.

import { finish } from "./me-lib.mjs";
import { F, PF, heroLine, rail, railModel, rowsAt, rowsModel, ritualAt, terminusCopy, noHScroll, clearedOf, doneCount, totalOf, planOf } from "./tabs-kit.mjs";

export const RGB = { blue: "rgb(26, 115, 232)", red: "rgb(217, 48, 37)", yellow: "rgb(249, 171, 0)", green: "rgb(30, 142, 62)", ink: "rgb(32, 33, 36)", orange: "rgb(217, 105, 11)", teal: "rgb(11, 122, 135)", awsInk: "rgb(35, 47, 62)", rust: "rgb(182, 70, 31)", line: "rgb(218, 220, 224)", ink2: "rgb(95, 99, 104)" };

/* PF and the rest of Platform's colours the Line is drawn in: the sign (a checked box), the text on it, the clock's
   caution and stop. Day and Night, or High contrast for both under REGRESS_CONTRAST=more, as PF. */
const LDAY = { sign: "rgb(20, 20, 20)", onSign: "rgb(255, 255, 255)", caution: "rgb(125, 88, 0)", stop: "rgb(196, 18, 47)" };
const LNIGHT = { sign: "rgb(242, 242, 238)", onSign: "rgb(20, 20, 20)", caution: "rgb(255, 205, 0)", stop: "rgb(255, 107, 107)" };
const LCONTRAST = { sign: "rgb(255, 255, 255)", onSign: "rgb(0, 0, 0)", caution: "rgb(255, 205, 0)", stop: "rgb(255, 138, 128)" };
const HC = process.env.REGRESS_CONTRAST === "more";
export const LPF = { light: { ...PF.light, ...(HC ? LCONTRAST : LDAY) }, dark: { ...PF.dark, ...(HC ? LCONTRAST : LNIGHT) } };
const C = LPF.light;
const DASHED = (bg) => bg.startsWith("repeating-linear-gradient");

/** The hero's mark over the title: the line's bullet, where the logo dots were. */
const heroMark = (page) =>
  page.locator("main .hero > .gdots").evaluate((g) => {
    const b = getComputedStyle(g);
    return { cls: g.className, hidden: g.getAttribute("aria-hidden"), bullet: g.textContent, bg: b.backgroundColor, letter: b.color, size: b.width + " " + b.height, next: g.nextElementSibling.tagName };
  });

/** Every stop's mark but the current one's: "fill <colour>" for a cleared station, "ring <colour>" for the others. */
const stopMarks = (page) =>
  page.locator(".linewrap > .stn:not(.now) .stop").evaluateAll((els) => [...new Set(els.map((e) => { const c = getComputedStyle(e); return c.borderTopWidth === "0px" ? "fill " + c.backgroundColor : "ring " + c.borderTopColor; }))]);

export const dayHead = (page, pos) => page.locator(".linewrap > .stn").nth(pos).locator(".dayhead");
export const stn = (page, pos) => page.locator(".linewrap > .stn").nth(pos);

export default function register(scenario) {
  /* 2 ------------------------------------------------------------------ */
  scenario("02-line-rail", "the Line: hero, the rail and its stations, day cards open and closed, rows, links, the terminus, both lines", async (s) => {
    const A = await s.device({ seed: F.mid, motion: true });
    await A.open();
    const page = A.page;
    const blob = F.mid;
    const open = ["d3"];

    // ---- hero and stats
    await s.expect("the hero: 'Onsite Express', the Google line's blurb, and the counts of problems and stations", () => heroLine(page), {
      title: "Onsite Express",
      bold: "Express",
      blurb: "Two rounds between you and the terminus. Twenty-four stations, one line. Board anywhere.",
      stats: `${doneCount(blob)} / ${totalOf("google")} problems · ${clearedOf(blob)} / 24 stations cleared`,
    });
    await s.expect("…which for the seeded progress is 10 / 115 problems · 2 / 24 stations cleared", () => page.locator(".linestats").textContent(), "10 / 115 problems · 2 / 24 stations cleared");
    await s.expect("the line's G bullet stands over the title where the logo dots were: a 32px Platform bullet in line 2's blue with the on-line letter, hidden from screen readers (the title names the line)", () => heroMark(page), {
      cls: "bullet lg gdots", hidden: "true", bullet: "G", bg: C.line2, letter: C.onLine, size: "32px 32px", next: "H1",
    });

    // ---- the rail
    const model = railModel(blob, open);
    await s.expect("24 stations and the terminus, in order: ridden ones done, the focus day now, only the focus day open", () => rail(page), model.days);
    await s.expect("the stations by name: day 1 Pathfinding first, day 24 Final Approach last, then GOOGLE", async () => {
      const r = await rail(page);
      return [r[0].eyebrow, r[1].eyebrow, r[2].eyebrow, r[23].eyebrow, r[24].title];
    }, ["Day 1 · Pathfinding", "Day 2 · Backtrack Jct.", "Day 3 · Constraint St.", "Day 24 · Final Approach", "GOOGLE"]);
    await s.expect("stations have no colours of their own (no --seg): every stop but the current one is line 2's blue, filled when cleared, ringed when not", async () => ({ seg: [...new Set((await rail(page)).map((r) => r.seg))], stops: await stopMarks(page) }), { seg: [""], stops: ["fill " + C.line2, "ring " + C.line2] });
    await s.expect("every station card is on the page, open or not: 24 day bodies, 24 ritual rows, 115 problem rows", () => page.evaluate(() => ({ bodies: document.querySelectorAll(".daybody").length, rituals: document.querySelectorAll(".daybody .ritual").length, rows: document.querySelectorAll(".prow").length })), { bodies: 24, rituals: 24, rows: 115 });
    await s.expect("closed bodies are display:none, the open one is a block", () => page.locator(".daybody").evaluateAll((els) => els.map((e) => getComputedStyle(e).display).filter((d, i) => i === 2 || d !== "none")), ["block"]);
    await s.expect("the terminus card reads GOOGLE and counts the stations behind you", async () => ({ copy: await terminusCopy(page), title: (await rail(page))[24].title }), { copy: model.terminusCopy, title: "GOOGLE" });
    await s.expect("…2 of 24 stations behind you. The terminus isn't going anywhere — you are.", () => terminusCopy(page), "2 of 24 stations behind you. The terminus isn't going anywhere — you are.");

    // ---- the rail's drawing: Platform's Route, vertical; each station draws the stretch from its stop to the next one
    const after = (sel) => A.props(sel, ["content", "position", "top", "bottom", "width", "left", "height", "background-color", "background-image"], "::after");
    const first = await after(".linewrap > .stn:first-child .rail");
    const second = await after(".linewrap > .stn:nth-child(2) .rail");
    const bar = (p) => ({ content: p.content, pos: p.position, top: p.top, bottom: p.bottom, width: p.width, left: p.left, bg: p["background-color"] });
    await s.expect("a station's stretch of rail is a 6px line in line 2's blue, centred on the 28px rail, from its stop's centre (41px down, level with the middle of the card's eyebrow and title) to the next stop's; nothing is drawn above the first stop", async () => ({ first: bar(first), second: bar(second), above: (await A.props(".linewrap > .stn:first-child .rail", ["content"], "::before")).content }), {
      first: { content: '""', pos: "absolute", top: "41px", bottom: "-41px", width: "6px", left: "11px", bg: C.line2 },
      second: { content: '""', pos: "absolute", top: "41px", bottom: "-41px", width: "6px", left: "11px", bg: C.line2 },
      above: "none",
    });
    await s.expect("the line is solid up to the current station and dashed from it on, like a line still being built (days 1 and 2 solid; days 3, 4 and 24 dashed, in line 2's blue)", () => page.locator(".linewrap > .stn").evaluateAll((els) => [0, 1, 2, 3, 23].map((k) => { const c = getComputedStyle(els[k].querySelector(".rail"), "::after"); return c.backgroundImage === "none" ? "solid " + c.backgroundColor : (c.backgroundImage.startsWith("repeating-linear-gradient") ? "dashed " : "? ") + (c.backgroundImage.match(/rgba?\([^)]*\)/) ?? [""])[0]; })), ["solid " + C.line2, "solid " + C.line2, "dashed " + C.line2, "dashed " + C.line2, "dashed " + C.line2]);
    await s.expect("the rail ends at the terminus: a 30px stub past its stop, dashed while the line ahead is still being built, then the buffer, an 8px ink bar 32px across the track", async () => {
      const stub = await after(".terminus .rail");
      const buffer = await A.props(".terminus .rail", ["content", "position", "top", "left", "width", "height", "background-color", "border-top-left-radius"], "::before");
      return { stub: { top: stub.top, height: stub.height, dashed: DASHED(stub["background-image"]) }, buffer };
    }, {
      stub: { top: "41px", height: "30px", dashed: true },
      buffer: { content: '""', position: "absolute", top: "71px", left: "-2px", width: "32px", height: "8px", "background-color": C.ink, "border-top-left-radius": "2px" },
    });
    const stop = (sel) => A.props(sel, ["top", "width", "height", "border-top-width", "border-top-style", "border-top-color", "background-color", "border-top-left-radius", "z-index", "color"]);
    await s.expect("a cleared station's stop is a 20px disc filled with line 2's blue, its check in the colour for text on the line", async () => ({ stop: await stop(".linewrap > .stn:first-child .stop"), tick: (await rail(page))[0].tick }), {
      stop: { top: "31px", width: "20px", height: "20px", "border-top-width": "0px", "border-top-style": "solid", "border-top-color": C.line2, "background-color": C.line2, "border-top-left-radius": "9999px", "z-index": "1", color: C.onLine },
      tick: "check",
    });
    await s.expect("the current station is the large ink ring, 'you are here': 28px, a 7px ink ring round the raised ground, on the same centre", async () => {
      const p = await stop(".stn.now .stop");
      return { top: p.top, size: p.width + " " + p.height, ring: p["border-top-width"] + " " + p["border-top-color"], bg: p["background-color"] };
    }, { top: "27px", size: "28px 28px", ring: "7px " + C.ink, bg: C.raised });
    await s.pin("the focus station's halo", (await A.props(".stn.now .stop", ["box-shadow"]))["box-shadow"]);
    await s.expect("a station still to ride is a 20px stop ringed 6px (the line's weight) in line 2's blue round the raised ground, no halo", async () => {
      const p = await A.props(".linewrap > .stn:nth-child(5) .stop", ["width", "background-color", "box-shadow", "border-top-width", "border-top-color"]);
      return { size: p.width, bg: p["background-color"], shadow: p["box-shadow"], ring: p["border-top-width"] + " " + p["border-top-color"] };
    }, { size: "20px", bg: C.raised, shadow: "none", ring: "6px " + C.line2 });
    await s.expect("the terminus's stop is a plain stop on the line: ringed 6px in line 2's blue, no roundel and no gradient", async () => {
      const p = await A.props(".terminus .stop", ["width", "height", "border-top-width", "border-top-color", "background-image"]);
      return { w: p.width, h: p.height, ring: p["border-top-width"] + " " + p["border-top-color"], image: p["background-image"] };
    }, { w: "20px", h: "20px", ring: "6px " + C.line2, image: "none" });

    // ---- the day cards
    await s.expect("a day card: the eyebrow is the station, the title below it, a hairline of progress, a chevron", () => stn(page, 2).locator(".daycard").evaluate((c) => ({
      head: c.querySelector(".dayhead").tagName + "[aria-expanded=" + c.querySelector(".dayhead").getAttribute("aria-expanded") + "]",
      eyebrow: c.querySelector(".eyebrow").textContent,
      title: c.querySelector("h2").textContent,
      chev: window.__glyph(c.querySelector(".chev svg")),
      prog: c.querySelector(".dayprog i").style.width,
      note: c.querySelector(".daynote").textContent,
    })), { head: "BUTTON[aria-expanded=true]", eyebrow: "Day 3 · Constraint St.", title: "Backtracking under constraints", chev: "chevron-down", prog: "50%", note: "Same skeleton, harder pruning: palindrome checks, phone pads, and both diagonals." });
    await s.expect("the eyebrow is a 14px semibold label in ink-muted, in sentence case (no line colour as text); the title a 20px subheading, Bold on the current station and SemiBold on the others", async () => ({
      eyebrow: await A.props(stn(page, 2).locator(".eyebrow"), ["color", "text-transform", "font-size", "letter-spacing", "font-weight"]),
      title: await A.props(stn(page, 2).locator(".daycard h2"), ["font-size", "line-height", "font-weight", "color"]),
      other: (await A.props(stn(page, 3).locator(".daycard h2"), ["font-weight"]))["font-weight"],
    }), { eyebrow: { color: C.inkMuted, "text-transform": "none", "font-size": "14px", "letter-spacing": "0.14px", "font-weight": "600" }, title: { "font-size": "20px", "line-height": "28px", "font-weight": "700", color: C.ink }, other: "600" });
    await s.expect("a day card is Platform's Card without its band (the rail beside it is the line): the raised ground, a hairline rule edge, 8px corners", () => A.props(stn(page, 3).locator(".daycard"), ["background-color", "border-top-width", "border-top-style", "border-top-color", "border-top-left-radius", "box-shadow"]).then(async (p) => ({ ...p, band: (await A.props(stn(page, 3).locator(".daycard"), ["content"], "::before")).content })), {
      "background-color": C.raised, "border-top-width": "1px", "border-top-style": "solid", "border-top-color": C.rule, "border-top-left-radius": "8px", "box-shadow": "none", band: "none",
    });
    await s.expect("each card's progress is a thin Progress: a 6px sunk track travelled in line 2's blue, with a hairline edge once the day has started and quiet without it before: days 1 and 2 full, day 3 half, day 4 not started", () => page.locator(".dayprog").evaluateAll((els) => els.slice(0, 4).map((e) => ({ h: getComputedStyle(e).height, track: getComputedStyle(e).backgroundColor, edge: getComputedStyle(e).boxShadow, w: e.querySelector("i").style.width, c: getComputedStyle(e.querySelector("i")).backgroundColor }))), [
      { h: "6px", track: C.sunk, edge: `${C.border} 0px 0px 0px 1px inset`, w: "100%", c: C.line2 },
      { h: "6px", track: C.sunk, edge: `${C.border} 0px 0px 0px 1px inset`, w: "100%", c: C.line2 },
      { h: "6px", track: C.sunk, edge: `${C.border} 0px 0px 0px 1px inset`, w: "50%", c: C.line2 },
      { h: "6px", track: C.sunk, edge: "none", w: "0%", c: C.line2 },
    ]);
    await s.expect("the open card's chevron is turned over; a closed one's is not", async () => page.locator(".chev").evaluateAll((els) => [getComputedStyle(els[2]).transform, getComputedStyle(els[3]).transform]), ["matrix(-1, 0, 0, -1, 0, 0)", "none"]);

    // ---- rows
    await s.expect("the open day's rows: names, difficulty chips, xp, tags, the editor button", () => rowsAt(page, 2), rowsModel(blob, "d3"));
    await s.expect("…in words: two done (Letter Combinations, Palindrome Partitioning), N-Queens HARD +40 XP, Top K Frequent MED warm-up", async () => {
      const r = await rowsAt(page, 2);
      return r.map((x) => `${x.pressed === "true" ? "[x]" : "[ ]"} ${x.name} ${x.diff.split(":")[1]} ${x.xp}${x.tags.length ? " " + x.tags.join(",") : ""}`);
    }, ["[x] Letter Combinations of a Phone Number MED +20 XP", "[x] Palindrome Partitioning MED +20 XP", "[ ] N-Queens HARD +40 XP", "[ ] Top K Frequent Elements MED +20 XP tag:warm-up"]);
    const rowProps = (pos, k, sel, props) => A.props(stn(page, pos).locator(".prow").nth(k).locator(sel), props);
    await s.expect("a done row's check is Platform's checkbox: a 24px square box with 4px corners filled with the sign's ink, its check in on-sign; a pending one is the empty box, a 2px edge in the control-edge grey on the raised ground", async () => ({
      done: await rowProps(2, 0, ".pcheck", ["width", "height", "background-color", "border-top-color", "border-top-width", "border-top-left-radius", "color"]),
      pending: await rowProps(2, 2, ".pcheck", ["width", "height", "background-color", "border-top-color", "border-top-width", "border-top-left-radius", "color"]),
    }), {
      done: { width: "24px", height: "24px", "background-color": C.sign, "border-top-color": C.sign, "border-top-width": "2px", "border-top-left-radius": "4px", color: C.onSign },
      pending: { width: "24px", height: "24px", "background-color": C.raised, "border-top-color": C.border, "border-top-width": "2px", "border-top-left-radius": "4px", color: "rgba(0, 0, 0, 0)" },
    });
    await s.expect("a name is 16px body type: struck through (1px) in ink-muted once done, ink while pending", async () => ({
      done: await rowProps(2, 0, ".pname", ["color", "text-decoration-line", "text-decoration-thickness", "font-size", "font-weight"]),
      pending: await rowProps(2, 2, ".pname", ["color", "text-decoration-line", "font-size", "font-weight"]),
    }), {
      done: { color: C.inkMuted, "text-decoration-line": "line-through", "text-decoration-thickness": "1px", "font-size": "16px", "font-weight": "400" },
      pending: { color: C.ink, "text-decoration-line": "none", "font-size": "16px", "font-weight": "400" },
    });
    await s.expect("the difficulty chips: 13px caption chips in go (easy), caution (medium) and stop (hard), framed 2px in the same colour with 4px corners", () => page.locator(".prow .diff").evaluateAll((els) => {
      const seen = {};
      for (const e of els) {
        const cs = getComputedStyle(e);
        seen[e.textContent] ??= { color: cs.color, ring: cs.borderTopColor, size: cs.fontSize, weight: cs.fontWeight, tracking: cs.letterSpacing, ringWidth: cs.borderTopWidth, radius: cs.borderTopLeftRadius };
      }
      return seen;
    }), {
      EASY: { color: "rgb(0, 107, 97)", ring: "rgb(0, 107, 97)", size: "13px", weight: "500", tracking: "normal", ringWidth: "2px", radius: "4px" },
      MED: { color: "rgb(125, 88, 0)", ring: "rgb(125, 88, 0)", size: "13px", weight: "500", tracking: "normal", ringWidth: "2px", radius: "4px" },
      HARD: { color: "rgb(196, 18, 47)", ring: "rgb(196, 18, 47)", size: "13px", weight: "500", tracking: "normal", ringWidth: "2px", radius: "4px" },
    });
    await s.pin("a chip's tinted fill", (await A.props(page.locator(".prow .diff.M").first(), ["background-color"]))["background-color"]);
    await s.expect("tags and XP are captions: the warm-up tag a muted 13px chip in sentence case on the sunken ground with 4px corners, the XP 13px muted with tabular figures", async () => ({
      tag: await rowProps(2, 3, ".tag", ["font-size", "text-transform", "color", "letter-spacing", "background-color", "border-top-left-radius"]),
      xp: await rowProps(2, 3, ".xpv", ["font-size", "color", "font-variant-numeric"]),
    }), { tag: { "font-size": "13px", "text-transform": "none", color: "rgb(87, 86, 79)", "letter-spacing": "normal", "background-color": "rgb(229, 228, 222)", "border-top-left-radius": "4px" }, xp: { "font-size": "13px", color: "rgb(87, 86, 79)", "font-variant-numeric": "tabular-nums" } });
    await s.expect("the editor button is a 44px ghost icon button: 8px corners, no fill at rest, its code pictogram ink at 20px", async () => ({
      p: await rowProps(2, 2, ".golink", ["width", "height", "border-top-left-radius", "background-color", "color"]),
      glyph: await stn(page, 2).locator(".prow").nth(2).locator(".golink").evaluate((g) => window.__glyph(g.querySelector("svg")) + " " + g.querySelector("svg").getAttribute("width")),
    }), { p: { width: "44px", height: "44px", "border-top-left-radius": "8px", "background-color": "rgba(0, 0, 0, 0)", color: C.ink }, glyph: "code 20" });
    await s.pin("the editor button's tint", (await rowProps(2, 2, ".golink", ["background-color"]))["background-color"]);
    await s.expect("a station's ritual row sits above its problems: text, +15, an empty check box on the raised ground", () => ritualAt(page, 2), { cls: "ritual", pressed: "false", text: planOf("google")[2].ritual, xp: "+15", fill: C.raised, tick: "check" });
    await s.expect("the ritual row is a control of its own, the whole row the switch: a solid 2px edge in the control-edge grey, 8px corners, 44px tall at least, on the raised ground", () => A.props(stn(page, 2).locator(".ritual"), ["border-top-style", "border-top-width", "border-top-color", "border-top-left-radius", "min-height", "background-color"]), { "border-top-style": "solid", "border-top-width": "2px", "border-top-color": C.border, "border-top-left-radius": "8px", "min-height": "44px", "background-color": C.raised });

    // ---- the pictures
    await s.marked(A, "the line (the rail and every card)", ".linewrap");
    await s.marked(A, "the hero", "main .hero");
    await A.shot("line", { tall: true });
    await A.setDark(true);
    await A.shot("line", { tall: true });
    await A.setDark(false);

    // ---- opening and closing cards
    await dayHead(page, 3).click();
    open.push("d4");
    await s.expect("pressing a closed day opens it: aria-expanded flips, the station is .open, its body shows, its chevron turns", async () => {
      const r = (await rail(page))[3];
      return { cls: r.cls, expanded: r.expanded, display: (await A.props(stn(page, 3).locator(".daybody"), ["display"])).display, chev: (await A.props(stn(page, 3).locator(".chev"), ["transform"])).transform };
    }, { cls: "stn open", expanded: "true", display: "block", chev: "matrix(-1, 0, 0, -1, 0, 0)" });
    await s.expect("days are not an accordion: the focus day stays open beside it", async () => (await rail(page)).map((r) => r.expanded).slice(0, 5), ["false", "false", "true", "true", "false"]);
    await dayHead(page, 2).click();
    open.splice(open.indexOf("d3"), 1);
    await s.expect("pressing an open day closes it: aria-expanded false, the body hidden but still on the page, rows intact", async () => ({
      expanded: (await rail(page))[2].expanded,
      cls: (await rail(page))[2].cls,
      display: (await A.props(stn(page, 2).locator(".daybody"), ["display"])).display,
      rows: (await rowsAt(page, 2)).length,
    }), { expanded: "false", cls: "stn now", display: "none", rows: 4 });
    await dayHead(page, 2).click();
    open.push("d3");
    for (const pos of [0, 6, 10, 22]) {
      await dayHead(page, pos).click();
      open.push(planOf("google")[pos].id);
    }
    await s.expect("the rail with six cards open (days 4, 3, 1, 7, 11, 23) is still the model", async () => (await rail(page)).map((r) => r.cls), railModel(blob, open).days.map((r) => r.cls));
    await s.expect("day 1: the rows, with 'passed' on the two problems accepted in the editor and a warm-up tag on the last", () => rowsAt(page, 0), rowsModel(blob, "d1"));
    await s.expect("day 1's ritual is done (logged on the 1st): its check box filled with the sign's ink", () => ritualAt(page, 0), { cls: "ritual done", pressed: "true", text: planOf("google")[0].ritual, xp: "+15", fill: C.sign, tick: "check" });
    await s.expect("day 7: the timed mock row has a 30 XP award and leaves the app (a link, not the editor)", async () => (await rowsAt(page, 6)).at(-1), rowsModel(blob, "d7").at(-1));
    await s.expect("…its link is the repo's address, in a new tab, noopener, with the external pictogram (it leaves the app)", async () => (await rowsAt(page, 6)).at(-1).link, { tag: "A", cls: "golink", label: "Open Timed mock — random Google-tagged medium", title: null, href: "https://github.com/liquidslr/leetcode-company-wise-problems", target: "_blank", rel: "noopener", glyph: "external" });
    await s.expect("day 7: the other rows are in-app, and one mock clock is mounted in the card", async () => ({ rows: await rowsAt(page, 6), timers: await stn(page, 6).locator(".timer").count() }), { rows: rowsModel(blob, "d7"), timers: 1 });
    await s.expect("day 11: Walls and Gates is a premium drill (tag 'premium', still the editor), Combination Sum a warm-up", () => rowsAt(page, 10), rowsModel(blob, "d11"));
    await s.expect("day 23: a premium drill, an original one (tag 'original') and a warm-up", () => rowsAt(page, 22), rowsModel(blob, "d23"));
    await s.expect("every station with a mock has a clock: days 7, 18, 22 and 24, none elsewhere", () => page.locator(".linewrap > .stn").evaluateAll((els) => els.map((e, i) => (e.querySelector(".timer") ? i + 1 : 0)).filter(Boolean)), [7, 18, 22, 24]);
    await s.expect("every row but the four mocks opens the editor: 111 code buttons, 4 external links", () => page.evaluate(() => ({ code: document.querySelectorAll(".prow button.golink.code").length, ext: document.querySelectorAll(".prow a.golink").length })), { code: 111, ext: 4 });

    // ---- open state survives a trip to another tab
    await A.tab("Metro");
    await A.tab("Line");
    await s.expect("after Metro and back, the same cards are open", async () => (await rail(page)).map((r, i) => (r.expanded === "true" ? planOf("google")[i].id : null)).filter(Boolean), ["d1", "d3", "d4", "d7", "d11", "d23"]);

    // ---- the ways out of a row: an external link, and the editor
    await A.ctx.route("https://github.com/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>stub</title>" }));
    const [popup] = await Promise.all([A.ctx.waitForEvent("page"), stn(page, 6).locator("a.golink").click()]);
    await s.expect("the mock's link opens the repo in a new tab", () => popup.url(), "https://github.com/liquidslr/leetcode-company-wise-problems");
    await popup.close();
    await s.expect("…leaving this page as it was: still the Line, nothing checked, no toast", async () => ({ toasts: await A.toastLog(), mock: (await A.saved()).tracks.google.done.mock ?? null, work: await page.locator(".ws").count() }), { toasts: [], mock: null, work: 0 });
    await A.resume();
    await stn(page, 0).locator(".prow").nth(0).locator("button.golink").click();
    await s.expect("the editor button opens the workspace over the line, for that problem", () => page.locator('.ws[role="dialog"]').getAttribute("aria-label"), "All Paths From Source to Target");
    await s.expect("…and nothing was toggled by going there (the row stays done)", async () => ({ pressed: (await rowsAt(page, 0))[0].pressed, hash: await page.evaluate(() => location.hash), body: await page.evaluate(() => document.body.style.overflow) }), { pressed: "true", hash: "", body: "hidden" });
    await page.getByRole("button", { name: "Back to the line" }).click();
    await s.expect("Back to the line closes it: the page behind is as it was", async () => ({ ws: await page.locator(".ws").count(), body: await page.evaluate(() => document.body.style.overflow), h1: (await heroLine(page)).title }), { ws: 0, body: "", h1: "Onsite Express" });

    // ---- the Local
    const L = await s.device({ seed: F.awsMid, motion: true });
    await L.open();
    const lp = L.page;
    const lb = F.awsMid;
    await s.expect("the Local's hero: its name, blurb and counts (the Google line's progress is not counted here)", () => heroLine(lp), {
      title: "Day One Local",
      bold: "Local",
      blurb: "The slow train to Amazon. Thirteen stops, one idea each, easy problems only — and no timetable. The Local waits for you.",
      stats: `${doneCount(lb)} / ${totalOf("aws")} problems · ${clearedOf(lb)} / 13 stations cleared`,
    });
    await s.expect("…11 / 55 problems · 2 / 13 stations cleared", () => lp.locator(".linestats").textContent(), "11 / 55 problems · 2 / 13 stations cleared");
    await s.expect("the Local's rail: thirteen stops and the terminus, the focus stop open", () => rail(lp), railModel(lb, ["a3"]).days);
    await s.expect("…its terminus is DAY ONE and counts stops, not stations", async () => ({ title: (await rail(lp))[13].title, copy: await terminusCopy(lp) }), { title: "DAY ONE", copy: "2 of 13 stops behind you. There's no timetable on the Local — ride when you can." });
    await s.expect("the stops' eyebrows say Stop, not Day", async () => (await rail(lp)).slice(0, 3).map((r) => r.eyebrow), ["Stop 1 · Pike Place", "Stop 2 · Pioneer Square", "Stop 3 · Ballard Locks"]);
    await s.expect("the Local has no morning rituals and no mock clocks, and its rows carry one 'passed' tag and no others", () => lp.evaluate(() => ({ rituals: document.querySelectorAll(".ritual").length, timers: document.querySelectorAll(".timer").length, tags: [...document.querySelectorAll(".prow .tag")].map((t) => t.textContent) })), { rituals: 0, timers: 0, tags: ["passed"] });
    await s.expect("stop 3's rows: easy only, +10 XP each, the editor for all, and 'passed' on the one accepted", () => rowsAt(lp, 2), rowsModel(lb, "a3"));
    await dayHead(lp, 0).click();
    await s.expect("stop 1's rows: all four done", () => rowsAt(lp, 0), rowsModel(lb, "a1"));
    await s.expect("every row of the Local opens the editor (55), none leaves the app", () => lp.evaluate(() => ({ code: document.querySelectorAll(".prow button.golink.code").length, ext: document.querySelectorAll(".prow a.golink").length })), { code: 55, ext: 0 });
    await s.expect("the Local's line is line 4's orange: its stretches of rail, and its terminus's stop ringed in it; the buffer stays ink", async () => ({
      rail: (await L.props(".linewrap > .stn:first-child .rail", ["background-color"], "::after"))["background-color"],
      terminus: await L.props(".terminus .stop", ["border-top-color", "background-image"]),
      buffer: (await L.props(".terminus .rail", ["background-color"], "::before"))["background-color"],
    }), { rail: C.line4, terminus: { "border-top-color": C.line4, "background-image": "none" }, buffer: C.ink });
    await s.expect("the Local's stations have no colours of their own either: every stop but the current one is line 4's orange, filled when cleared, ringed when not", async () => ({ seg: [...new Set((await rail(lp)).map((r) => r.seg))], stops: await stopMarks(lp) }), { seg: [""], stops: ["fill " + C.line4, "ring " + C.line4] });
    await s.expect("the Local's hero bullet is its A, in line 4's orange", () => heroMark(lp), { cls: "bullet lg gdots", hidden: "true", bullet: "A", bg: C.line4, letter: C.onLine, size: "32px 32px", next: "H1" });
    await s.expect("nothing overflows the width of the window", () => noHScroll(lp), true);
    await dayHead(lp, 0).click();
    await s.marked(L, "the Local's line", ".linewrap");
    await L.shot("line-local", { tall: true });
    await L.setDark(true);
    await s.expect("in Night the Local's hero bullet is Night's brighter orange, with the on-line letter", async () => { const m = await heroMark(lp); return { bg: m.bg, letter: m.letter }; }, { bg: LPF.dark.line4, letter: LPF.dark.onLine });
    await L.shot("line-local", { tall: true });
    finish(s);
  });
}

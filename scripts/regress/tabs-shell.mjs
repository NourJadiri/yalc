// The app shell: the header (the line's bullet, rank, streak, XP and the XP line), the tab bar, what a tab press does,
// the line that tints the line's own marks (data-track), and the first rungs of the stacking order.

import { finish } from "./me-lib.mjs";
import { F, SECTIONS, H1, GLYPH_OF_TAB, PF, hdr, hdrModel, tabBar, view, noHScroll, rankModel } from "./tabs-kit.mjs";

/* Each line's colour, per palette: Onsite Express is Platform's line 2, Day One Local line 4. */
const LINE = { google: { light: PF.light.line2, dark: PF.dark.line2 }, aws: { light: PF.light.line4, dark: PF.dark.line4 } };

/* The line's own marks, as the header draws them: the bullet, the travelled part of the XP line and its stop. */
const lineMarks = async (D) => ({
  bullet: await D.props(".rank-bullet", ["background-color", "color"]),
  fill: await D.props(".xp-fill", ["background-color", "background-image"]),
  stop: (await D.props(".xp-fill", ["border-top-color"], "::after"))["border-top-color"],
});
const marksIn = (line, theme) => ({ bullet: { "background-color": line, color: PF[theme].onLine }, fill: { "background-color": line, "background-image": "none" }, stop: line });

/* Where the XP line's stop sits: its centre as a share of the track inset by half a stop at each end, and whether it
   stays inside the track and on the end of the travelled part. */
const stopAt = (page) =>
  page.locator("header.hdr .xp-track").evaluate((t) => {
    const f = t.querySelector(".xp-fill");
    const tr = t.getBoundingClientRect();
    const fr = f.getBoundingClientRect();
    const half = parseFloat(getComputedStyle(f, "::after").width) / 2;
    const stopX = fr.right;
    return { share: Math.round(((stopX - tr.left - half) / (tr.width - 2 * half)) * 100), inside: stopX - half >= tr.left - 0.5 && stopX + half <= tr.right + 0.5, from: Math.round(fr.left - tr.left) };
  });

const tabsExpected = (current) => ({
  label: "Sections",
  tabs: SECTIONS.map((t) => ({ text: t, cls: t === current ? "tab on" : "tab", current: t === current ? "page" : null, glyph: GLYPH_OF_TAB[t], size: "24" })),
});

export default function register(scenario) {
  scenario("01-shell", "the shell: header, tab bar, navigation, scroll reset, stacking, per-line marks", async (s) => {
    const A = await s.device({ seed: F.mid, motion: true });
    await A.open();
    const page = A.page;
    const tabBtn = (label) => page.locator("nav.tabs").getByRole("button", { name: label, exact: true });
    const MID = { rank: "Pathfinder", bullet: "G", streak: "Streak 2/2", xp: "200", fill: "67%", where: "Day 3 | Constraint St.", next: "50 XP to Backtracker" };

    // ---- the tab bar
    await s.expect("the page is titled", () => page.title(), "YALC — Yet Another LeetCode Clone");
    await s.expect("the tab bar is the nav named Sections: Line, Metro, Dojo, Me with a route, train, code and chart pictogram at 24px; Line is current", () => tabBar(page), tabsExpected("Line"));
    await s.expect("the tab bar is the raised ground with a hairline rule along its top; each tab a 14px semibold label under its pictogram, at least 44px tall; the current one bold", async () => ({
      bar: await A.props("nav.tabs", ["background-color", "border-top-width", "border-top-style", "border-top-color"]),
      tab: await A.props(tabBtn("Metro"), ["font-size", "font-weight", "line-height", "flex-direction"]),
      tall: (await A.rect(tabBtn("Metro"))).h >= 44,
      current: (await A.props(tabBtn("Line"), ["font-weight"]))["font-weight"],
    }), { bar: { "background-color": PF.light.raised, "border-top-width": "1px", "border-top-style": "solid", "border-top-color": PF.light.rule }, tab: { "font-size": "14px", "font-weight": "600", "line-height": "20px", "flex-direction": "column" }, tall: true, current: "700" });
    await s.expect("one view is mounted (the Line's), headed Onsite Express", () => view(page), { views: 1, h1: H1.Line, on: "view on" });
    await s.expect("the header, from the seeded progress: Pathfinder beside the line's G bullet, 200 XP, streak 2, the XP line 67% of the way to Backtracker, Day 3 Constraint St.", () => hdr(page), MID);
    await s.expect("…which is what the saved blob says (the header model)", () => hdr(page), hdrModel(F.mid));
    await s.expect("the Line has not been told it is the Local: data-track on <html> is google", () => page.evaluate(() => document.documentElement.dataset.track), "google");
    await s.expect("the streak is announced as 'Streak 2' and the XP reads 'XP 200'", () => page.locator("header.hdr .hdr-stats").evaluate((e) => ({ aria: e.children[0].getAttribute("aria-label"), xp: e.children[1].textContent, flame: window.__glyph(e.querySelector("svg")) })), { aria: "Streak 2", xp: "XP 200", flame: "flame" });
    await s.expect("the streak and the XP each read as a 16px pictogram, a word and a number: 14px semibold in tabular figures, the words ink-muted, the numbers bold ink", () => page.locator("header.hdr .hdr-stats").evaluate((e) => ({
      parts: [...e.children].map((c) => ({ picto: c.querySelector("svg")?.getAttribute("width") ?? null, text: c.textContent, number: c.querySelector("b").textContent })),
      type: ["font-size", "font-weight", "font-variant-numeric", "color"].map((k) => getComputedStyle(e).getPropertyValue(k)),
      number: ["font-weight", "color"].map((k) => getComputedStyle(e.querySelector("b")).getPropertyValue(k)),
    })), { parts: [{ picto: "16", text: "Streak 2", number: "2" }, { picto: "16", text: "XP 200", number: "200" }], type: ["14px", "600", "tabular-nums", PF.light.inkMuted], number: ["700", PF.light.ink] });
    await s.expect("the sub-line is the station on the left (with a dot between Day and name) and the next rank on the right", () => page.locator("header.hdr .xp-sub").evaluate((e) => ({ kids: [...e.children].map((c) => c.tagName + (c.className ? "." + c.className : "")), dotHidden: e.querySelector(".xp-dot").getAttribute("aria-hidden") })), { kids: ["SPAN.xp-day", "SPAN"], dotHidden: "true" });
    await s.expect("the XP line is Platform's Progress: in a 20px track, the travelled part a 6px line in the line's blue, no gradient, ending in a 20px stop ringed 5px in the same blue; the rest a 6px sunk rail with a hairline edge", async () => ({
      track: (await A.props(".xp-track", ["height"])).height,
      rail: await A.props(".xp-track", ["height", "background-color", "border-top-width", "border-top-color"], "::before"),
      fill: await A.props(".xp-fill", ["height", "background-color", "background-image"]),
      stop: await A.props(".xp-fill", ["width", "height", "border-top-width", "border-top-color", "background-color", "border-top-left-radius"], "::after"),
    }), {
      track: "20px",
      rail: { height: "6px", "background-color": PF.light.sunk, "border-top-width": "1px", "border-top-color": PF.light.border },
      fill: { height: "6px", "background-color": LINE.google.light, "background-image": "none" },
      stop: { width: "20px", height: "20px", "border-top-width": "5px", "border-top-color": LINE.google.light, "background-color": PF.light.raised, "border-top-left-radius": "9999px" },
    });
    await s.expect("…the travelled part starts at the track's left edge and the stop sits on its end, 67% of the way along, inside the track", () => stopAt(page), { share: 67, inside: true, from: 0 });

    // ---- stacking and position of the two bars
    const hp = await A.props("header.hdr", ["position", "z-index", "top"]);
    const tp = await A.props("nav.tabs", ["position", "z-index", "bottom", "display"]);
    await s.expect("the header is sticky at the top at level 30; the tab bar is fixed to the bottom at level 40", async () => ({ hdr: hp, tabs: tp }), { hdr: { position: "sticky", "z-index": "30", top: "0px" }, tabs: { position: "fixed", "z-index": "40", bottom: "0px", display: "flex" } });
    await s.pin("the tab bar's ground, rule and padding", await A.props("nav.tabs", ["backdrop-filter", "background-color", "border-top-width", "padding-top", "padding-bottom", "padding-left"]));
    await A.scrollTo(900);
    await s.expect("scrolled 900px down the line the header still sits at the top edge and the tab bar at the bottom edge", async () => ({ hdr: (await A.rect("header.hdr")).y, tabs: (await A.rect("nav.tabs")).y + (await A.rect("nav.tabs")).h, scrolled: (await A.scrollY()) > 800 }), { hdr: 0, tabs: 860, scrolled: true });
    await s.expect("the four tabs share the width equally", async () => (await page.locator("nav.tabs .tab").evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().width * 10) / 10))])).length, 1);

    // ---- a tab press: the view, the current tab, the scroll
    for (const label of ["Dojo", "Me", "Metro", "Line"]) {
      await A.scrollTo(400);
      await A.tab(label);
      await s.expect(`pressing ${label}: it becomes current, the view is ${label}'s, the header is as it was`, async () => ({ bar: await tabBar(page), view: await view(page), hdr: await hdr(page) }), { bar: tabsExpected(label), view: { views: 1, h1: H1[label], on: "view on" }, hdr: MID });
    }
    await A.tab("Line");
    await A.scrollTo(700);
    await s.expect("the Line is 700px down...", () => A.scrollY(), 700);
    await A.tab("Dojo");
    await s.expect("...Dojo: back at the top", () => A.scrollY(), 0);
    await A.scrollTo(300);
    await A.tab("Me");
    await s.expect("...Me: back at the top", () => A.scrollY(), 0);
    await A.scrollTo(300);
    await A.tab("Line");
    await s.expect("...Line: back at the top", () => A.scrollY(), 0);
    await A.scrollTo(500);
    await A.tab("Line");
    await s.expect("pressing the tab you are on scrolls to the top too", () => A.scrollY(), 0);

    // ---- the pointer
    await tabBtn("Metro").hover();
    const ink = (await A.props(".hdr-stats b", ["color"])).color;
    await s.expect("hovering an inactive tab turns its label to ink", async () => (await A.props(tabBtn("Metro"), ["color"])).color, ink);
    await s.expect("…and fills it with the sunk ground, square under the rule and with 4px corners at the bottom", async () => A.props(tabBtn("Metro"), ["background-color", "border-top-left-radius", "border-bottom-left-radius"]), { "background-color": PF.light.sunk, "border-top-left-radius": "0px", "border-bottom-left-radius": "4px" });
    await s.pin("the hovered tab's fill", await A.props(tabBtn("Metro"), ["background-color", "color", "border-bottom-left-radius", "transition-duration"]));
    await tabBtn("Line").hover();
    await s.expect("hovering the current tab leaves it ink and unfilled", async () => A.props(tabBtn("Line"), ["color", "background-color"]), { color: PF.light.ink, "background-color": "rgba(0, 0, 0, 0)" });
    await s.pin("the current tab's bar", await A.props(tabBtn("Line"), ["background-color", "height", "top", "left", "right", "transition-duration"], "::before"));
    await s.pin("a tab's own geometry", { tab: await A.props(tabBtn("Line"), ["font-size", "font-weight", "letter-spacing", "gap", "padding-top", "border-top-left-radius", "transition-duration", "flex-grow"]), rect: await A.rect(tabBtn("Line")) });
    await page.mouse.move(640, 3);

    // ---- the keyboard
    await tabBtn("Line").click();
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    await s.expect("Tab from the Line tab three times lands on Me and shows a focus ring", () => page.evaluate(() => ({ label: document.activeElement.textContent.trim(), visible: document.activeElement.matches(":focus-visible") })), { label: "Me", visible: true });
    await s.expect("the ring is Platform's focus ring: 2px of ink hugging the tab, then 3px of signal yellow (a transparent 2px outline stands in for forced colours), following the tab's square top and 4px bottom corners", async () => A.props(tabBtn("Me"), ["outline-style", "outline-width", "outline-color", "box-shadow", "border-top-left-radius", "border-bottom-left-radius"]), { "outline-style": "solid", "outline-width": "2px", "outline-color": "rgba(0, 0, 0, 0)", "box-shadow": PF.light.ring, "border-top-left-radius": "0px", "border-bottom-left-radius": "4px" });
    await s.expect("…and all of the ring shows: the tab bar keeps 8px under its tabs, so the window's bottom edge never cuts it off", async () => { const r = await A.rect(tabBtn("Me")); return 860 - (r.y + r.h); }, 8);
    await page.keyboard.press("Enter");
    await s.expect("Enter on the focused tab opens it", async () => ({ view: await view(page), bar: (await tabBar(page)).tabs.map((t) => t.current) }), { view: { views: 1, h1: H1.Me, on: "view on" }, bar: [null, null, null, "page"] });
    await A.tab("Line");

    // ---- the accent and the pictures
    await s.expect("the current tab is ink with a 6px ink bar lying on the top rule; the line's blue (line 2) is for its own marks: the header's bullet, the XP line and its stop", async () => ({ tab: (await A.props(tabBtn("Line"), ["color"])).color, bar: await A.props(tabBtn("Line"), ["background-color", "height", "top"], "::before"), marks: await lineMarks(A) }), { tab: PF.light.ink, bar: { "background-color": PF.light.ink, height: "6px", top: "-1px" }, marks: marksIn(LINE.google.light, "light") });
    await s.expect("nothing overflows the width of the window", () => noHScroll(page), true);
    await s.marked(A, "the header", "header.hdr");
    await s.marked(A, "the tab bar", "nav.tabs");
    await A.shot("shell");
    await A.shot("header", { locator: page.locator("header.hdr") });
    await A.shot("tabbar", { locator: page.locator("nav.tabs") });
    await A.setDark(true);
    await s.expect("in Night the current tab and its bar are Night's ink, and the line's marks Night's brighter blue with dark text on the bullet", async () => ({ tab: (await A.props(tabBtn("Line"), ["color"])).color, bar: (await A.props(tabBtn("Line"), ["background-color"], "::before"))["background-color"], marks: await lineMarks(A) }), { tab: PF.dark.ink, bar: PF.dark.ink, marks: marksIn(LINE.google.dark, "dark") });
    await A.shot("shell");
    await A.shot("header", { locator: page.locator("header.hdr") });
    await A.shot("tabbar", { locator: page.locator("nav.tabs") });

    // ---- the other line tints the whole app
    const L = await s.device({ seed: F.awsMid, motion: true });
    await L.open();
    const lp = L.page;
    const lbtn = (label) => lp.locator("nav.tabs").getByRole("button", { name: label, exact: true });
    const lm = hdrModel(F.awsMid);
    await s.expect("riding the Local at boot: data-track is aws", () => lp.evaluate(() => document.documentElement.dataset.track), "aws");
    await s.expect("the Local's header: its own ladder (Phone Screen at 110 XP), stops not days", () => hdr(lp), lm);
    await s.expect("…spelled out: Phone Screen beside the Local's A bullet, 'Stop 3 | Ballard Locks', and the XP to the next rank", () => hdr(lp), { rank: "Phone Screen", bullet: "A", streak: "Streak 2/2", xp: String(F.awsMid.tracks.aws.xp), fill: rankModel("aws", F.awsMid.tracks.aws.xp).pct + "%", where: "Stop 3 | Ballard Locks", next: rankModel("aws", F.awsMid.tracks.aws.xp).next });
    await s.expect("on the Local the current tab is still ink: the line's orange (line 4) is for the bullet, the XP line and its stop", async () => ({ tab: (await L.props(lbtn("Line"), ["color"])).color, marks: await lineMarks(L) }), { tab: PF.light.ink, marks: marksIn(LINE.aws.light, "light") });
    await s.expect("the Local's XP line is one colour, line 4's orange, with no gradient and no blue in it", async () => L.props(".xp-fill", ["background-color", "background-image"]), { "background-color": LINE.aws.light, "background-image": "none" });
    await s.expect("the Local's focus ring is the Express's ink and signal ring: switching lines never touches the focus ring", async () => {
      await lbtn("Line").click();
      for (let i = 0; i < 3; i++) await lp.keyboard.press("Tab");
      return (await L.props(lbtn("Me"), ["box-shadow"]))["box-shadow"];
    }, PF.light.ring);
    await L.page.mouse.move(640, 3);
    await L.shot("shell-local");
    await L.setDark(true);
    await s.expect("in Night the Local's current tab is Night's ink and its marks Night's brighter orange", async () => ({ tab: (await L.props(lbtn("Line"), ["color"])).color, marks: await lineMarks(L) }), { tab: PF.dark.ink, marks: marksIn(LINE.aws.dark, "dark") });
    await s.expect("…and in Night the XP line is still one colour, with no gradient", async () => L.props(".xp-fill", ["background-color", "background-image"]), { "background-color": LINE.aws.dark, "background-image": "none" });
    await L.shot("shell-local");

    // ---- a fresh profile
    const N = await s.device({});
    await N.open();
    await s.expect("a fresh profile: Wanderer beside the G bullet, streak 0, XP 0, the XP line empty, Day 1 Pathfinding, 100 XP to Pathfinder", () => hdr(N.page), { rank: "Wanderer", bullet: "G", streak: "Streak 0/0", xp: "0", fill: "0%", where: "Day 1 | Pathfinding", next: "100 XP to Pathfinder" });
    await s.expect("with no XP the stop waits at the very start of the line, inside the track", () => stopAt(N.page), { share: 0, inside: true, from: 0 });
    await s.expect("a fresh profile has saved nothing yet", () => N.blob(), null);

    // ---- the editor arrives lazily: a bare, busy cover until its code is in
    const W = await s.device({ seed: F.mid, motion: true });
    let release;
    const gate = new Promise((r) => (release = r));
    await W.ctx.route(/\/assets\/Workspace-[^/]*\.js$/, async (route) => {
      await gate;
      await route.fallback();
    });
    await W.open();
    await W.page.locator(".linewrap > .stn").nth(2).locator("button.golink").first().click();
    await s.expect("pressing an editor button while the editor's code is still on the way puts a cover over the whole window: .ws-boot, aria-busy, nothing in it", () => W.page.locator(".ws-boot").evaluate((e) => ({ busy: e.getAttribute("aria-busy"), kids: e.children.length, text: e.textContent })), { busy: "true", kids: 0, text: "" });
    await s.expect("…it is fixed to all four edges at level 50 in the page colour, over the header (30) and the tab bar (40); the workspace itself has not appeared", async () => ({ p: await W.props(".ws-boot", ["position", "inset", "z-index", "background-color"]), ws: await W.page.locator(".ws").count(), covers: await W.page.evaluate(() => [document.elementFromPoint(640, 20), document.elementFromPoint(300, 840)].map((e) => e.classList.contains("ws-boot"))) }), { p: { position: "fixed", inset: "0px", "z-index": "50", "background-color": PF.light.surface }, ws: 0, covers: [true, true] });
    await W.shot("workspace-boot");
    release();
    await s.expect("once the code is in the cover goes and the workspace takes its place", async () => ({ boot: await W.page.locator(".ws-boot").count(), ws: await W.page.locator('.ws[role="dialog"]').count() }), { boot: 0, ws: 1 });
    finish(s);
  });
}

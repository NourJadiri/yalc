// The celebrations (12): toast stacking and the exact moments they leave (3 s; the CSS fade starts at 2.5 s), confetti
// pieces and their removal (2.8 s), the ids the store stamps, reduced motion (toasts yes, confetti no), and the
// stacking order of everything that floats (header 30, tabs 40, workspace 50, confetti 55, overlays 58, toasts 60).

import { finish } from "./me-lib.mjs";
import { F, feedOf, probById, consecutive } from "./tabs-kit.mjs";

const byKey = (fx) => [...fx].sort((a, b) => Number(a.key) - Number(b.key));
import { stn } from "./tabs-line.mjs";

/* Platform's colours beyond the shell's PF table, as the celebrations and the Dojo use them: the sign panel, signal
   and the text on it, the sunk ground (for files that don't load PF), the caution pair, and lines 1 to 8.
   REGRESS_CONTRAST=more draws both palettes in High contrast. */
const PFX_DAY = {
  sign: "rgb(20, 20, 20)", onSign: "rgb(255, 255, 255)", signal: "rgb(255, 205, 0)", signalDeep: "rgb(240, 187, 0)", onSignal: "rgb(20, 20, 20)", sunk: "rgb(229, 228, 222)",
  caution: "rgb(125, 88, 0)", cautionWash: "rgb(255, 240, 179)",
  lines: ["rgb(213, 43, 30)", "rgb(29, 91, 198)", "rgb(0, 129, 60)", "rgb(180, 80, 0)", "rgb(122, 62, 157)", "rgb(0, 121, 138)", "rgb(194, 40, 122)", "rgb(135, 86, 41)"],
};
const PFX_NIGHT = {
  sign: "rgb(242, 242, 238)", onSign: "rgb(20, 20, 20)", signal: "rgb(255, 205, 0)", signalDeep: "rgb(255, 216, 61)", onSignal: "rgb(20, 20, 20)", sunk: "rgb(11, 12, 13)",
  caution: "rgb(255, 205, 0)", cautionWash: "rgb(58, 48, 8)",
  lines: ["rgb(240, 84, 74)", "rgb(91, 141, 239)", "rgb(54, 183, 106)", "rgb(255, 138, 42)", "rgb(178, 126, 216)", "rgb(43, 191, 208)", "rgb(240, 96, 159)", "rgb(201, 149, 97)"],
};
const PFX_CONTRAST = {
  sign: "rgb(255, 255, 255)", onSign: "rgb(0, 0, 0)", signal: "rgb(255, 205, 0)", signalDeep: "rgb(255, 224, 102)", onSignal: "rgb(0, 0, 0)", sunk: "rgb(31, 31, 31)",
  caution: "rgb(255, 205, 0)", cautionWash: "rgb(58, 48, 0)",
  lines: ["rgb(255, 104, 96)", "rgb(117, 147, 255)", "rgb(99, 237, 87)", "rgb(242, 143, 41)", "rgb(206, 170, 255)", "rgb(0, 192, 204)", "rgb(255, 136, 200)", "rgb(230, 178, 133)"],
};
export const PFX = process.env.REGRESS_CONTRAST === "more" ? { light: PFX_CONTRAST, dark: PFX_CONTRAST } : { light: PFX_DAY, dark: PFX_NIGHT };

/** Signal, then the eight lines in the order Platform draws series: the confetti's colours, in the order pieces take them. */
const confettiColours = (p) => [p.signal, ...[2, 4, 6, 7, 8, 3, 5, 1].map((n) => p.lines[n - 1])];

/* What the picture is about: toasts show, confetti stays out of the frame. */
const SHOW_TOASTS = ".confetti, .cf { visibility: hidden !important; }";

const pcheck = (page, name, checked = false) => page.getByRole("button", { name: (checked ? "Uncheck " : "Check ") + name, exact: true });
const ritualBtn = (page) => stn(page, 2).locator(".ritual");

const toastGeometry = (page) =>
  page.locator(".toasts .toast").evaluateAll((els) => {
    const w = document.documentElement.clientWidth;
    const rs = els.map((e) => e.getBoundingClientRect());
    return {
      n: els.length,
      top: rs[0] && rs[0].top,
      gaps: rs.slice(1).map((r, i) => Math.round((r.top - rs[i].bottom) * 100) / 100),
      centred: rs.every((r) => Math.abs(r.left + r.width / 2 - w / 2) < 0.6),
      narrow: rs.every((r) => r.width <= Math.min(innerWidth - 32, 480) + 0.01),
    };
  });

export default function register(scenario) {
  scenario("12-celebrations", "toasts and confetti: stacking, the 3 s and 2.8 s lifetimes, ids, confetti pieces, reduced motion, what floats above what", async (s) => {
    // ================= timing, with motion on and the clock held
    const A = await s.device({ seed: F.midQuiet, motion: true });
    await A.open();
    await A.pause();
    const page = A.page;
    const tkf = "Top K Frequent Elements";

    await A.seed(5);
    await ritualBtn(page).click();
    await s.expect("a ritual raises one toast and nothing else", async () => feedOf(await A.fx()), ["+15 XP · ritual"]);
    await A.advance(1500);
    const before = (await A.fx()).length;
    const drawsBefore = await A.draws();
    await A.seed(6);
    await pcheck(page, tkf).click();
    await s.expect("1.5 s later a check raises a second toast and a burst of 12: three celebrations altogether, ids rising in the order raised", async () => {
      const fx = await A.fx();
      return { feed: feedOf(fx), keys: consecutive(byKey(fx)) };
    }, { feed: ["+15 XP · ritual", "+20 XP · Top K Frequent Elements", "confetti 12"], keys: true });
    await s.expect("the two toasts are stacked in the order they came, with the burst beside them", () => A.live(), { toasts: ["+15 XP · ritual", "+20 XP · Top K Frequent Elements"], bursts: [12] });
    await s.expect("a burst of 12 pieces draws 36 random numbers (a column, a fall time and a delay each), once", async () => (await A.draws()) - drawsBefore - 0, 36);

    await A.advance(1499);
    await s.expect("at 2.999 s the first toast is still up", async () => (await A.live()).toasts, ["+15 XP · ritual", "+20 XP · Top K Frequent Elements"]);
    await A.advance(1);
    await s.expect("at 3.000 s the first toast leaves; the second (1.5 s younger) and the burst stay", () => A.live(), { toasts: ["+20 XP · Top K Frequent Elements"], bursts: [12] });
    await A.advance(1299);
    await s.expect("at 4.299 s the burst (2.8 s old at 4.3) is still falling", async () => (await A.live()).bursts, [12]);
    await A.advance(1);
    await s.expect("at 4.300 s the burst is removed, 2.8 s after it began; the second toast remains", () => A.live(), { toasts: ["+20 XP · Top K Frequent Elements"], bursts: [] });
    await A.advance(199);
    await s.expect("at 4.499 s the second toast is still up", async () => (await A.live()).toasts, ["+20 XP · Top K Frequent Elements"]);
    await A.advance(1);
    await s.expect("at 4.500 s it leaves, 3 s after it came: the page holds no toast and no confetti", () => A.live(), { toasts: [], bursts: [] });
    await s.expect("lifetimes as recorded, in the order the ids were stamped: each toast 3000 ms, the burst 2800 ms", async () => byKey(await A.fx()).map((e) => `${e.kind} ${e.gone - e.at}`), ["toast 3000", "toast 3000", "confetti 2800"]);

    // ---- the CSS side of the clock: the fade starts at 2.5 s, 0.5 s before the toast leaves
    await A.seed(7);
    await pcheck(page, tkf, true).click();
    await pcheck(page, tkf).click();
    await s.expect("a toast's animation is Platform's Announcement coming in, a 0.16 s rise, then a 0.16 s fade-out that starts 2.5 s in and holds its last frame (tin, tout)", async () => A.page.locator(".toast").last().evaluate((e) => {
      const cs = getComputedStyle(e);
      return { name: cs.animationName, dur: cs.animationDuration, delay: cs.animationDelay, fill: cs.animationFillMode, count: cs.animationIterationCount };
    }), { name: "tin, tout", dur: "0.16s, 0.16s", delay: "0s, 2.5s", fill: "none, forwards", count: "1, 1" });
    await s.expect("…it rises 8px into place: on its first frame it sits 8px low and transparent; halfway through the fade-out it has not moved and is partly faded", async () => A.page.locator(".toast").last().evaluate((e) => {
      // The CSS animations run on real time and the entrance is long over: restart them, then hold each at a moment.
      e.style.animation = "none";
      void e.offsetWidth;
      e.style.animation = "";
      const [tin, tout] = ["tin", "tout"].map((n) => e.getAnimations().find((a) => a.animationName === n));
      tin.pause();
      tout.pause();
      tin.currentTime = 0;
      const cs = getComputedStyle(e);
      const first = { transform: cs.transform, opacity: cs.opacity };
      tin.finish();
      tout.currentTime = 2580;
      const fading = { transform: cs.transform, between: +cs.opacity > 0 && +cs.opacity < 1 };
      tout.finish();
      return { first, fading };
    }), { first: { transform: "matrix(1, 0, 0, 1, 0, 8)", opacity: "0" }, fading: { transform: "none", between: true } });
    await s.pin("the toast's two easings", await page.locator(".toast").last().evaluate((e) => getComputedStyle(e).animationTimingFunction));
    await s.expect("a confetti piece falls once, linearly, and stays where it lands", async () => page.locator(".cf").first().evaluate((e) => {
      const cs = getComputedStyle(e);
      return { name: cs.animationName, timing: cs.animationTimingFunction, fill: cs.animationFillMode, count: cs.animationIterationCount };
    }), { name: "fall", timing: "linear", fill: "forwards", count: "1" });
    await A.advance(3000);

    // ---- confetti pieces, seeded
    await A.seed(5);
    const d0 = await A.draws();
    await pcheck(page, tkf, true).click();
    await A.advance(10);
    await pcheck(page, tkf).click();
    await s.expect("a burst of 12: a fixed-position, click-through, aria-hidden layer under the toasts, clipped to the window", async () => A.page.locator(".confetti").last().evaluate((b) => {
      const cs = getComputedStyle(b);
      return { pos: cs.position, inset: cs.inset, z: cs.zIndex, events: cs.pointerEvents, overflow: cs.overflowX, hidden: b.getAttribute("aria-hidden"), pieces: b.querySelectorAll(".cf").length };
    }), { pos: "fixed", inset: "0px", z: "55", events: "none", overflow: "hidden", hidden: "true", pieces: 12 });
    const pieces = await page.locator(".confetti").last().locator(".cf").evaluateAll((els) => els.map((e) => ({ left: e.style.left, dur: e.style.animationDuration, delay: e.style.animationDelay, bg: getComputedStyle(e).backgroundColor })));
    await s.expect("the pieces take Platform's colours in turn: signal yellow, then the eight lines in the order Platform draws series (2, 4, 6, 7, 8, 3, 5, 1)", async () => pieces.map((p) => p.bg), [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2].map((k) => confettiColours(PFX.light)[k]));
    await s.expect("every piece starts within the window's width and falls for 0.9 to 2.1 s after a delay of up to 0.3 s", async () => pieces.every((p) => parseFloat(p.left) >= 0 && parseFloat(p.left) < 100 && p.left.endsWith("vw") && parseFloat(p.dur) >= 0.9 && parseFloat(p.dur) < 2.1 && parseFloat(p.delay) >= 0 && parseFloat(p.delay) < 0.3), true);
    await s.pin("the twelve pieces of a seed-5 burst (column / fall / delay)", pieces.map((p) => `${p.left}/${p.dur}/${p.delay}`).join(" "));
    await s.expect("a piece is an 8 x 12 chip with a 2px radius, hung just above the window", async () => A.props(page.locator(".confetti").last().locator(".cf").first(), ["position", "top", "width", "height", "border-top-left-radius"]), { position: "absolute", top: "-12px", width: "8px", height: "12px", "border-top-left-radius": "2px" });
    const draws1 = await A.draws();
    await A.tab("Dojo");
    await A.tab("Line");
    await s.expect("the pieces are scattered once: a trip to another tab (a re-render) neither moves them nor draws another random number", async () => ({ same: JSON.stringify(await page.locator(".confetti").last().locator(".cf").evaluateAll((els) => els.map((e) => ({ left: e.style.left, dur: e.style.animationDuration, delay: e.style.animationDelay, bg: getComputedStyle(e).backgroundColor })))) === JSON.stringify(pieces), draws: (await A.draws()) === draws1 }), { same: true, draws: true });
    await A.advance(3000);

    // ---- ids: strictly increasing, unique, across everything this device has raised
    await s.expect("every celebration this page played got the next id, 1, 2, 3... with no gap and no repeat, though toasts left and tabs changed in between (so nothing was played twice, and nothing was skipped)", async () => byKey(await A.fx()).map((e) => Number(e.key)), [1, 2, 3, 4, 5, 6, 7]);
    await s.expect("…seven celebrations: a ritual (1) and three checks (toast and burst each); the undone ticks raised none", async () => (await A.fx()).length, 7);

    // ================= reduced motion
    const R = await s.device({ seed: F.mid, motion: false });
    await R.open();
    await R.pause();
    const rp = R.page;
    await R.clearFx();
    await pcheck(rp, "N-Queens").click();
    await s.expect("with reduced motion the toasts still come (the XP, the badge) but no confetti is made: not raised, not on the page", async () => ({ feed: feedOf(await R.fx()), live: await R.live(), layers: await rp.locator(".confetti").count() }), { feed: ["+40 XP · N-Queens", "* Badge — Heating Up"], live: { toasts: ["+40 XP · N-Queens", "* Badge — Heating Up"], bursts: [] }, layers: 0 });
    await s.expect("…and the toasts do not animate", async () => R.page.locator(".toast").first().evaluate((e) => ({ name: getComputedStyle(e).animationName, opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform })), { name: "none", opacity: "1", transform: "none" });
    await s.expect("the toast stack: the first 8px from the top, 8px between (Platform's stack), centred, narrower than the window less 16px a side and than 30rem", () => toastGeometry(rp), { n: 2, top: 8, gaps: [8], centred: true, narrow: true });
    await s.expect("the stack is a polite live region, fixed across the top at level 60, and lets clicks through", async () => ({ aria: await rp.locator(".toasts").getAttribute("aria-live"), p: await R.props(".toasts", ["position", "z-index", "pointer-events", "display", "flex-direction", "align-items", "gap", "top", "left", "right"]) }), { aria: "polite", p: { position: "fixed", "z-index": "60", "pointer-events": "none", display: "flex", "flex-direction": "column", "align-items": "center", gap: "8px", top: "8px", left: "0px", right: "0px" } });
    await s.expect("a toast is Platform's Announcement: a sign panel with 16px bold on-sign text after a 32px tone tile, 12px padding, 8px corners; a plain one's tile is lit on-sign with a sign pictogram, a gold one's is signal yellow with an on-signal one", async () => ({
      plain: await R.props(rp.locator(".toast:not(.gold)"), ["background-color", "color", "font-size", "font-weight", "padding-top", "padding-left", "border-top-left-radius", "text-align", "letter-spacing"]),
      gold: await R.props(rp.locator(".toast.gold"), ["background-color", "color", "font-weight"]),
      plainTile: await R.props(rp.locator(".toast:not(.gold) .toast-tile"), ["background-color", "color", "width", "height", "border-top-left-radius"]),
      goldTile: await R.props(rp.locator(".toast.gold .toast-tile"), ["background-color", "color"]),
    }), {
      plain: { "background-color": PFX.light.sign, color: PFX.light.onSign, "font-size": "16px", "font-weight": "700", "padding-top": "12px", "padding-left": "12px", "border-top-left-radius": "8px", "text-align": "start", "letter-spacing": "normal" },
      gold: { "background-color": PFX.light.sign, color: PFX.light.onSign, "font-weight": "700" },
      plainTile: { "background-color": PFX.light.onSign, color: PFX.light.sign, width: "32px", height: "32px", "border-top-left-radius": "4px" },
      goldTile: { "background-color": PFX.light.signal, color: PFX.light.onSignal },
    });
    await s.expect("…the tile carries a 20px pictogram, a message on a plain toast and the star on a gold one, and adds no words: each toast's text is still exactly its message", async () => rp.locator(".toast").evaluateAll((els) => els.map((e) => ({ glyph: window.__glyph(e.querySelector(".toast-tile svg")), size: e.querySelector(".toast-tile svg").getAttribute("width"), text: e.textContent }))), [
      { glyph: "message-circle", size: "20", text: "+40 XP · N-Queens" },
      { glyph: "star", size: "20", text: "Badge — Heating Up" },
    ]);
    await s.pin("the toasts' shadows", { plain: (await R.props(rp.locator(".toast:not(.gold)"), ["box-shadow"]))["box-shadow"], gold: (await R.props(rp.locator(".toast.gold"), ["box-shadow"]))["box-shadow"] });
    await s.expect("toasts do not catch the pointer: the element at the middle of the first toast is the header's, not the toast's", async () => {
      const box = await rp.locator(".toast").first().boundingBox();
      return rp.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { header: !!e.closest("header.hdr"), toast: !!e.closest(".toasts") }; }, [box.x + box.width / 2, box.y + box.height / 2]);
    }, { header: true, toast: false });
    await R.shot("toasts", { hide: SHOW_TOASTS });
    await R.setDark(true);
    await s.expect("in Night the toast is the lit white sign with dark text, its plain tile dark; the gold one's tile is still signal yellow with dark ink", async () => ({ plain: await R.props(rp.locator(".toast:not(.gold)"), ["background-color", "color"]), plainTile: await R.props(rp.locator(".toast:not(.gold) .toast-tile"), ["background-color", "color"]), gold: await R.props(rp.locator(".toast.gold"), ["background-color", "color"]), goldTile: await R.props(rp.locator(".toast.gold .toast-tile"), ["background-color", "color"]) }), {
      plain: { "background-color": PFX.dark.sign, color: PFX.dark.onSign },
      plainTile: { "background-color": PFX.dark.onSign, color: PFX.dark.sign },
      gold: { "background-color": PFX.dark.sign, color: PFX.dark.onSign },
      goldTile: { "background-color": PFX.dark.signal, color: PFX.dark.onSignal },
    });
    await R.shot("toasts", { hide: SHOW_TOASTS });
    await R.setDark(false);
    await R.advance(3000);
    await s.expect("the toasts leave at 3 s with reduced motion too", () => R.live(), { toasts: [], bursts: [] });

    // ---- the preference is read when a celebration is raised, not once at load
    await R.page.emulateMedia({ reducedMotion: "no-preference" });
    await R.clearFx();
    await pcheck(rp, "N-Queens", true).click();
    await pcheck(rp, "N-Queens").click();
    await s.expect("switch the preference off at run time and the next check throws confetti again (a burst of 12 comes with the toast)", async () => feedOf(await R.fx()), ["+40 XP · N-Queens", "confetti 12"]);
    await R.advance(3000);
    await R.page.emulateMedia({ reducedMotion: "reduce" });
    await R.clearFx();
    await pcheck(rp, "N-Queens", true).click();
    await pcheck(rp, "N-Queens").click();
    await s.expect("…and back on, it stops again", async () => feedOf(await R.fx()), ["+40 XP · N-Queens"]);

    // ---- the big moment: a stack of toasts, for the picture
    const E = await s.device({ seed: F.lineEnd, motion: false });
    await E.open();
    await E.pause();
    await E.clearFx();
    await pcheck(E.page, probById("google", "mock4").n).click();
    await s.expect("the end of the line stacks five toasts at the top, four of them gold, in the order they were raised", () => E.live(), { toasts: ["+30 XP · Timed mock — Google-tagg…", "* Rank up — Offer Letter", "* Badge — Noogler", "* Final Approach cleared", "* Badge — End of the Line"], bursts: [] });
    await s.expect("…five toasts: first at 8px, 8px between each", () => toastGeometry(E.page), { n: 5, top: 8, gaps: [8, 8, 8, 8], centred: true, narrow: true });
    await E.shot("toasts-five", { hide: SHOW_TOASTS });
    await E.setDark(true);
    await E.shot("toasts-five", { hide: SHOW_TOASTS });

    // ================= what floats above what
    const Z = await s.device({ seed: F.mock, motion: false });
    await Z.open();
    const zp = Z.page;
    const z = async (sel) => (await Z.props(sel, ["z-index"]))["z-index"];
    const rule = (sel) => zp.evaluate((q) => { for (const sheet of document.styleSheets) for (const r of sheet.cssRules) if (r.selectorText === q) return r.style.zIndex; return null; }, sel);
    await stn(zp, 6).locator(".timer").getByRole("button", { name: "Start", exact: true }).click();
    await stn(zp, 6).locator(".prow button.golink").first().click();
    await zp.locator('.ws[role="dialog"]').waitFor();
    await zp.getByRole("button", { name: "Back to the line" }).waitFor();
    await Z.pause();
    await Z.advance(1_500_000);
    await s.expect("the mock clock ran out while the workspace was open: the toast is up over it", () => Z.live(), { toasts: ["* ⏰ Pencils down."], bursts: [] });
    await s.expect("the stacking order, bottom to top: header 30, tab bar 40, workspace 50, confetti 55, the Me tab's scanner and link sheet 58, toasts 60", async () => ({
      header: await z("header.hdr"),
      tabs: await z("nav.tabs"),
      workspace: await z(".ws"),
      toasts: await z(".toasts"),
      confetti: await rule(".confetti"),
      scan: await rule(".scanwrap"),
      sheet: await rule(".qrscrim"),
      boot: await rule(".ws-boot"),
    }), { header: "30", tabs: "40", workspace: "50", toasts: "60", confetti: "55", scan: "58", sheet: "58", boot: "50" });
    await s.expect("the open workspace covers the header and the tab bar: the elements under their old places are the workspace's", async () => zp.evaluate(() => [document.elementFromPoint(640, 20), document.elementFromPoint(300, 840)].map((e) => !!e.closest(".ws"))), [true, true]);
    await Z.shot("toast-over-workspace", { locator: zp.locator(".toasts"), hide: SHOW_TOASTS });
    finish(s);
  });
}

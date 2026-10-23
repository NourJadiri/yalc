// tabs-metro-kit.mjs: the readers and models for the Metro tab: the departures board, a card, the result.

import { D } from "./tabs-kit.mjs";

/* Each deck is a Platform line with its bullet (Mix is the interchange, no line of its own). */
export const LOOK = {
  mix: { line: "", glyph: "" },
  graphs: { line: "6", glyph: "G" },
  bt: { line: "1", glyph: "B" },
  dp: { line: "8", glyph: "D" },
  ds: { line: "3", glyph: "H" },
  redo: { line: "7", glyph: "R" },
};

/* Platform's colours for the Metro, from tokens.css. The page and the cards are in the page's palette (MPF.light,
   MPF.dark); the departures board is lit at night on every page, so it is always in Night's (BOARD). A run with
   REGRESS_CONTRAST=more draws everything, the board included, in High contrast. */
const DAY = {
  surface: "rgb(241, 240, 236)", raised: "rgb(255, 255, 255)", sunk: "rgb(229, 228, 222)", rule: "rgb(211, 210, 203)",
  border: "rgb(124, 123, 116)", ink: "rgb(20, 20, 20)", inkMuted: "rgb(87, 86, 79)", sign: "rgb(20, 20, 20)",
  onSign: "rgb(255, 255, 255)", signal: "rgb(255, 205, 0)", signalDeep: "rgb(240, 187, 0)", onSignal: "rgb(20, 20, 20)",
  go: "rgb(0, 107, 97)", goWash: "rgb(212, 236, 232)", onGo: "rgb(255, 255, 255)", stop: "rgb(196, 18, 47)",
  stopWash: "rgb(249, 220, 221)", onStop: "rgb(255, 255, 255)", caution: "rgb(125, 88, 0)", line2: "rgb(29, 91, 198)",
  line4: "rgb(180, 80, 0)", onLine: "rgb(255, 255, 255)",
};
const NIGHT = {
  surface: "rgb(18, 19, 21)", raised: "rgb(28, 29, 33)", sunk: "rgb(11, 12, 13)", rule: "rgb(47, 48, 53)",
  border: "rgb(119, 120, 125)", ink: "rgb(242, 242, 238)", inkMuted: "rgb(169, 169, 163)", sign: "rgb(242, 242, 238)",
  onSign: "rgb(20, 20, 20)", signal: "rgb(255, 205, 0)", signalDeep: "rgb(255, 216, 61)", onSignal: "rgb(20, 20, 20)",
  go: "rgb(61, 207, 185)", goWash: "rgb(15, 47, 43)", onGo: "rgb(20, 20, 20)", stop: "rgb(255, 107, 107)",
  stopWash: "rgb(59, 21, 23)", onStop: "rgb(20, 20, 20)", caution: "rgb(255, 205, 0)", line1: "rgb(240, 84, 74)",
  line2: "rgb(91, 141, 239)", line3: "rgb(54, 183, 106)", line4: "rgb(255, 138, 42)", line6: "rgb(43, 191, 208)",
  line7: "rgb(240, 96, 159)", line8: "rgb(201, 149, 97)", onLine: "rgb(20, 20, 20)",
};
const HC = {
  surface: "rgb(0, 0, 0)", raised: "rgb(0, 0, 0)", sunk: "rgb(31, 31, 31)", rule: "rgb(166, 166, 166)",
  border: "rgb(166, 166, 166)", ink: "rgb(255, 255, 255)", inkMuted: "rgb(194, 194, 194)", sign: "rgb(255, 255, 255)",
  onSign: "rgb(0, 0, 0)", signal: "rgb(255, 205, 0)", signalDeep: "rgb(255, 224, 102)", onSignal: "rgb(0, 0, 0)",
  go: "rgb(79, 224, 200)", goWash: "rgb(0, 51, 46)", onGo: "rgb(0, 0, 0)", stop: "rgb(255, 138, 128)",
  stopWash: "rgb(58, 8, 8)", onStop: "rgb(0, 0, 0)", caution: "rgb(255, 205, 0)", line1: "rgb(255, 104, 96)",
  line2: "rgb(117, 147, 255)", line3: "rgb(99, 237, 87)", line4: "rgb(242, 143, 41)", line6: "rgb(0, 192, 204)",
  line7: "rgb(255, 136, 200)", line8: "rgb(230, 178, 133)", onLine: "rgb(0, 0, 0)",
};
const CONTRAST = process.env.REGRESS_CONTRAST === "more";
export const MPF = CONTRAST ? { light: HC, dark: HC } : { light: DAY, dark: NIGHT };
export const BOARD = CONTRAST ? HC : NIGHT;

export const FRESH_NOTE = "Patterns, bug hunts, missing lines, complexity. Tap the right answer — streaks multiply the XP (×2 at 3, ×3 at 6). Wrong ones go to the Redemption deck.";

/** What the board prints per deck: how many cards and your hit rate over them (null until one was seen). */
export function deckStat(blob, id) {
  if (id === "redo") return { n: blob.quiz.missed.length, pct: null };
  const pool = id === "mix" ? D.Q : D.Q.filter((q) => q.ph === id);
  let seen = 0;
  let right = 0;
  for (const q of pool) {
    const s = blob.quiz.perQ[q.id];
    if (s) {
      seen += s.seen;
      right += s.right;
    }
  }
  return { n: pool.length, pct: seen ? Math.round((right / seen) * 100) : null };
}

const subline = (id, n, pct) => {
  if (id === "redo") return n ? `${n} missed · win them back` : "no misses yet — clean sheet";
  const ridden = pct === null ? "not yet ridden" : `${pct}% right`;
  if (id === "mix") return `${n} cards · ` + (pct === null ? "weakest first" : `${pct}% · weakest first`);
  return `${n} cards · ${ridden}`;
};

/** What the departures board ought to be for `blob` with deck `sel` chosen. */
/* Redemption deals only what is owed, up to the usual ten. */
const stopsOf = (blob, deck) => {
  const n = deck === "redo" ? Math.min(blob.quiz.missed.length, 10) : 10;
  return n + (n === 1 ? " stop" : " stops");
};

export function boardModel(blob, sel) {
  const q = blob.quiz;
  return {
    group: "group:Choose a deck",
    title: "Departures — pick a line",
    live: `${D.DECKS.length} lines`,
    rows: D.DECKS.map((d, i) => {
      const look = LOOK[d.id];
      const { n, pct } = deckStat(blob, d.id);
      const on = sel === d.id;
      const off = d.id === "redo" && n === 0;
      const [status, text] = on ? ["boarding", "NOW BOARDING"] : d.id === "redo" && n > 0 ? ["delayed", `DELAYED · ${n}`] : ["platform", `P${i + 1}`];
      return {
        cls: "drow" + (on ? " sel" : ""),
        disabled: off,
        pressed: String(on),
        rdl: look.line ? "bullet lg rdl" : "rdl mix",
        glyph: look.glyph,
        line: look.line,
        name: d.n,
        sub: subline(d.id, n, pct),
        tag: (status === "platform" ? "dplat:" : "dtag:") + text,
        flaps: `${status}:${text}`,
      };
    }),
    boardBtn: `Board ${D.DECKS.find((d) => d.id === sel).n} — ${stopsOf(blob, sel)}`,
    note: q.answered ? `${q.correct}/${q.answered} lifetime · best streak ${q.bestStreak} · ${q.sessions} runs` : FRESH_NOTE,
  };
}

export const board = (page) =>
  page.locator("#quizArea").evaluate((q) => {
    const g = q.querySelector(".dboard");
    return {
      group: g.getAttribute("role") + ":" + g.getAttribute("aria-label"),
      title: g.querySelector(".dboard-title").textContent,
      live: g.querySelector(".dboard-live").textContent,
      rows: [...g.querySelectorAll(".drow")].map((r) => {
        const rdl = r.querySelector(".rdl");
        const tag = r.querySelector(".dtag, .dplat");
        return {
          cls: r.className,
          disabled: r.disabled,
          pressed: r.getAttribute("aria-pressed"),
          rdl: rdl.className,
          glyph: rdl.textContent,
          line: rdl.dataset.line ?? "",
          name: r.querySelector(".drow-name").textContent,
          sub: r.querySelector(".drow-sub").textContent,
          tag: tag.className + ":" + tag.textContent,
          /* The status the flaps are drawn in, then the characters on the flaps, one to a flap. */
          flaps: tag.dataset.flaps + ":" + [...tag.querySelectorAll(".flap")].map((f) => f.dataset.ch).join(""),
        };
      }),
      boardBtn: q.querySelector(".board").textContent.trim(),
      note: q.querySelector(".storenote").textContent,
    };
  });

/* Platform's stop pictogram (the octagon), which the suite's glyph table does not name. */
const STOP_D = 'd="M8.3 3H15.7L21 8.3V15.7L15.7 21H8.3L3 15.7V8.3Z"';

/** The card a run is on, as plain data (option texts are kept per slot). A revealed option says what it is in a word
 *  and a pictogram: "Right:check", "Wrong:stop" ("" when it says nothing). */
export const card = (page) =>
  page.locator("#quizArea .qwrap").evaluate((w, STOP_D) => {
    const says = (v) => (v ? v.textContent + ":" + (v.querySelector("svg").innerHTML.includes(STOP_D) ? "stop" : window.__glyph(v.querySelector("svg"))) : "");
    return {
      cat: w.querySelector(".qcat").className + ":" + w.querySelector(".qcat").textContent,
      meta: [...w.querySelectorAll(".qmeta > span")].map((e) => (e.className || "-") + ":" + e.textContent),
      q: w.querySelector(".qtext").textContent,
      code: w.querySelector("pre.code")?.textContent ?? null,
      blanks: w.querySelectorAll("pre.code .blank").length,
      opts: [...w.querySelectorAll(".opt")].map((b) => ({ k: b.querySelector(".k").textContent, text: b.childNodes[1].textContent, cls: b.className, disabled: b.disabled, says: says(b.querySelector(".verdict")) })),
      explain: w.querySelector(".explain")?.textContent ?? null,
      /* Each nav button by its hook class (the Button's own classes are its look), then its label. */
      nav: [...w.querySelectorAll(".qnav button")].map((b) => [...b.classList].filter((c) => c === "quit" || c === "next").join(" ") + ":" + b.textContent.trim()),
      stops: [...w.querySelectorAll(".stops-track i")].map((i) => i.className || "-").join(" "),
    };
  }, STOP_D);

export const result = (page) =>
  page.locator("#quizArea .qwrap").evaluate((w) => ({
    cls: w.className,
    big: w.querySelector(".big").textContent,
    sub: w.querySelector(".sub").textContent,
    row: [...w.querySelectorAll(".row > span")].map((e) => e.querySelector("b").textContent + "|" + e.lastChild.textContent),
    btns: [...w.querySelectorAll(".mrow .mbtn")].map((b) => b.textContent.trim()),
  }));

/** The bank's card shown by `reading` (cards are told apart by their question). */
export const cardOf = (reading) => {
  const q = D.Q.find((x) => x.q === reading.q);
  if (!q) throw new Error("no card in the bank asks: " + reading.q);
  return q;
};

export const multOf = (streak) => (streak >= 6 ? 3 : streak >= 3 ? 2 : 1);
export const multLabel = (streak) => (streak >= 6 ? "×3" : streak >= 3 ? "×2" : "");

export const CATN = { pat: "Pattern", bug: "Bug hunt", line: "Missing line", cx: "Complexity" };

/** What a card ought to read before it is answered, given where the run stands. */
export function askModel(q, reading, { i, n, streak, xp, results }) {
  return {
    cat: `qcat ${q.t}:${CATN[q.t]}`,
    meta: [`-:${i + 1}/${n}`, streak >= 2 && `streak:${streak}`, multLabel(streak) && `mult:${multLabel(streak)}`, `-:+${xp}`].filter(Boolean),
    q: q.q,
    code: q.code ?? null,
    blanks: q.code ? q.code.split("____").length - 1 : 0,
    letters: ["A", "B", "C", "D"],
    classes: ["opt", "opt", "opt", "opt"],
    disabled: [false, false, false, false],
    texts: [...q.o].sort(),
    says: ["", "", "", ""],
    explain: null,
    nav: ["quit:End run"],
    stops: stopsModel(n, results),
  };
}

/** …and after it is answered: `slot` was picked, `rightSlot` is the right one. */
export function revealModel(q, reading, { i, n, streak, xp, results, slot, rightSlot }) {
  const m = askModel(q, reading, { i, n, streak, xp, results });
  m.classes = reading.opts.map((_, k) => (k === rightSlot ? "opt right" : k === slot ? "opt wrong" : "opt dim"));
  m.says = reading.opts.map((_, k) => (k === rightSlot ? "Right:check" : k === slot ? "Wrong:stop" : ""));
  m.disabled = [true, true, true, true];
  m.explain = q.x;
  m.nav = ["quit:End run", `next:${i + 1 >= n ? "Finish" : "Next stop"}`];
  return m;
}

export const stopsModel = (n, results) => Array.from({ length: n }, (_, k) => (k < results.length ? (results[k] ? "ok" : "ko") : "-")).join(" ");

/** The fields of a card reading a model speaks of: option texts as a sorted set. */
export const cardView = (r) => ({
  cat: r.cat,
  meta: r.meta,
  q: r.q,
  code: r.code,
  blanks: r.blanks,
  letters: r.opts.map((o) => o.k),
  classes: r.opts.map((o) => o.cls),
  disabled: r.opts.map((o) => o.disabled),
  texts: r.opts.map((o) => o.text).sort(),
  says: r.opts.map((o) => o.says),
  explain: r.explain,
  nav: r.nav,
  stops: r.stops,
});

/* ------------------------------ the Metro on Platform: readers and models of the look ------------------------------ */

/** The departures board's own colours and its head. */
export const lit = (page) =>
  page.locator("#quizArea .dboard").evaluate((g) => {
    const cs = (e, ps) => getComputedStyle(e, ps);
    const title = g.querySelector(".dboard-title");
    const live = g.querySelector(".dboard-live");
    return {
      theme: g.dataset.theme,
      body: cs(g).backgroundColor,
      edge: cs(g).borderTopWidth + " " + cs(g).borderTopColor,
      ink: cs(g).color,
      title: { color: cs(title).color, type: cs(title).fontSize + " " + cs(title).fontWeight, glyph: window.__glyph(title.querySelector("svg")), picto: cs(title.querySelector("svg")).width },
      count: { color: cs(live).color, type: cs(live).fontSize + " " + cs(live).fontWeight, nums: cs(live).fontVariantNumeric },
      flap: cs(g.querySelector(".flap")).backgroundColor,
    };
  });

/** …lit at night whatever the page: Night's colours, or High contrast's on a High contrast page. */
export const litModel = () => ({
  theme: "dark",
  body: BOARD.sunk,
  edge: "1px " + BOARD.rule,
  ink: BOARD.ink,
  title: { color: BOARD.signal, type: "28px 700", glyph: "train", picto: "28px" },
  count: { color: BOARD.inkMuted, type: "14px 600", nums: "tabular-nums" },
  flap: BOARD.raised,
});

/** Each deck's mark: a line bullet, or Mix's interchange. */
export const marks = (page) =>
  page.locator("#quizArea .rdl").evaluateAll((els) =>
    els.map((e) => {
      const cs = getComputedStyle(e);
      return {
        t: e.textContent,
        line: e.dataset.line ?? "",
        cls: e.className,
        disc: cs.width + " " + cs.height + " " + cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        ring: cs.borderTopStyle === "none" ? "" : cs.borderTopWidth + " " + cs.borderTopStyle + " " + cs.borderTopColor,
        letter: cs.color,
      };
    })
  );

/** The marks of the six decks, with Redemption out of service when nothing is owed. */
export const marksModel = (redoOpen) =>
  D.DECKS.map((d) => {
    const { line, glyph } = LOOK[d.id];
    if (!line) return { t: "", line: "", cls: "rdl mix", disc: "32px 32px 9999px", bg: BOARD.raised, ring: "6px solid " + BOARD.ink, letter: BOARD.ink };
    const off = d.id === "redo" && !redoOpen;
    return { t: glyph, line, cls: "bullet lg rdl", disc: "32px 32px 9999px", bg: off ? BOARD.sunk : BOARD["line" + line], ring: off ? "2px dashed " + BOARD.border : "", letter: off ? BOARD.inkMuted : BOARD.onLine };
  });

/** The flaps that are flipping now, row by row: name/duration/delay of each running flip ("" for a row at rest). */
export const flips = (page) =>
  page.locator("#quizArea .dboard").evaluate((g) =>
    [...g.querySelectorAll(".drow")].map((r) =>
      [...r.querySelectorAll(".flap")]
        .flatMap((f) => f.getAnimations())
        .filter((a) => a.playState === "running")
        .map((a) => `${a.animationName}/${a.effect.getTiming().duration}/${Math.round(a.effect.getTiming().delay)}`)
        .join(" ")
    )
  );

/** A row whose value just changed flips each of its flaps for 280ms, the next one 26ms after the last. */
export const flipsModel = (changed) =>
  D.DECKS.map((d) => (changed[d.id] ? [...changed[d.id]].map((_, i) => `flap-flip/280/${i * 26}`).join(" ") : ""));

/** The stops track, stop by stop: what it is (ok/ko/-, @ for the current one), how it is drawn, and the line into it. */
export const route = (page) =>
  page.locator("#quizArea .stops-track").evaluate((t, STOP_D) =>
    [...t.querySelectorAll("i")].map((i) => {
      const svg = i.querySelector("svg");
      const after = getComputedStyle(i, "::after");
      const before = getComputedStyle(i, "::before");
      let mark;
      if (svg) {
        const s = getComputedStyle(svg);
        mark = (svg.innerHTML.includes(STOP_D) ? "stop" : window.__glyph(svg)) + " on " + s.backgroundColor + " " + s.width + "+" + s.paddingTop + (s.boxShadow === "none" ? "" : " ringed " + s.boxShadow);
      } else mark = after.width + " ring " + after.borderTopWidth + " " + after.borderTopColor;
      return { at: (i.className || "-") + (i.dataset.now ? "@" : ""), mark, line: before.display === "none" ? "" : before.backgroundImage !== "none" ? "dashed" : before.backgroundColor };
    }), STOP_D);

/** …as Platform's Route on a desktop card, in palette P: travelled ink, the current stop ringed in ink, dashes ahead. */
export const routeModel = (n, results, current, P) =>
  Array.from({ length: n }, (_, k) => {
    const r = results[k];
    const now = k === current;
    let mark;
    if (r === undefined) mark = now ? `28px ring 7px ${P.ink}` : `20px ring 3px ${P.border}`;
    else mark = (r ? `check on ${P.go}` : `stop on ${P.stop}`) + " 16px+4px" + (now ? ` ringed ${P.raised} 0px 0px 0px 2px, ${P.ink} 0px 0px 0px 5px` : "");
    return { at: (r === undefined ? "-" : r ? "ok" : "ko") + (now ? "@" : ""), mark, line: k === 0 ? "" : k <= current ? P.ink : "dashed" };
  });

/** How each option is drawn. */
export const optLooks = (page) =>
  page.locator("#quizArea .opt").evaluateAll((els) =>
    els.map((b) => {
      const cs = getComputedStyle(b);
      const k = getComputedStyle(b.querySelector(".k"));
      const v = b.querySelector(".verdict svg");
      return {
        cls: b.className,
        tall: b.getBoundingClientRect().height >= 44,
        edge: cs.borderTopWidth + " " + cs.borderTopColor + " " + cs.borderTopLeftRadius,
        ground: cs.backgroundColor,
        text: cs.fontSize + " " + cs.fontWeight + " " + cs.color,
        stop: k.width + " " + k.borderTopLeftRadius + " " + k.borderTopColor + " " + k.backgroundColor + " " + k.color,
        mark: v ? getComputedStyle(v).color + " " + getComputedStyle(v).width : "",
      };
    })
  );

/** Platform's choices in palette P: open, right (go), the wrong pick (stop), or one of the others (muted). */
export const optLook = (cls, P) => {
  const state = cls.split(" ")[1] ?? "open";
  const [edge, ground, ink, stopRing, stopFill, letter, mark] = {
    open: [P.border, P.raised, P.ink, P.border, "rgba(0, 0, 0, 0)", P.ink, ""],
    right: [P.go, P.goWash, P.ink, P.go, P.go, P.onGo, P.go + " 20px"],
    wrong: [P.stop, P.stopWash, P.ink, P.stop, P.stop, P.onStop, P.stop + " 20px"],
    dim: [P.rule, P.raised, P.inkMuted, P.rule, "rgba(0, 0, 0, 0)", P.inkMuted, ""],
  }[state];
  return { cls, tall: true, edge: `2px ${edge} 8px`, ground, text: "16px 400 " + ink, stop: `24px 9999px ${stopRing} ${stopFill} ${letter}`, mark };
};

/** The run's card, its question and its header. */
export const cardLook = (page) =>
  page.locator("#quizArea .qwrap").evaluate((w) => {
    const cs = (e) => getComputedStyle(e);
    const q = w.querySelector(".qtext");
    const cat = w.querySelector(".qcat");
    const meta = w.querySelector(".qmeta");
    return {
      card: cs(w).backgroundColor + " " + cs(w).borderTopWidth + " " + cs(w).borderTopColor + " " + cs(w).borderTopLeftRadius + " " + cs(w).boxShadow,
      question: cs(q).fontSize + " " + cs(q).fontWeight + " " + cs(q).color,
      category: cs(cat).fontSize + " " + cs(cat).fontWeight + " " + cs(cat).color + " " + cs(cat).textTransform,
      meta: cs(meta).fontSize + " " + cs(meta).fontWeight + " " + cs(meta).fontVariantNumeric,
    };
  });

export const cardLookModel = (P) => ({
  card: `${P.raised} 1px ${P.rule} 8px none`,
  question: "20px 600 " + P.ink,
  category: "14px 600 " + P.inkMuted + " none",
  meta: "14px 600 tabular-nums",
});

/** End run and the button opposite it. */
export const navLook = (page) =>
  page.locator("#quizArea .qnav").evaluate((n) => {
    const cs = (e) => getComputedStyle(e);
    const q = n.querySelector(".quit");
    const x = n.querySelector(".next");
    return {
      quit: q.className + " " + cs(q).height + " " + cs(q).backgroundColor + " " + cs(q).color,
      next: x ? x.className + " " + cs(x).height + " " + cs(x).backgroundColor + " " + cs(x).color + " " + window.__glyph(x.lastElementChild) : null,
    };
  });

/** The result's Ticket. */
export const ticket = (page) =>
  page.locator("#quizArea .qwrap.result").evaluate((w) => {
    const cs = (e, ps) => getComputedStyle(e, ps);
    const tk = w.querySelector(".ticket");
    const main = w.querySelector(".ticket-main");
    const stub = w.querySelector(".ticket-stub");
    const big = w.querySelector(".big");
    const sub = w.querySelector(".sub");
    const stat = w.querySelector(".row > span");
    const b = stat.querySelector("b");
    const [again, decks] = w.querySelectorAll(".mrow .mbtn");
    const label = document.createRange();
    label.selectNode(stat.lastChild);
    const m = main.getBoundingClientRect();
    const s = stub.getBoundingClientRect();
    return {
      paper: cs(tk).backgroundColor + " " + cs(tk).borderTopLeftRadius,
      shadow: cs(w).filter.startsWith("drop-shadow"),
      notched: cs(tk).maskImage.startsWith("radial-gradient"),
      band: cs(main).borderTopWidth === "0px" ? cs(stub).borderTopWidth + " " + cs(stub).borderTopStyle + " " + cs(stub).borderTopColor : cs(main).borderTopWidth + " " + cs(main).borderTopStyle + " " + cs(main).borderTopColor,
      perforated: cs(stub, "::before").backgroundImage.startsWith("linear-gradient"),
      stub: s.left >= m.right - 1 ? "right" : s.bottom <= m.top + 1 ? "top" : "?",
      score: cs(big).fontFamily.split(",")[0] + " " + cs(big).fontSize + " " + cs(big).fontWeight + " " + cs(big).fontVariantNumeric + " " + cs(big).color,
      title: cs(sub).fontSize + " " + cs(sub).fontWeight + " " + cs(sub).color,
      details: cs(stat).fontSize + " " + cs(stat).color + " over " + cs(b).fontSize + " " + cs(b).fontWeight + " " + cs(b).fontVariantNumeric + " " + cs(b).color,
      labelAbove: label.getBoundingClientRect().bottom <= b.getBoundingClientRect().top + 1,
      again: again.className + " " + cs(again).height + " " + cs(again).backgroundColor + " " + cs(again).color,
      decks: decks.className + " " + cs(decks).height + " " + cs(decks).backgroundColor + " " + cs(decks).borderTopWidth + " " + cs(decks).borderTopColor,
    };
  });

/** …a Ticket in palette P on line `band` (the line being ridden), its stub on the right, or on top on a phone. */
export const ticketModel = (P, band, stub = "right") => ({
  paper: P.raised + " 8px",
  shadow: true,
  notched: true,
  band: "6px solid " + band,
  perforated: true,
  stub,
  score: `"Barlow Condensed" 56px 700 tabular-nums ${P.ink}`,
  title: "20px 600 " + P.ink,
  details: `13px ${P.inkMuted} over 16px 600 tabular-nums ${P.ink}`,
  labelAbove: true,
  again: `btn primary mbtn 44px ${P.signal} ${P.onSignal}`,
  decks: `mbtn 44px rgba(0, 0, 0, 0) 2px ${P.ink}`,
});

/** The Board button and the view's primaries. */
export const boardButton = (page) =>
  page.locator("#quizArea").evaluate((q) => {
    const b = q.querySelector("button.board");
    const cs = getComputedStyle(b);
    return {
      button: b.className + " " + cs.height + " " + cs.borderTopLeftRadius + " " + cs.backgroundColor + " " + cs.color,
      picto: window.__glyph(b.querySelector("svg")) + " " + getComputedStyle(b.querySelector("svg")).width,
      wide: Math.round(b.getBoundingClientRect().width) === Math.round(q.querySelector(".dboard").getBoundingClientRect().width),
      primaries: q.querySelectorAll(".btn.primary").length,
    };
  });

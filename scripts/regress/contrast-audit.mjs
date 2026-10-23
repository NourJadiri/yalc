// contrast-audit.mjs: the text-contrast check the suites run at every screenshot when REGRESS_AUDIT=1.
//
// For every visible run of text it composites the text colour and the backgrounds behind it (colours, opacity) and
// measures the WCAG contrast ratio: 4.5:1 for text, 3:1 for large text (24px, or 18.66px bold); with REGRESS_AUDIT_AAA=1,
// 7:1 and 4.5:1, which Platform's High contrast theme promises. Text in a disabled control is exempt, as WCAG has it. A background drawn by an image or a gradient can't be measured; such text is
// reported as unmeasured rather than passed. Results go to <out>/contrast.jsonl, one line per screenshot.

import fs from "node:fs";
import path from "node:path";

export const AUDIT = process.env.REGRESS_AUDIT === "1";
const AAA = process.env.REGRESS_AUDIT_AAA === "1";

/* Runs in the page. */
const PAGE_AUDIT = (aaa) => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (top, under) => {
    const a = top.a + under.a * (1 - top.a);
    if (!a) return { r: 0, g: 0, b: 0, a: 0 };
    const mix = (k) => (top[k] * top.a + under[k] * under.a * (1 - top.a)) / a;
    return { r: mix("r"), g: mix("g"), b: mix("b"), a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (x, y) => {
    const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p);
    return (a + 0.05) / (b + 0.05);
  };
  const hex = ({ r, g, b }) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const name = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + [...el.classList].slice(0, 3).map((c) => "." + c).join("");
  const page = parse(getComputedStyle(document.documentElement).backgroundColor);
  const canvas = page && page.a ? page : parse(getComputedStyle(document.body).backgroundColor) ?? { r: 255, g: 255, b: 255, a: 1 };

  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue.replace(/\s+/g, " ").trim();
    const el = n.parentElement;
    if (!text || !el || seen.has(el)) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    if (cs.visibility !== "visible" || el.closest("[hidden], [inert]")) continue;
    const box = el.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    if (box.bottom < 0 || box.right < 0 || box.top > innerHeight || box.left > innerWidth) continue;
    if (el.closest("button:disabled, input:disabled, select:disabled, textarea:disabled, [aria-disabled=true]")) continue;
    if (el.closest("svg")) continue;
    let alpha = 1;
    let unmeasured = false;
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      alpha *= Number(s.opacity);
      if (s.backgroundImage !== "none" && !/^url\("?data:image\/svg/.test(s.backgroundImage)) unmeasured = true;
      const bg = parse(s.backgroundColor);
      if (bg && bg.a) layers.push(bg);
      if (bg && bg.a === 1) break;
    }
    if (alpha === 0) continue;
    let bg = canvas;
    for (const l of layers.reverse()) bg = over(l, bg);
    const fg0 = parse(cs.color);
    if (!fg0) continue;
    const fg = over({ ...fg0, a: fg0.a * alpha }, bg);
    const px = parseFloat(cs.fontSize);
    const large = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
    const need = aaa ? (large ? 4.5 : 7) : large ? 3 : 4.5;
    const r = ratio(fg, bg);
    if (unmeasured) out.push({ el: name(el), text: text.slice(0, 40), unmeasured: true });
    else if (r < need) out.push({ el: name(el), text: text.slice(0, 40), fg: hex(fg), bg: hex(bg), ratio: Math.round(r * 100) / 100, need });
  }
  return out;
};

/** Audit what `page` shows now and record it under the screenshot's file name. */
export async function auditContrast(page, out, file) {
  const found = await page.evaluate(PAGE_AUDIT, AAA);
  const fails = found.filter((f) => !f.unmeasured);
  const unmeasured = found.filter((f) => f.unmeasured);
  fs.appendFileSync(path.join(out, "contrast.jsonl"), JSON.stringify({ file, fails, unmeasured: unmeasured.length }) + "\n");
}

import { Marked, type TokenizerAndRendererExtension } from "marked";
import { escapeHtml } from "./escapeHtml";
import { highlightPython } from "./highlightPython";

/* No language, or any spelling of Python: the model's fences are nearly always Python here. */
const PYTHON = /^(py|python3?)?$/i;

/* "line 7", "lines 7-9", "lines 7–9", "lines 7 to 9", "lines 7 and 9". Only digits are captured, and few of them, so nothing else can reach the attributes. */
const LINE_REF = /^lines?\s+([1-9]\d{0,4})(?:(?:\s*[-–]\s*|\s+(?:to|and)\s+)([1-9]\d{0,4}))?(?![\p{L}\p{N}])/iu;

/* The lines she names become buttons, which the window turns into jumps in the editor. This is an inline token, so a code
   span or a fence never reaches it; it declines inside a link, where a button would be a link within a link. */
const lineRefs: TokenizerAndRendererExtension = {
  name: "lineRef",
  level: "inline",
  start: (src) => src.search(/lines?\s+\d/i),
  tokenizer(src, tokens) {
    if (this.lexer.state.inLink) return undefined;
    /* Not the tail of a longer word, as in "outline 7". */
    if (/[\p{L}\p{N}]$/u.test(tokens.at(-1)?.raw ?? "")) return undefined;
    const m = LINE_REF.exec(src);
    if (!m) return undefined;
    const first = Number(m[1]);
    const last = Number(m[2] ?? m[1]);
    return { type: "lineRef", raw: m[0], text: m[0], from: Math.min(first, last), to: Math.max(first, last) };
  },
  renderer: ({ text, from, to }) =>
    `<button type="button" class="asst-line" data-from="${Number(from)}" data-to="${Number(to)}">${escapeHtml(text)}</button>`,
};

/* Its own instance, because `Markdown` passes HTML through and this is model text: raw HTML is escaped, and images are refused because a markdown image is a request that can smuggle data out. */
const answers = new Marked({
  gfm: true,
  breaks: false,
  extensions: [lineRefs],
  renderer: {
    html: ({ text }) => escapeHtml(text),
    image: ({ text }) => escapeHtml(text),
    link({ href, tokens }) {
      const label = this.parser.parseInline(tokens);
      return /^https?:\/\//i.test(href)
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : label;
    },
    code: ({ text, lang }) => {
      const body = PYTHON.test((lang ?? "").trim().split(/\s+/)[0] ?? "") ? highlightPython(text) : escapeHtml(text);
      return `<pre><code>${body}</code></pre>\n`;
    },
  },
});

export const renderAnswer = (markdown: string): string => answers.parse(markdown, { async: false });

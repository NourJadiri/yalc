/** The token kinds of `src/lib/highlightRules.ts`: each is drawn in the palette's `--hl-<kind>`. */
export type TokenKind = "kw" | "str" | "num" | "com" | "fn" | "cls" | "op" | "meta";

export interface Token {
  text: string;
  kind?: TokenKind;
  /** A name being defined, after `def` or `class`. */
  def?: boolean;
}

const KEYWORDS = new Set(
  "and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" ")
);
const CONSTANTS = new Set(["True", "False", "None"]);
const TOKEN = /(#.*)|((?:[rRbBuUfF]{1,2})?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(\d[\w.]*)|([A-Za-z_]\w*)|(@)|([-+*/%=<>!&|^~.]+)/g;

/** Python cut into the runs the editor colours, tagged as its grammar tags them, with untagged text between. By
 *  pattern, because the grammar lives in the lazy workspace chunk and the tabs show code before it loads. */
export function pythonTokens(code: string): Token[] {
  const out: Token[] = [];
  let end = 0;
  let prev = "";
  for (const m of code.matchAll(TOKEN)) {
    const [text, com, str, num, name, at] = m;
    if (m.index > end) out.push({ text: code.slice(end, m.index) });
    end = m.index + text.length;
    if (com) out.push({ text, kind: "com" });
    else if (str) out.push({ text, kind: "str" });
    else if (num) out.push({ text, kind: "num" });
    else if (at) out.push({ text, kind: "meta" });
    else if (!name) out.push({ text, kind: "op" });
    else if (KEYWORDS.has(name)) out.push({ text, kind: "kw" });
    else if (CONSTANTS.has(name)) out.push({ text, kind: "num" });
    else if (prev === "def") out.push({ text, kind: "fn", def: true });
    else if (prev === "class") out.push({ text, kind: "cls", def: true });
    else if (/^[ \t]*\(/.test(code.slice(end))) out.push({ text, kind: "fn" });
    else out.push({ text });
    prev = text;
  }
  if (end < code.length) out.push({ text: code.slice(end) });
  return out;
}

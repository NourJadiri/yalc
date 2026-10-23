import { EditorView } from "@codemirror/view";
import { JUMP_FLASH_MS } from "./jumpLine";

/* Everything reads the app's CSS variables, so the three themes need no branches here. */
export const theme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "var(--ed-bg)", color: "var(--ink)" },
  /* Platform's ring, drawn inside the edge: the pane clips anything outside it. Over the gutter and the lines, under the tooltips. */
  "&.cm-focused": { outline: "2px solid transparent", outlineOffset: "-2px" },
  "&.cm-focused::after": { content: '""', position: "absolute", inset: "0", zIndex: "2", boxShadow: "var(--focus-ring-inset)", pointerEvents: "none" },
  ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.572", overflow: "auto" },
  ".cm-content": { caretColor: "var(--ink)", padding: "var(--space-2) 0 var(--space-8)" },
  ".cm-line": { padding: "0 var(--space-4) 0 var(--space-2)" },
  ".cm-gutters": {
    backgroundColor: "var(--ed-gutter)",
    color: "var(--ink-muted)",
    border: "none",
    borderRight: "var(--hairline) solid var(--rule)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 var(--space-2) 0 var(--space-3)", minWidth: "calc(var(--space-8) + var(--space-1))" },
  ".cm-activeLine": { backgroundColor: "var(--ed-active)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--ed-active)", color: "var(--ink)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "var(--ed-sel) !important" },
  /* base.css sets selected text in on-signal; the editor draws its selection under the text, so code keeps its colours. */
  ".cm-content ::selection, .cm-content::selection": { color: "currentColor" },
  ".cm-selectionBackground": { outline: "var(--stroke-bold) solid var(--ed-sel-edge)", outlineOffset: "calc(-1 * var(--stroke-bold))" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--ink)", borderLeftWidth: "var(--stroke-bold)" },
  ".cm-errline": { backgroundColor: "var(--ed-err)", boxShadow: "inset var(--space-1) 0 0 var(--stop)" },
  /* With animations off (the OS setting) the band stays as it is until jumpLine takes it away. */
  ".cm-jumpline": {
    backgroundColor: "var(--ed-sel)",
    boxShadow: "inset 0 0 0 var(--stroke-bold) var(--ed-sel-edge)",
    animation: `cm-jumpline-fade ${JUMP_FLASH_MS}ms ease-out forwards`,
  },
  "@keyframes cm-jumpline-fade": { from: { backgroundColor: "var(--ed-sel)" }, to: { backgroundColor: "transparent" } },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "var(--surface-sunk)",
    outline: "var(--hairline) solid var(--border)",
  },
  ".cm-nonmatchingBracket, &.cm-focused .cm-nonmatchingBracket": {
    backgroundColor: "var(--stop-wash)",
    outline: "var(--hairline) solid var(--stop)",
  },
  ".cm-selectionMatch": { backgroundColor: "var(--surface-sunk)" },
  ".cm-searchMatch": {
    backgroundColor: "var(--ed-sel)",
    outline: "var(--hairline) solid var(--ed-sel-edge)",
    borderRadius: "calc(var(--radius-sm) / 2)",
  },
  /* The match you are on is lit like a text selection: a signal fill, its words in on-signal over their syntax colours. */
  ".cm-searchMatch.cm-searchMatch-selected, .cm-searchMatch.cm-searchMatch-selected *": {
    backgroundColor: "var(--signal)",
    color: "var(--on-signal)",
  },
  ".cm-foldPlaceholder": {
    margin: "0 var(--space-1)",
    padding: "0 var(--space-1)",
    backgroundColor: "var(--surface-sunk)",
    border: "var(--hairline) solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--ink-muted)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--surface-raised)",
    color: "var(--ink)",
    border: "var(--hairline) solid var(--rule)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-float)",
    overflow: "hidden",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul": { fontFamily: "var(--font-mono)", maxHeight: "16em", padding: "var(--space-1)" },
  ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
    padding: "var(--space-1) var(--space-2) !important",
    borderRadius: "var(--radius-sm)",
    lineHeight: "1.572",
  },
  /* The option the keys are on is the current item: a lit sign square, as Platform marks the current page. */
  ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "var(--sign)",
    color: "var(--on-sign)",
  },
  ".cm-completionIcon": { opacity: "1", color: "var(--ink-muted)" },
  ".cm-completionDetail": { color: "var(--ink-muted)" },
  "li[aria-selected] .cm-completionIcon, li[aria-selected] .cm-completionDetail": { color: "var(--on-sign)" },
  ".cm-completionMatchedText": { textDecoration: "none", fontWeight: "700" },
  ".cm-tooltip.cm-completionInfo": { padding: "var(--space-2) var(--space-3)", font: "var(--t-caption)" },
  ".cm-panels": { backgroundColor: "var(--surface-raised)", color: "var(--ink)" },
  ".cm-panels.cm-panels-top": { borderBottom: "var(--hairline) solid var(--rule)" },
  ".cm-panels.cm-panels-bottom": { borderTop: "var(--hairline) solid var(--rule)" },
  ".cm-panel.cm-search": { padding: "var(--space-1) var(--space-12) var(--space-1) var(--space-3)", font: "var(--t-label)", letterSpacing: "var(--t-label-ls)" },
  ".cm-panel.cm-search input, .cm-panel.cm-search button, .cm-panel.cm-search label": { margin: "var(--space-1) var(--space-2) var(--space-1) 0" },
  ".cm-panel.cm-search label": { display: "inline-flex", alignItems: "center", gap: "var(--space-1)", minHeight: "var(--target-min)", verticalAlign: "middle", fontSize: "inherit", cursor: "pointer" },
  ".cm-panel.cm-search input[type=checkbox]": { width: "var(--space-4)", height: "var(--space-4)", margin: "0", accentColor: "var(--sign)" },
  ".cm-textfield": {
    height: "calc(var(--control-height) - var(--space-2))",
    padding: "0 var(--space-2)",
    border: "var(--stroke-bold) solid var(--border)",
    borderRadius: "var(--radius-sm)",
    backgroundColor: "var(--surface-raised)",
    color: "var(--ink)",
    font: "var(--t-code)",
  },
  ".cm-textfield:focus": { borderColor: "var(--ink)" },
  ".cm-button": {
    height: "calc(var(--control-height) - var(--space-2))",
    padding: "0 var(--space-3)",
    border: "var(--stroke-bold) solid var(--ink)",
    borderRadius: "var(--radius-md)",
    backgroundColor: "transparent",
    backgroundImage: "none",
    color: "var(--ink)",
    font: "var(--t-label)",
    letterSpacing: "var(--t-label-ls)",
    cursor: "pointer",
    transition: "background-color 120ms ease-out",
  },
  ".cm-button:active": { backgroundImage: "none", transform: "translateY(1px)" },
  ".cm-panel.cm-search [name=close]": {
    top: "var(--space-1)",
    right: "var(--space-2)",
    width: "calc(var(--control-height) - var(--space-2))",
    height: "calc(var(--control-height) - var(--space-2))",
    borderRadius: "var(--radius-md)",
    color: "var(--ink)",
    font: "var(--t-subheading)",
    cursor: "pointer",
  },
  "@media (hover: hover)": {
    ".cm-textfield:hover": { borderColor: "var(--ink)" },
    ".cm-button:hover, .cm-panel.cm-search [name=close]:hover": { backgroundColor: "var(--surface-sunk)" },
  },
});

export const fontTheme = (px: number) => EditorView.theme({ "&": { fontSize: px + "px" } });

## Pattern
Interval merging with prefix counts

## Key idea
Each change claims `context` entries on both sides; two windows merge into one hunk exactly when at most `2 * context` kept entries separate their changes.

## Steps
1. Take `diff(a, b)` and record, before each entry, how many lines of `a` and of `b` came earlier.
2. Group the changes: a change joins the current group if at most `2 * context` kept entries separate it from the last.
3. Widen each group by up to `context` entries on each side, stopping at the ends of the diff.
4. Write each hunk's header from the counts (`s` is the lines before it, plus one if `n > 0`), then its entries.

## Cost
`O(n + p·q)` time · `O(n + p·q)` space, all in the diff; the hunks add `O(n)`

## Approach

Pattern: **merging intervals** in one pass, with **prefix counts** for the line numbers.

`unified` calls `diff` unchanged, and the hunks' bodies are its entries. What's new is choosing which entries to show, and numbering them.

**Which entries.** Picture each change claiming a window of `context` entries on each side. A hunk is a maximal stretch of windows that overlap or touch. Two consecutive changes at positions `p < q` of the diff have `q - p - 1` entries between them, all kept. Their windows reach `p + context` and `q - context`, and they touch or overlap when `q - context <= p + context + 1`, that is, when `q - p - 1 <= 2 * context`. That's the statement's rule, and it explains the 2: the gap has to hold both windows.

So walk the changes in order. Extend the current group when the gap is at most `2 * context`, otherwise start a new group. Then widen each group to `lo = max(0, first - context)` and `hi = min(len(d), last + 1 + context)`. Widened groups never overlap, because separate groups are more than `2 * context` apart, and everything they add is kept entries.

**The header.** Count, for every position `k` of the diff, how many entries before it are lines of `a` (`" "` or `"-"`) and of `b` (`" "` or `"+"`). For a hunk `d[lo:hi]`:

- `n1 = before_a[hi] - before_a[lo]` and `n2 = before_b[hi] - before_b[lo]`.
- `before_a[lo]` is the number of the last line of `a` before the hunk, and 0 at the top. If the hunk has lines of `a`, its first one is the next line: `s1 = before_a[lo] + 1`. If it has none, the statement asks for the line before: `s1 = before_a[lo]`. The same goes for `b`.

That second case is the usual unified-diff convention. An insertion with no context, `@@ -2,0 +3,1 @@`, reads "after line 2 of the old file, line 3 of the new file is added".

**How it fits.** `diff` is exactly as in step 1, and so is its cost: the table over the trimmed middles. The hunks are one more linear pass over its output.

## Complexity

The diff costs `O(n + p·q)` as before, for `n` lines in all and middles of `p` and `q` lines. The prefix counts, the grouping and the output each take one pass over the at most `n` entries, so `O(n)` more time and space. One test uses `context = 10^4` on 10^4-line files: checking, for every entry, the `context` entries on each side of it would take about 10^8 steps there. Other sensible ways to group are linear too, and the tests can't tell those apart.

## Pitfalls

- Joining two changes only when fewer than `2 * context` kept entries separate them. With exactly `2 * context` between, the windows touch, and it's one hunk.
- The start number of an empty side. With `n1 = 0`, `s1` is the line before the hunk, not after it, and 0 at the very top: a new file's hunk starts `@@ -0,0 +1,k @@`.
- Counting every entry for both `n1` and `n2`. `n1` skips the `+` entries and `n2` skips the `-` entries.
- Context that runs past the ends of the diff. A change on line 1 has nothing before it.

## Pattern
Three-way merge (diff3)

## Key idea
Lines both diffs keep pin all three files together; between two such anchors, each side either left the chunk alone or changed it, so comparing the three parts decides.

## Steps
1. Diff `base` against each side, and record each base line's partner in `ours` and in `theirs` (`-1` if dropped).
2. If the current base line is an anchor whose partners are the current lines of both sides, output it and advance all three.
3. Otherwise scan to the next anchor; in each file the chunk runs up to it or its partner, or to the end.
4. Resolve the chunk: equal sides give that side, an unchanged side gives the other, anything else a conflict block.
5. Jump all three positions to the anchor and its partners.

## Cost
`O(n + p·q)` time · `O(n + p·q)` space: two diffs, then one linear walk

## Approach

Pattern: **diff3**, the three-way merge that version control is built on.

**Why three files.** With only `ours` and `theirs`, a line that differs could be an edit on either side. `base` breaks the tie: a side that still matches `base` in some region didn't touch it, so the other side's version wins there. Only when both sides differ from `base`, and from each other, is there a real conflict.

**Aligning the files.** The kept entries of `diff(base, ours)` pair lines of `base` with lines of `ours`. Walking that diff with two counters gives `mine[i]`, the index in `ours` of `base[i]`'s partner, or `-1` if ours deleted it. The same for `theirs` gives `yours[i]`. A base line with both partners is an anchor: both sides kept it, so it pins the three files together.

**The walk.** Keep a position in each file: `i`, `j` and `k`.

- If `base[i]` is an anchor with `mine[i] == j` and `yours[i] == k`, nobody changed anything here: output it and advance all three.
- Otherwise scan `q` forward from `i` to the next anchor. The chunk is `base[i:q]`, `ours[j:mine[q]]` and `theirs[k:yours[q]]`, or the rest of each file if no anchor is left. Resolve it, then jump to `(q, mine[q], yours[q])`, where the next round outputs the anchor.

`q` can equal `i`. Then the current base line is an anchor, but a side has inserted lines before it: the base part is empty and the chunk holds just the insertions.

**Resolving.** `A == B`: both sides agree, so take it (this also covers both deleting the same lines). `A == O`: ours didn't touch it, so take `B`. `B == O`: take `A`. Anything else means both changed it differently: a conflict. The three checks can come in any order, as long as all of them come before the conflict.

**Why adjacent edits conflict.** In Example 3, ours changed `two` and theirs changed `three`. Ours kept `three` and theirs kept `two`, but an anchor needs both, so one chunk covers both lines, and both sides changed it. The tool can't know whether the two edits depend on each other, so it asks. One untouched line between the edits is enough for a clean merge.

**Why diff's rules matter here.** The anchors come from the two diffs, so a different shortest diff can give a different merge. With repeated lines, `base = ["y", "x", "y"]`, `ours = ["x", "y", "x"]` and `theirs = ["x", "x", "y", "y"]` merge cleanly to `["x", "x", "y", "y", "x"]` under step 1's rules, and to something else if diff breaks its ties the other way.

**How it fits.** `merge` calls `diff` twice and touches nothing else. `diff` and `unified` are unchanged.

## Complexity

The two diffs cost `O(n + p·q)`, for `n` lines in all and trimmed middles of at most `p` by `q` lines. The partner arrays take one pass over each diff. In the walk, every stable line advances all three positions, every chunk jumps past its lines, and the scan for the next anchor never revisits a base line. Comparing and copying chunk parts costs their total length. So the walk is `O(n)`, and `merge` is `O(n + p·q)` time and space.

## Pitfalls

- Taking ours when both sides changed a chunk. The merge looks clean, and theirs' edit silently disappears.
- Treating every base line both sides kept as stable, without checking that its partners are the current lines of `ours` and `theirs`. Lines that a side inserted just before it get lost or misplaced.
- Forgetting the `A == B` check. Both sides making the same fix is common, and it isn't a conflict.
- Finding partners by searching a list of pairs at every step. That's `O(n^2)` on 10^4-line files; index them by base line instead.

## Pattern
Tree walk with wildcard matching

## Key idea
Walk only the subtree under `path`, and match each file's name greedily with two pointers: on a mismatch, backtrack to the last `*` and let it take one more character.

## Steps
1. Look up `path`: a missing path gives `[]`, and a file there is the only file to check.
2. Walk the subtree with a stack of (full path, name, node), pushing every child of each folder.
3. Keep a file whose size is at least `min_size` and whose name matches the pattern.
4. Sort the kept paths as plain strings before returning them.
5. Match with two pointers; at a `*`, note its place; on a mismatch, go back to it and give it one more character.

## Cost
`O(n * w * p + k log k)` time, `n` entries below `path`, `k` matches · `O(n)` space

## Approach

Two parts: reach the right files, then decide which names match.

**The walk.** Look up `path` with the same walk as every other call. If it's missing, return `[]`. If it's a file, that file is the whole search, checked like any other. Otherwise walk the folder's subtree with a stack. Each entry carries the node, its name and its full path, built by adding `"/" + name` to its parent's path. A file is kept if its stored `size` is at least `min_size` and its name matches. Folders are walked, never listed.

Recursion would work too, since the tree is at most 100 folders deep; the stack just avoids the question.

The order of the walk doesn't matter, because the answer is sorted at the end, and it has to be. Even a walk that visits children in sorted order reaches `/a/x` before `/a-b`, while string order puts `/a-b` first: `-` sorts before `/`.

**The match.** Keep `i` in the name and `j` in the pattern:

- If `pattern[j]` is `*`, remember it (`star = j`) and where the name was (`mark = i`), and step past it. For now it matches nothing.
- Else, if `pattern[j]` is `?` or equals `name[i]`, advance both.
- Else, if a star was seen, backtrack: the star takes one more character (`mark += 1`), and matching resumes right after it (`i = mark`, `j = star + 1`).
- Else the name doesn't match.

When the name runs out, only stars may be left in the pattern.

Why is the last star the only one worth going back to? Once the part of the pattern before it has matched, its earliest match is the best one: the last star can absorb whatever lies between, so pushing the earlier parts further right can only leave less name for the rest. That's why each failure moves only the last star.

`fnmatch.fnmatchcase(name, pattern)` gives the same answers. It translates the pattern into a regular expression: `?` becomes `.`, other characters are escaped, each `*` followed by a fixed piece becomes `(?>.*?piece)`, and a final `*` becomes `.*`. The atomic group `(?>...)` takes the earliest match of the piece and never backtracks into it, the same insight as above. The compiled expression is cached, and `re` does the matching. It also reads `[...]` as a set of characters, which can't occur here. Without the atomic groups, a translation of `*` to `.*` lets Python's backtracking regex engine try every split.

## Complexity

The walk visits each of the `n` entries below `path` once. Each match costs `O(w * p)` at worst, for a name of `w` characters and a pattern of `p` (both at most 20), and close to `O(w)` when the stars don't force much backtracking. Sorting `k` matches is `O(k log k)` comparisons. Space: the stack and the answer, `O(n)`.

The walk itself can't be beaten: every file under `path` has to be looked at, so no slower approach can be timed apart there. The large tests check two other things. One calls `find` 5,000 times on small folders of a 12,200-entry tree: walking only the subtree costs a few entries per call, while scanning every file in the system costs all 12,200. The other matches ten-star patterns against 200 names of 20 characters: the two-pointer match settles each name in a few dozen steps, while a recursive matcher that tries every split for every star needs millions of calls. A regular expression with `.*` for each star backtracks the same way, but `re` does it in C and gets through this test in time, so the test can't tell it apart.

## Pitfalls

- A `*` that can't match nothing: `app*.log` must match `app.log`.
- Forgetting that `path` may be a file. Then it's the only candidate, matched by its own name.
- Returning the walk's order. Sort the paths as strings: `/a-b` comes before `/a/x`.
- Translating the pattern to a regular expression without escaping `.`, so that `a.b` also matches `axb`.
- Listing folders whose names match. Only files are listed.

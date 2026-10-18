## Pattern
Backtracking

## Key idea
Build left to right, adding `(` while fewer than `n` are used and `)` only while an unmatched `(` exists, so every finished string is balanced.

## Steps
1. Write `backtrack(opened, closed)` to extend one shared `path`, with an `out` list for finished strings.
2. When `closed == n`, the string is complete: record `"".join(path)` and return.
3. If `opened < n`, append `(`, recurse, then pop it.
4. If `closed < opened`, append `)`, recurse, then pop it.
5. Start with `backtrack(0, 0)` and return `out`.

## Cost
`O(4^n / sqrt(n))` time · `O(n)` extra space

## Approach

Build the string one character at a time, and only ever make a move that can still end in a balanced string. Two counters say which moves those are.

```
backtrack(opened, closed):
    if closed == n:
        record "".join(path)
        return
    if opened < n:                   # an opener is still available
        path.append("(")             # choose
        backtrack(opened + 1, closed)   # explore
        path.pop()                   # un-choose
    if closed < opened:              # there's an open "(" to match
        path.append(")")
        backtrack(opened, closed + 1)
        path.pop()
```

The two conditions *are* the pruning, and they are exactly right:

- **Nothing invalid is built.** `closed < opened` keeps every prefix from closing more than it opened, and `opened < n` stops at `n` openers. When `closed == n`, also `opened == n`, so the string is complete and balanced.
- **Nothing valid is missed.** Every prefix of a balanced string satisfies both conditions, so the search can follow any balanced string character by character.

Every leaf of the search is an answer, and every internal node lies on the way to at least one. That is the difference from the brute force, which builds all `2^(2n)` strings of `(` and `)` and filters them: at `n = 10` it checks over a million strings to keep 16,796.

## Complexity

There are Catalan(`n`) `= C(2n, n) / (n + 1)` balanced strings, about `4^n / (n^1.5 · sqrt(pi))`. Each takes `O(n)` to write out, and since no branch is a dead end, the total is `O(4^n / sqrt(n))` time. Extra space is `O(n)` for the path and the recursion.

## Pitfalls

- `closed < n` instead of `closed < opened`: produces strings like `")("` that close before opening.
- Stopping at `opened == n` and forgetting that the `)` still have to be added.
- Generating every string and filtering: correct, but `2^(2n)` candidates.

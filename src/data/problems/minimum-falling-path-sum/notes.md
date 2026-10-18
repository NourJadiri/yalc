## Pattern
Dynamic programming (2D grid)

## Key idea
A cell's cheapest path total is its value plus the smallest total among the up-to-three cells above it, so each row needs only the row above.

## Steps
1. Keep `best[c]`, the cheapest path ending in column `c` of the row just processed; start it as a copy of the top row.
2. For each row below the first, rebuild `best` from the row above.
3. Each new `best[c]` is `row[c]` plus the minimum of the entries above-left, above and above-right, clipped at the grid's edges.
4. Return the minimum of `best` over the whole last row.

## Cost
`O(n^2)` time · `O(n)` space

## Approach

A DP over rows. A path to row `r` is a path to row `r - 1` plus one step, and the earlier part of the path matters only through its cost.

**Subproblem.** `best[r][c]` = the smallest sum of a falling path that starts anywhere in the top row and ends at `(r, c)`.

**Recurrence.** `best[r][c] = matrix[r][c] + min(best[r-1][c-1], best[r-1][c], best[r-1][c+1])`, using only the neighbours that exist. At the edges there are two.

**Base case.** `best[0][c] = matrix[0][c]`: every top cell starts a path.

**Fill order.** Row by row from the top. Within a row any order works, since a row reads only the row above. The answer is `min(best[n-1])`.

**Why not greedy.** Choosing the smallest next cell commits to a column without seeing what lies below it. In Example 1, starting from the smallest top cell (`2`) leaves only the expensive right side of the middle row. The best path starts from the `3`.

**Space.** Row `r` reads only row `r - 1`, so keep one list of `n` values and rebuild it each row: `O(n)` space. Overwriting `matrix` in place gets it to `O(1)` extra, at the cost of destroying the input.

**Top-down.** `go(r, c)` = the cheapest way down from `(r, c)` to the bottom, which is `matrix[r][c] + min(go(r+1, c-1), go(r+1, c), go(r+1, c+1))`, memoised; the answer is `min(go(0, c))`. It has the same `O(n^2)` states and recurses `n` calls deep. Without the memo it re-explores shared suffixes: `O(3^n)`.

## Complexity

`O(n^2)` time: `n^2` cells, at most three lookups each. `O(n)` extra space for the rolling row.

## Pitfalls

- Indexing `c - 1` at column 0 without a bounds check. Python reads column `-1`, the *last* column, so the path silently wraps around the grid.
- Starting from the smallest top cell, or stepping greedily.
- Returning one entry, or the top row's minimum, instead of the minimum over the whole last row.

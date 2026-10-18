## Pattern
Dynamic programming (two strings)

## Key idea
Look at the last characters: a match costs nothing and shrinks both prefixes; a mismatch needs one replace, delete or insert, so take the cheapest of the three.

## Steps
1. Define `d[i][j]` as the fewest edits turning `word1[:i]` into `word2[:j]`; keep only the previous row.
2. Start row 0 as `0..n`: building `word2[:j]` from nothing takes `j` inserts.
3. For each `i`, start a new row at `i` (delete all `i` characters), then fill it for `j` from `1` to `n`.
4. If the last characters match, copy the diagonal (`prev[j - 1]`); otherwise take `1 +` the cheapest of replace, delete and insert.
5. Make `cur` the previous row; after the last row, return `prev[n]`.

## Cost
`O(m · n)` time · `O(n)` space: two rows over `word2` (make it the shorter word for `O(min(m, n))`)

## Approach

The classic two-string DP: Levenshtein distance. Look at the **last character** of each prefix and ask what the final edit does to it.

**Subproblem.** `d[i][j]` = the fewest edits that turn `word1[:i]` into `word2[:j]`.

**Recurrence.** If `word1[i-1] == word2[j-1]`, the last characters already agree and `d[i][j] = d[i-1][j-1]`. Otherwise some edit has to fix the last position, and there are exactly three kinds:

- replace `word1[i-1]` with `word2[j-1]`: `1 + d[i-1][j-1]`
- delete `word1[i-1]`: `1 + d[i-1][j]`
- insert `word2[j-1]` at the end: `1 + d[i][j-1]`

so `d[i][j] = 1 + min(d[i-1][j-1], d[i-1][j], d[i][j-1])`.

Taking the diagonal for free when the characters match is safe. Neighbouring entries differ by at most one, so `d[i-1][j-1] <= d[i-1][j] + 1` and `d[i-1][j-1] <= d[i][j-1] + 1`: keeping a match is never worse than editing around it.

**Base cases.** `d[i][0] = i` (delete all `i` characters) and `d[0][j] = j` (insert all `j`).

**Fill order.** Row by row, left to right, since each entry needs the one above, the one to its left and the diagonal. Only the previous row is ever read, so two rows are enough: `O(n)` space, or `O(min(m, n))` if you make the shorter word the columns. One row plus a saved diagonal value also works.

**Top-down.** `d(i, j)` on suffixes: compare `word1[i]` with `word2[j]` and recurse into the same three edits, memoised on `(i, j)`, with `d(m, j) = n - j` and `d(i, n) = m - i`. It has the same `O(m·n)` states and recurses up to `m + n` calls deep. Without the memo it branches three ways per step, which is exponential.

## Complexity

`O(m·n)` time: one constant-time step per table entry, 250,000 at the limits. `O(min(m, n))` space with rolling rows, or `O(m·n)` if you keep the full table to reconstruct the edits.

## Pitfalls

- Leaving out replacement. With only inserts and deletes you get `m + n - 2·LCS`, which charges two edits for every substituted letter: Example 2 would come out as 4.
- Starting row 0 and column 0 at zero instead of `j` and `i`.
- Mixing table and string indices: `d[i][j]` compares `word1[i-1]` with `word2[j-1]`.

## Pattern
Dynamic programming (longest common subsequence)

## Key idea
Walking forward, a delete is allowed exactly when it doesn't lower the LCS length of what's left, so tabulate LCS lengths of suffixes, not prefixes.

## Steps
1. Trim the longest shared top, then the longest shared bottom of what's left; both are kept.
2. Fill `L[i][j]`, the LCS length of the middles' suffixes `x[i:]` and `y[j:]`, from the bottom-right corner.
3. Start the output with the shared top, then walk the middles from the top, keeping matching lines.
4. Otherwise delete `x[i]` if `L[i + 1][j] == L[i][j]`, else add `y[j]`.
5. Close with the shared bottom as kept lines.

## Cost
`O(n + p·q)` time · `O(n + p·q)` space, for `n` lines in all and middles of `p` and `q` lines

## Approach

Pattern: the **LCS table**, read forward.

**Why LCS.** The kept lines of any diff appear in both files, in order: they form a common subsequence. The `-` entries are the other lines of `a`, the `+` entries the other lines of `b`. A diff that keeps `k` lines therefore has `len(a) + len(b) - 2k` changes, and a shortest diff is one that keeps a longest common subsequence.

**The trim.** When both files start with the same line, some shortest diff keeps that pair. (Take any LCS. If it doesn't pair the two first lines, it uses at most one of them; swap that pair for this one and it's no shorter.) So keep matching tops while they last, then do the same at the bottom of what's left. Rule 1 asks for exactly this, in this order: for `a = ["s", "s"]` and `b = ["s"]` the top goes first, giving `[" s", "-s"]`, not `["-s", " s"]`. The trim is also what makes the constraints work: the table only has to cover the middles, at most 500 by 500.

**The table.** The walk goes forward, so at position `(i, j)` of the middles `x` and `y` it needs to know how many lines it can still keep from `x[i:]` and `y[j:]`. That's `L[i][j]`, the LCS length of the two suffixes:

- `L[m][j] = L[i][n] = 0`: an empty suffix shares nothing.
- If `x[i] == y[j]`: `L[i][j] = L[i + 1][j + 1] + 1`.
- Otherwise: `L[i][j] = max(L[i + 1][j], L[i][j + 1])`.

Each cell reads the cell below, to the right, and diagonally below-right, so fill from the bottom-right corner: rows from `m - 1` up to `0`, each row right to left.

**The walk.** At `(i, j)`:

- If `x[i] == y[j]`, keep the line. Matching heads always belong to some LCS (the same swap argument), so this never costs anything.
- Otherwise, deleting `x[i]` leaves `L[i + 1][j]` lines still to keep. If that equals `L[i][j]`, the diff can still end up shortest, and rule 2 says delete. If not, then `L[i][j + 1] == L[i][j]`, so adding `y[j]` is safe.
- When `x` is used up, add the rest of `y`. When `y` is used up, `L[i + 1][n] == L[i][n] == 0`, so the same test deletes the rest of `x`.

**Why not the textbook backtrack?** The usual LCS reconstruction fills a prefix table and walks back from the bottom-right corner. It finds a shortest diff too, but it makes its choices from the end, so its ties come out differently: often a replace in the wrong order, or a different copy of a repeated line kept. Rule 2 decides from the top, and only a table over suffixes answers its question.

## Complexity

The trims and the output cost `O(n)` for `n` lines in all. The table has `(p + 1)(q + 1)` cells for middles of `p` and `q` lines, each filled in constant time, and the walk takes at most `p + q` steps. That's `O(n + p·q)` time and space, about 250,000 cells at the limits. Without the trim, two 10^4-line files would need 10^8 cells: far too slow, and too big. Two rolling rows would give the LCS length in `O(q)` space, but the walk needs the whole table (or Hirschberg's divide and conquer).

## Pitfalls

- Breaking a tie by adding first. The result is still a shortest diff, but a replaced line comes out as `+new`, `-old`.
- Trimming only the top, or the bottom before the top. Either can change which copy of a repeated line is kept, and a missing bottom trim leaves a table too big for the time limit.
- Backtracking a prefix table from the end: the right number of changes, the wrong ties.
- Forgetting the edges of the walk: once one middle is used up, the rest of the other is all deletes or all adds.

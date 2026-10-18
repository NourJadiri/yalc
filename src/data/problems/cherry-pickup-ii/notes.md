## Pattern
Dynamic programming (row by row)

## Key idea
Both robots drop one row per step, so they can only meet in the same row; track the best total for each pair of columns, row by row.

## Steps
1. Let `best[a][b]` be the most cherries with A in column `a` and B in column `b`; only the starting pair `(0, cols - 1)` is reachable at first.
2. Go down one row at a time, filling a fresh table `nxt` for each pair with `a <= b` (the robots never need to cross).
3. For each pair, take the best `prev` among the up to nine pairs the robots could have come from; skip the pair if none was reachable.
4. Add this row's cherries for A and B, counting a shared cell once.
5. Return the largest entry in the last table.

## Cost
`O(rows · cols^2)` time · `O(cols^2)` space

## Approach

The robots interact only when they stand on the same cell, and that can only happen in the same row at the same moment, since both move down exactly one row per step. So process the rows top to bottom, and for each row keep the best total for every *pair* of columns.

**Subproblem.** `dp[r][a][b]` = the most cherries the two robots can have collected in rows `0..r`, ending with robot A in column `a` and robot B in column `b`.

**Recurrence.** `dp[r][a][b] = gain(r, a, b) + max(dp[r-1][a'][b'])` over `a' ∈ {a-1, a, a+1}` and `b' ∈ {b-1, b, b+1}` inside the grid. Here `gain(r, a, b) = grid[r][a] + grid[r][b]` when `a != b`, and just `grid[r][a]` when they share the cell.

**Base case.** Row 0 has exactly one reachable state, `dp[0][0][cols-1] = grid[0][0] + grid[0][cols-1]`. Mark every other pair unreachable with `-1` (cherry counts are never negative, so any real total beats it) or `-inf`. Alternatively, run the recurrence bottom-up from the last row, where every state is a valid base case, and read off `dp[0][0][cols-1]`.

**Fill order.** Row by row. Each layer reads only the one before it, so two `cols × cols` tables are enough. The answer is the maximum over the last layer.

**Symmetry.** The robots never need to cross. If their routes would cross, swap the rest of their routes at the crossing: each row's visited cells are unchanged, so the total is too. So you only need to track `a <= b`, which halves the work.

**Why not one robot at a time.** Sending A along its best route, clearing those cells, then sending B can be strictly worse. A's route may grab the one cell B needed, when A had an equally good alternative that left it alone.

**Top-down.** `go(r, a, b)` = the best total from row `r` down, `gain(r, a, b) + max(go(r+1, a', b'))`, memoised on `(r, a, b)`; the answer is `go(0, 0, cols-1)`. It has the same `rows · cols^2` states and recurses only `rows` calls deep.

## Complexity

`O(rows · cols^2 · 9)` time, about 3 million steps at 70 × 70 and half that with `a <= b`. `O(cols^2)` space for two layers.

## Pitfalls

- Counting a shared cell twice: Example 2 comes out as 24.
- Starting the robots anywhere in the top row, or treating unreachable pairs as `0`. Either way a robot can collect from a cell it can't get to in time.
- Planning the robots one after the other.

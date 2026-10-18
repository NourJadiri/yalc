## Pattern
Union-find

## Key idea
Land never sinks, so islands only merge: add `1` for new land and subtract `1` for each union that really joins two sets.

## Steps
1. Set up union-find over land cells only, keyed by `r * n + c`: dictionaries `parent` and `size`, and a `find` that halves paths.
2. For each position, compute the cell id `r * n + c`; if that cell is already land, change nothing.
3. Otherwise make it a one-cell set and add `1` to the running count `islands`.
4. For each of its four neighbours that is on the grid and already land, `find` both roots; if they differ, union the sets and subtract `1`.
5. After every position, append `islands` to the answer list `counts`, and return `counts` at the end.

## Cost
`O(k · α(m · n))` time for `k` positions · `O(min(k, m · n))` space

## Approach

Islands only ever merge — land never sinks — so this is union-find, processed online. Give every land cell an id (`r * n + c`) and keep a disjoint-set forest over the land cells seen so far. Each set is one island, and the answer after a step is just the number of sets, maintained as a running counter:

1. If the cell is already land, nothing changes: record the same count again.
2. Otherwise make it land as a set of its own: `islands += 1`.
3. For each of its four neighbours that is land, `find` both roots. If they differ, union them and `islands -= 1` — two islands just became one. If they're the same, the neighbour already belongs to this cell's island (through another neighbour merged a moment ago) and nothing happens.

Step 3's "only on a real merge" is the whole correctness argument: the counter changes exactly when the number of sets changes. A cell can touch up to four land cells that already form fewer than four islands — a ring closing, or two arms of one island — and counting neighbours instead of merges over-subtracts.

`find` uses path halving and `union` attaches the smaller set under the larger, which keeps every tree shallow.

## Complexity

`O(k · α(m·n))` time for `k` positions — at most four unions and eight finds per step, each effectively constant — and `O(min(k, m·n))` space, since only cells that have become land are stored (a dictionary keyed by cell id, so nothing is allocated for open ocean). Re-flooding the grid after every step would be `O(k · m · n)`: `10^8` at the limits.

## Pitfalls

- Subtracting one per land neighbour rather than per successful union.
- Forgetting repeats: a second eruption on the same cell must not add an island (Example 2).
- `if parent.get(cell):` as a "already land?" test — cell id `0` is falsy. Test membership with `in`.
- Diagonal cells don't touch; only the four orthogonal neighbours count, and each must be range-checked before computing its id (`r * n + c` wraps around the row edge otherwise).

## Pattern
Backtracking

## Key idea
Every node of the search tree is a subset, and letting each child add only a later element builds every subset exactly one way.

## Steps
1. Keep `out` for the finished subsets and one shared `path` for the subset being built.
2. At each call, record a copy of `path` (`path[:]`): every node of the search tree is a subset.
3. For each index `i` from `start` on: append `nums[i]`, recurse from `i + 1` so only later elements follow, then pop it.
4. Start with `backtrack(0)` and return `out`.

## Cost
`O(n · 2^n)` time, the size of the output · `O(n)` space

## Approach

Every element is either in or out, so there are `2^n` subsets. Backtracking generates them as a tree in which every node *is* a subset, and each child extends its parent by one element that comes **later** in `nums`.

```
backtrack(start):
    record path[:]                  # every node is an answer
    for i in range(start, n):
        path.append(nums[i])        # choose
        backtrack(i + 1)            # explore: only later elements
        path.pop()                  # un-choose
```

The `start` index is the structural pruning. Subsets are unordered, so `[5,7]` and `[7,5]` are one answer; forcing every path to take elements in index order gives each subset exactly one way to be built. That is the whole correctness argument: list a subset's elements in index order and you have the unique path to it in this tree. There is no explicit base case either. The recursion stops when the loop runs out, and the empty path at the root is the empty subset, recorded first.

Two other ways to say the same thing, both worth having ready:

- **Include or exclude:** `go(i)` either skips `nums[i]` or takes it, and records at `i == n`. A binary decision tree with `2^n` leaves.
- **Bitmasks:** for `mask` in `0 .. 2^n - 1`, the subset is every `nums[i]` whose bit `i` is set. No recursion and easy to reason about; like every version, it is limited by the output, not the method.

And an iterative one: start from `[[]]`; for each number, add a copy of every subset so far with that number appended.

## Complexity

`2^n` subsets of average size `n / 2`: `O(n · 2^n)` time, the size of the output itself. Extra space is `O(n)` for the path and the recursion.

## Pitfalls

- Recording only after adding an element: the empty subset goes missing.
- Looping from `0` instead of from `start`: the same subset comes back in many orders (or the recursion never ends).
- Appending `path` instead of a copy: every answer ends up as the same list, empty by the time you return.

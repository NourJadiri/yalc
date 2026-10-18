## Pattern
Backtracking

## Key idea
Fill the slots left to right, offering every unused element at each slot; undo each choice afterwards so the next branch starts from the same state.

## Steps
1. Keep the permutation so far in `path`, and a `used` flag for each element.
2. When `path` holds all `n` elements, record a copy of it and return.
3. Otherwise loop over `nums`, skipping each element that is already `used`.
4. Choose `x` (set `used[i]`, append it), recurse for the next slot, then undo both changes.
5. Call `backtrack()` once to start from an empty `path`, and return `out`.

## Cost
`O(n · n!)` time · `O(n)` space besides the output

## Approach

Fill `n` slots from left to right. For the next slot, every element not used yet is a choice.

```
backtrack():
    if len(path) == n:
        record path[:]
        return
    for i in range(n):
        if used[i]: continue                      # prune: already placed
        used[i] = True; path.append(nums[i])      # choose
        backtrack()                               # explore
        path.pop(); used[i] = False               # un-choose
```

The un-choose step has to undo *both* pieces of state. Forget to clear `used[i]` and that element stays reserved for every later branch, so you get one permutation and nothing else.

Why it's correct: a permutation is a sequence of slot choices that uses each element exactly once. The loop offers every unused element at every slot, so every permutation gets built; two different permutations differ at their first differing slot, so none is built twice.

The **swap** variant does the same thing in place. At depth `k`, the prefix `nums[:k]` is what has been chosen and the suffix is the pool still available. Swap each `nums[i]` with `i >= k` into position `k`, recurse on `k + 1`, then swap back. No `used` array is needed. The swap back is the un-choose step and is not optional: skip it and the next branch starts from a scrambled array, so some orders repeat while others never appear.

## Complexity

There are `n!` permutations, each copied in `O(n)`. The internal nodes of the search tree add only a constant factor, since there are fewer than `e · n!` of them. `O(n · n!)` time in total and `O(n)` extra space besides the output.

## Pitfalls

- Not undoing everything on the way back: `used[i]`, or the swap.
- Testing "used" with `x in path`: fine for distinct numbers, but `O(n)` per check, and wrong the moment duplicates are allowed.
- Recording `path` itself instead of a copy.

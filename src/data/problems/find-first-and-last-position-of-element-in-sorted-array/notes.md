## Pattern
Binary search

## Key idea
Search for boundaries, not values: the first index with `nums[i] >= x` is the run's start for `target`, and one past its end for `target + 1`.

## Steps
1. Write `lower(x)`: binary search for the first index whose value is `>= x`, keeping the answer inside `[lo, hi]` with `hi = len(nums)`.
2. Loop while `lo < hi`: if `nums[mid] < x`, set `lo = mid + 1`; otherwise set `hi = mid`.
3. Take `first = lower(target)`; if it is past the end or `nums[first] != target`, return `[-1, -1]`.
4. The run ends just before the first value `>= target + 1`, so return `[first, lower(target + 1) - 1]`.

## Cost
`O(log n)` time · `O(1)` space

## Approach

An ordinary binary search stops at the first copy of `target` it lands on, which could be anywhere inside the run. We want the run's two ends, so search for **boundaries**, not values.

Define `lower(x)`: the first index whose value is `>= x`, or `len(nums)` if no value is. Along a sorted list, the question "is `nums[i] >= x`?" answers `no, no, …, no, yes, yes, …` — and binary search finds the first `yes`:

- keep the answer inside `[lo, hi]`, starting with `lo = 0, hi = len(nums)` (the answer may be "past the end");
- if `nums[mid] < x`, `mid` and everything left of it say `no`: `lo = mid + 1`;
- otherwise `mid` says `yes` and might be the first: `hi = mid`;
- when `lo == hi`, that's the answer.

Then:

- `first = lower(target)`. If that's past the end, or `nums[first] != target`, the target is absent: `[-1, -1]`.
- `last = lower(target + 1) - 1`. The run ends just before the first value bigger than `target`, and for integers "bigger than `target`" is exactly "`>= target + 1`".

Why the loop is right: the answer starts inside `[lo, hi]`; each branch throws away only indices proven to be `no`, or indices after a proven `yes`; and the range shrinks every step. So it ends, with `lo == hi` sitting on the first `yes`.

In Python, `bisect_left(nums, target)` and `bisect_right(nums, target) - 1` compute the same two numbers. Mention them, but be ready to write the loop — that's what's being tested.

## Complexity

Two binary searches: `O(log n)` time no matter how long the run is. `O(1)` extra space.

## Pitfalls

- Finding one copy, then expanding left and right: correct, but `O(n)` when the target fills the list.
- Returning `lower(target + 1)` without the `- 1`: that's the first index *past* the run.
- Reading `nums[first]` before checking `first < len(nums)`: when `target` is bigger than everything, or the list is empty, `lower` returns `len(nums)`.

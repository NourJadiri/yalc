## Pattern
Binary search

## Key idea
Compare `nums[mid]` with its right neighbour: rising guarantees a peak to the right, falling guarantees one at `mid` or to its left, so you can always discard half.

## Steps
1. Start with the whole index range: `lo = 0` and `hi = len(nums) - 1`.
2. While `lo < hi`, compare `nums[mid]` with `nums[mid + 1]` (it exists, since `mid < hi`).
3. If it rises, a peak lies to the right: set `lo = mid + 1`.
4. Otherwise it falls, so `mid` or something left of it is a peak: set `hi = mid`, not `mid - 1`.
5. When `lo == hi`, that one index is a peak: return it.

## Cost
`O(log n)` time · `O(1)` space

## Approach

Binary search on the *slope*, not on a value. Compare `nums[mid]` with its right neighbour:

- **Rising** (`nums[mid] < nums[mid + 1]`): walk right from `mid + 1`. Either the values keep rising all the way to the last entry, which is then a peak because the right edge counts as minus infinity, or they fall somewhere, and the top of that climb is a peak. Either way there's a peak in `[mid + 1, hi]`, so set `lo = mid + 1`.
- **Falling** (`nums[mid] > nums[mid + 1]`): by the mirror argument there's a peak in `[lo, mid]`, possibly `mid` itself, so set `hi = mid`, not `mid - 1`.

The invariant: the range `[lo, hi]` is always entered by a rising step (or `lo` is index 0) and left by a falling step (or `hi` is the last index). Any range with that shape contains a peak, because its highest entry must beat both of its neighbours. Both updates preserve the shape, so when `lo == hi`, the one index left is a peak.

Inside the loop, `lo < hi` means `mid < hi`, so `nums[mid + 1]` always exists.

## Complexity

`O(log n)` time, since the range halves at every step. `O(1)` extra space.

## Pitfalls

- `hi = mid - 1` on a falling step. `mid` might be the peak itself, and skipping it can leave a range with no peak in it.
- Forgetting that the ends can be peaks. With minus infinity outside, a strictly increasing array peaks at its last index, and a decreasing one at index 0.
- Padding the array with `-2^31` as a stand-in for minus infinity. That's a legal value: `[-2147483648]` on its own is a peak, but it doesn't beat a sentinel equal to itself. Use `float("-inf")`, or skip the padding entirely as the binary search does.

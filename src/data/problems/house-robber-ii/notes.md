## Pattern
Dynamic programming

## Key idea
Any valid plan leaves house `0` or house `n - 1` alone, so the answer is the better of two straight-street problems: `nums[:-1]` and `nums[1:]`.

## Steps
1. Write `rob_line(houses)` for a straight street: track `take` and `skip`, the best totals with the previous house robbed or left alone, both starting at `0`.
2. For each house worth `cash`, set `take, skip = skip + cash, max(take, skip)`: rob it only if the previous house was skipped.
3. If there is only one house, return `nums[0]`: it has no neighbours, and both streets below would be empty.
4. Return the better of `rob_line(nums[:-1])` and `rob_line(nums[1:])`: each street leaves out one house of the wrap-around pair.

## Cost
`O(n)` time · `O(1)` space, plus `O(n)` for the two slices

## Approach

Start from the straight street (House Robber I), then deal with the one thing the circle adds.

**The line version.** Let `dp[i]` be the most money you can take from the first `i` houses of a straight street. For house `i - 1` you either skip it, keeping `dp[i - 1]`, or rob it, which rules out house `i - 2` and gives `dp[i - 2] + nums[i - 1]`. So:

- **Recurrence:** `dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])`
- **Base cases:** `dp[0] = 0` (no houses), `dp[1] = nums[0]`
- **Fill order:** `i` upward; the answer is `dp[n]`.

Each step reads only the two entries before it, so two variables replace the table. The reference names them by meaning: `take` is the best total with the previous house robbed, `skip` the best with it left alone. Adding a house worth `cash` gives `take' = skip + cash` (you may rob it only if the previous one was skipped) and `skip' = max(take, skip)`.

Top-down, the same recurrence is `best(i) = max(best(i + 1), nums[i] + best(i + 2))` with `@cache` — at most 100 frames deep here.

**The circle.** Exactly one new constraint appears: houses `0` and `n - 1` can't both be robbed. So every valid plan falls into at least one of two cases:

1. House `n - 1` is left alone. The wrap-around pair can't be violated, so the plan is simply a valid plan for the straight street `0..n-2`.
2. House `0` is left alone — a valid plan for the straight street `1..n-1`.

Conversely, a plan for either straight street is valid on the ring, because it leaves one end of the wrap-around pair untouched. The cases overlap (plans that skip both ends), which is harmless when you take a maximum. So the ring's answer is `max(line(nums[:-1]), line(nums[1:]))`.

The split mishandles exactly one input: with `n = 1` both streets are empty and the formula returns 0, though a lone house has no neighbours. Handle it first.

## Complexity

`O(n)` time — two linear passes. `O(1)` extra space for the DP itself; the slices `nums[:-1]` and `nums[1:]` copy `O(n)`, which passing index bounds instead would avoid.

## Pitfalls

- Running the line version on the whole ring: it happily robs both house 0 and house `n - 1` (`[9,1,1,9]` gives 18 instead of 10).
- Forgetting `n = 1`.
- Taking every other house — all even indices or all odd ones. `[5,1,1,5,1,1]` wants houses 0 and 3 for 10; either alternation gives 7.

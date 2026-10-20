## Pattern
Fixed windows anchored at subscription

## Key idea
Periods are fixed windows anchored at the subscription: jump to the one holding `t` with integer division, and reset usage only when the window moves.

## Steps
1. Keep the plans by name, and per subscribed client `[quota, period, start of its current period, used]`.
2. In `subscribe`, refuse an unknown plan; otherwise start a fresh period at `t` with nothing used, replacing any old one.
3. `remaining` brings the period up to date and returns `quota - used`, or `-1` for a client without a plan.
4. In `allow`, after the token and slot checks, refuse if `used + cost > quota`; when everything passes, charge the tokens and add `cost` to `used`.
5. To bring a period up to date at `t`, move its start forward by `(t - start) // period * period`, and reset `used` if it moved.

## Cost
`O(L)` amortized time per call for `L` limits · `O(k * L + r + p)` space for `p` plans

## Approach

Plans add a third check to the same all-or-nothing decision: tokens, a slot, and now quota. `start` is still an `allow` that keeps its slot, so it gets the quota check for free.

**Billing state.** A plan is a `(quota, period)` pair. A subscribed client needs four numbers: its plan's `quota` and `period`, the start of its current period, and `used`, the characters charged in it. `subscribe` writes all four, with the period starting at `t` and `used = 0`. An unknown plan name changes nothing, so check it before touching the client.

**Anchored periods.** Periods run back to back from the subscription time `a`: `[a, a + P)`, `[a + P, a + 2P)`, and so on. The one holding `t` starts at `a + (t - a) // P * P`. Keep the current period's start and, when the client is touched at a later `t`, move it forward by `(t - start) // P * P`. It stays a whole number of periods away from `a`. If it moved, at least one boundary has passed, so `used = 0`. Two easy mistakes live here. Starting the next period at the first request after a boundary makes the periods drift later and later, which is what Example 2 catches. Stepping forward one period at a time gets the right answer, but a client that is idle for a long time on a short period costs millions of steps.

**The check.** In `allow`, after the token and slot checks pass, bring the period up to date and refuse if `used + cost > quota`. Only when all three pass are the tokens charged and `cost` added to `used`. A refusal by any check takes nothing from the others. Streams pay at the start, so `finish` and timeouts never touch `used`.

## Complexity

The quota adds `O(1)` per call to step 3's `O(L)` amortized: one dictionary lookup and some arithmetic. Space grows by `O(1)` per subscribed client and per plan. Numbers stay below `2 * 10^9`.

## Pitfalls

- Period drift: starting the next period at the first request after the boundary instead of at `anchor + k * period`.
- Stepping through idle periods one by one. A 1 ms period and a gap of `10^9` ms is a billion steps.
- Charging the quota for a request that the bucket or the slot check refuses, or taking tokens for one the quota refuses.
- Refunding a stream's characters when it finishes early or times out.

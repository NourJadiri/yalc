## Pattern
Two-phase check, then commit

## Key idea
Refill every limit's bucket, then check them all before charging any: a request is charged `cost * interval` credit everywhere or nowhere.

## Steps
1. Keep the limits in a list as `(capacity * interval, interval)`; the constructor's limit goes first and `add_limit` appends.
2. On a request, refill each of the client's levels by `t - last`, each capped at its own full level.
3. If any level is below `cost * interval` for its limit, return `False` without charging anything.
4. Otherwise subtract `cost * interval` from every level and return `True`.

## Cost
`O(L)` time per call for `L` limits · `O(k * L)` space for `k` clients

## Approach

Step 1's bucket stays as it was: credit in milliseconds, refilled lazily from the elapsed time. Two things change.

**A cost.** A request for `cost` tokens needs `cost * interval` ms of credit instead of `interval`. For a single limit, that is the whole change. A cost above `capacity` needs more than a full bucket, so it is refused forever, and nothing special has to happen for it.

**Several limits.** A limit is a `(capacity, interval)` pair, and every client has one bucket per limit. Keep the limits in a list and, per client, a list of levels in the same order. One `last` per client is enough: all of a client's buckets refill over the same elapsed time, each capped at its own full level.

**Check, then commit.** The rule is all or nothing: a request passes only if every bucket can pay, and then every bucket pays. So the order is: refill everything, check everything, and only then charge everything. Charging inside the checking loop takes tokens from every limit before the first one that can't pay, for a request that is then refused. Example 2 shows why that matters: the first limit has to keep its token at 50 ms, or the request at 100 ms fails.

Refilling before deciding is safe even when the request is refused. Refill depends only on time, and bringing a bucket up to date early never changes its future: that is step 1's capping argument, once per limit.

## Complexity

`O(L)` per call, with `L <= 5` limits. Space is `O(k * L)` for `k` clients. Numbers stay below `cost * interval <= 10^10` and `capacity * interval <= 10^11`.

## Pitfalls

- Charging as you check. When a later limit refuses, the earlier ones have already paid for a request that never went through.
- Mixing units. With credit in milliseconds, `cost` tokens of a limit are `cost * interval`, a different amount for every limit. Comparing a level with `cost` alone is wrong for all but `interval = 1`.
- Treating a cost above a capacity as something that waits for a refill. It can never fit, and the ordinary check already refuses it.

# Rate Limiter: Costs and Stacked Limits

## In short
The token-bucket limiter → requests may cost several tokens, and `add_limit` stacks more buckets; a request passes only if every bucket can pay.

## The task

**Step 2 of 4.** The limiter gives every client a token bucket that refills continuously, and a request goes through only if its client's bucket can pay for it. So far:

- `RateLimiter(capacity, interval)`: buckets hold at most `capacity` tokens and refill at one token every `interval` milliseconds.
- `allow(client, t)`: a request from `client` at time `t`; returns `true` if it goes through.

**New in this step**

A text-to-speech request costs one token per character, and one limit is rarely enough: an API caps short bursts and long-run volume at the same time.

- `allow(client, t, cost=1)`: the request costs `cost` tokens. Without `cost` it costs 1, as before.
- `add_limit(capacity, interval)`: adds another limit, with its own `capacity` and `interval`. The constructor's limit is the first. `add_limit` is only called before the first request.

The rules, now for every limit:

- Each client has one bucket per limit. Each is created full, holding that limit's `capacity` tokens, at the client's first request.
- A bucket refills continuously at its own limit's rate: over `d` milliseconds it gains `d / interval` tokens. It never holds more than its limit's `capacity`: refill past that is lost.
- A request passes only if, at time `t`, every one of the client's buckets holds at least `cost` tokens. Then take `cost` tokens from every bucket and return `true`. Otherwise return `false` and take nothing from any bucket. A cost above some limit's `capacity` can never pass.

Clients are strings. Time `t` is in milliseconds. It never decreases from one call to the next, and several calls may share the same `t`.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor and for `add_limit`, `true` or `false` for `allow`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["RateLimiter","allow","allow","allow","allow","allow"]
args = [[10,100],["a",0,7],["a",0,4],["a",0,3],["a",250,3],["a",300,3]]
                    -> [null,true,false,true,false,true]
```

The first request spends 7 of the 10 tokens. A request for 4 doesn't fit in the 3 left, and the refusal takes nothing, so a request for 3 still does. At 250 ms the bucket holds 2.5 tokens, short of 3. At 300 ms it holds 3.

**Example 2**

```
ops  = ["RateLimiter","add_limit","allow","allow","allow","allow"]
args = [[2,1000],[1,100],["c",0],["c",50],["c",100],["c",200]]
                    -> [null,null,true,false,true,false]
```

Every request must pass both limits: 2 tokens refilling one per second, and 1 token refilling one per 100 ms. At 50 ms the second limit has half a token and refuses, so nothing is taken from the first. That leaves the first limit enough for the request at 100 ms. At 200 ms the first limit holds only 0.2 of a token.

**Example 3**

```
ops  = ["RateLimiter","add_limit","allow","allow","allow"]
args = [[50,10],[5,1000],["d",0,6],["d",1000000,6],["d",1000000,5]]
                    -> [null,null,false,false,true]
```

The second limit's bucket never holds more than 5 tokens, so a request for 6 is refused however long it waits. The refusal takes nothing, and a request for 5 passes.

## Constraints

- `1 <= capacity <= 10^5` and `1 <= interval <= 10^6`, for every limit.
- At most 5 limits in all: the constructor's, and up to 4 from `add_limit`, all added before the first `allow`.
- `1 <= cost <= 10^4`
- `0 <= t <= 10^9`, and `t` never decreases from one call to the next.
- `client` is 1 to 20 lowercase letters and digits.
- Up to `10^5` calls in total, from up to `10^4` different clients.

## Aim for

`O(L)` per call for `L` limits, integers only. Keep step 1's milliseconds of credit, now one level per limit: a token of a limit is that limit's `interval` ms, so `cost` tokens are `cost * interval`. One `last` per client serves every limit, since all its buckets refill over the same elapsed time. On a request, refill every level, then check them all, and only then charge them all. Charging as you check is the classic bug.

## Follow-ups

- Instead of `false`, return how long the client must wait before the same request would pass. How do you get that from the levels?
- Some limits are shared: one bucket per organization, or one for the whole API. What changes when a request draws from buckets that other clients also use?
- Next step: streaming requests that hold a slot while they run, and a cap on how many each client may have in flight.

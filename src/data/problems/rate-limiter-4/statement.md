# Rate Limiter: Plans and Monthly Quotas

## In short
The limiter with buckets and slots → add billing plans: a subscribed client's requests must also fit its plan's quota for the current period.

## The task

**Step 4 of 4.** The limiter gives every client one token bucket per limit, and can cap how many requests each client has in flight. So far:

- `RateLimiter(capacity, interval)`: the first limit. Its buckets hold at most `capacity` tokens and refill at one token every `interval` milliseconds.
- `add_limit(capacity, interval)`: another limit, with buckets of its own. Only called before the first request.
- `allow(client, t, cost=1)`: a request from `client` at time `t` that costs `cost` tokens; returns `true` if it passes.
- `set_concurrency(slots, timeout)`: each client may have at most `slots` requests in flight, and a request ends by itself `timeout` ms after it started. Called at most once, before the first request.
- `start(client, t, request_id, cost=1)`: a streaming request that holds a slot while it is in flight; returns `true` if it passes.
- `finish(request_id, t)`: ends a request that is in flight and frees its slot; returns `false` if no request with that id is in flight.

A request is a call to `allow` or `start`. What it needs so far:

- Tokens. Each bucket is created full at the client's first request. It refills continuously, gaining `d / interval` tokens over `d` milliseconds, and never holds more than its `capacity`. Every one of the client's buckets must hold at least `cost` tokens.
- A free slot, once `set_concurrency` was called: fewer than `slots` of the client's requests in flight at `t`. A request that `start` let through at time `s` is in flight until its `finish` or until `s + timeout`, whichever comes first. `allow` needs a free slot but gives it straight back.
- A request that passes takes `cost` tokens from every bucket, and a `start` holds its slot. A refused request takes nothing.

**New in this step**

The API sells plans: so many characters per billing period. A request's `cost` is its number of characters.

- `add_plan(name, quota, period)`: a plan that allows `quota` characters per billing period of `period` ms. Plan names are unique.
- `subscribe(client, plan, t)`: puts `client` on the plan named `plan` from time `t`, replacing any plan it had, and returns `true`. If there is no plan with that name, return `false` and change nothing.
- `remaining(client, t)`: the characters left in the client's billing period at time `t`. Return `-1` if the client has no plan.

The rules for plans:

- Subscribing, the first time or again, starts a fresh billing period at `t` with nothing used. Periods then run back to back: `[t, t + period)`, `[t + period, t + 2 * period)`, and so on. Usage goes back to 0 at every boundary.
- What's left in a period is the plan's `quota` minus the costs of the requests that passed during that period.
- A request from a subscribed client also needs `cost <= remaining(client, t)`. Tokens, slot and quota are one decision: if any check fails, the request takes nothing. If all pass, it takes its tokens, its slot for a `start`, and `cost` characters from the quota.
- Clients without a plan have no quota.
- Ending a stream gives nothing back. A stream that finishes early or times out has still used its whole `cost`.

Clients, request ids and plan names are strings. Time `t` is in milliseconds. It never decreases from one call to the next, and several calls may share the same `t`.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `add_limit`, `set_concurrency` and `add_plan`, a number for `remaining`, and `true` or `false` for the other methods.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["RateLimiter","add_plan","remaining","subscribe","allow","remaining","allow","allow","remaining","remaining"]
args = [[1000,1],["basic",100,1000],["ann",0],["ann","basic",0],["ann",10,60],["ann",20],["ann",30,50],["ann",40,40],["ann",999],["ann",1000]]
                    -> [null,null,-1,true,true,40,false,true,0,100]
```

Ann has no plan until she subscribes at 0 ms. Her periods are then `[0, 1000)`, `[1000, 2000)`, and so on. After 60 characters, 50 more don't fit in the 40 left, and the refusal uses nothing, so 40 still fit. At 1000 ms a new period starts with the full 100.

**Example 2**

```
ops  = ["RateLimiter","add_plan","subscribe","allow","allow","allow","allow","allow","remaining"]
args = [[1000,1],["pro",50,100],["bo","pro",30],["bo",30,50],["bo",129,1],["bo",180,50],["bo",229,1],["bo",230,1],["bo",230]]
                    -> [null,null,true,true,false,true,false,true,49]
```

Bo subscribed at 30 ms, so his periods are `[30, 130)`, `[130, 230)`, `[230, 330)`, and so on. The subscription sets the boundaries, not the first request after one: the request at 180 ms falls in the second period, and the third starts at 230 ms.

**Example 3**

```
ops  = ["RateLimiter","add_plan","add_plan","subscribe","subscribe","allow","remaining","allow","subscribe","remaining","subscribe","remaining"]
args = [[10,100],["trial",30,1000000],["plus",100,1000000],["cy","gold",0],["cy","trial",0],["cy",0,20],["cy",0],["cy",0,10],["cy","gold",500],["cy",500],["cy","plus",500],["cy",500]]
                    -> [null,null,null,false,true,false,30,true,false,20,true,100]
```

There is no plan named `"gold"`, so subscribing to it changes nothing, then or later. The request for 20 characters is refused by the 10-token bucket, and a refused request uses no quota. Moving to `"plus"` at 500 ms starts a fresh period with its full 100 characters.

## Constraints

- `1 <= capacity <= 10^5` and `1 <= interval <= 10^6`, for every limit. At most 5 limits in all, added before the first request.
- `1 <= cost <= 10^4`
- `1 <= slots <= 10^4` and `1 <= timeout <= 10^9`. `set_concurrency` is called at most once, before the first request.
- `1 <= quota <= 10^9` and `1 <= period <= 10^9`. No two plans share a name.
- `0 <= t <= 10^9`, and `t` never decreases from one call to the next.
- `client`, `request_id` and plan names are 1 to 20 lowercase letters and digits. No two `start` calls use the same `request_id`.
- Up to `10^5` calls in total, from up to `10^4` different clients.

## Aim for

`O(1)` per call for the quota, on top of the token and slot checks. Per subscribed client, store its plan's `quota` and `period`, the start of its current period and the characters `used` in it. When the client is touched at `t`, jump straight to the period that holds `t`: move the start forward by `(t - start) // period * period`, and reset `used` if it moved. Anchor the periods at the subscription, never at the first request after a boundary. Don't step forward one period at a time either: a client can sit idle for a billion periods.

## Follow-ups

- A client upgrades to a bigger plan halfway through a period. How would you prorate what it has left, and what extra state does that need?
- The limiter restarts. Which state must survive, which can be rebuilt, and what is safe to forget?
- Millions of clients, most of them idle. How do you keep memory in proportion to the active ones?

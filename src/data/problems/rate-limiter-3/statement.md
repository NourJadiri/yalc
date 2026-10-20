# Rate Limiter: Concurrency Slots

## In short
The token-bucket limiter → add a cap on requests in flight: `start` holds a slot until `finish` or a timeout frees it.

## The task

**Step 3 of 4.** The limiter keeps, for every client, one token bucket per limit. A request passes only if every one of the client's buckets can pay its cost, and then it pays from all of them. So far:

- `RateLimiter(capacity, interval)`: the first limit. Its buckets hold at most `capacity` tokens and refill at one token every `interval` milliseconds.
- `add_limit(capacity, interval)`: another limit, with buckets of its own. Only called before the first request.
- `allow(client, t, cost=1)`: a request from `client` at time `t` that costs `cost` tokens; returns `true` if it passes.

The token rules still hold. Each bucket is created full at the client's first request. It refills continuously, gaining `d / interval` tokens over `d` milliseconds, and never holds more than its `capacity`. A request passes the token check at time `t` if every one of the client's buckets holds at least `cost` tokens. Passing takes `cost` tokens from every bucket.

**New in this step**

Speech can stream, so a request may stay open for a while. The API caps how many requests each client has open at once, and gives up on a connection that stays open too long. From now on, a request is a call to `allow` or to the new `start`.

- `set_concurrency(slots, timeout)`: from now on each client may have at most `slots` requests in flight, and a request ends by itself `timeout` ms after it started. Called at most once, before the first request. Without it there is no slot limit, and nothing times out.
- `start(client, t, request_id, cost=1)`: a streaming request. It goes through only if it passes the token check and the client has a free slot at `t`. Then it takes its tokens, holds a slot, and returns `true`. Otherwise it returns `false` and takes nothing: no tokens, no slot.
- `finish(request_id, t)`: the request ends at `t` and gives its slot back; return `true`. Return `false`, and change nothing, if no `start` with this id went through, or if the request has already ended.

The rules for slots:

- A request that `start` let through at time `s` is in flight from `s` until it ends. It ends at its `finish`, or by itself at `s + timeout`, whichever comes first. From `s + timeout` on, its slot is free and `finish` returns `false`.
- A client has a free slot at `t` if fewer than `slots` of its requests are in flight at `t`.
- `allow` is a request that starts and ends at once. Once `set_concurrency` was called, it needs a free slot at `t` as well as the tokens, but gives the slot straight back.
- Tokens are spent at the start. Ending a request gives back its slot, never its tokens.
- Every `start` uses a `request_id` that no earlier `start` used.

Clients and request ids are strings. Time `t` is in milliseconds. It never decreases from one call to the next, and several calls may share the same `t`.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `add_limit` and `set_concurrency`, and `true` or `false` for `allow`, `start` and `finish`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["RateLimiter","set_concurrency","start","start","start","allow","allow","finish","start","finish","finish"]
args = [[100,10],[2,1000],["a",0,"r1"],["a",5,"r2"],["a",6,"r3"],["a",7],["b",7],["r1",20],["a",20,"r4"],["r3",30],["r1",30]]
                    -> [null,null,true,true,false,false,true,true,true,false,false]
```

Client `a` holds both of its slots at 6 ms, so a third stream is refused, and so is a plain `allow`, which needs a slot for an instant. Client `b` has slots of its own. Finishing `r1` frees a slot for `r4`. `r3` never went through and `r1` has already ended, so finishing either returns false.

**Example 2**

```
ops  = ["RateLimiter","set_concurrency","start","allow","allow","finish","start","start"]
args = [[100,10],[1,100],["a",0,"s1"],["a",50],["a",100],["s1",120],["a",130,"s2"],["a",131,"s3"]]
                    -> [null,null,true,false,true,false,true,false]
```

`s1` hasn't finished by 0 + 100, so it ends by itself at 100 ms, and its slot is free from then on. Finishing it later returns false, and must not free a slot a second time: `s2` holds the only slot, so `s3` is refused.

**Example 3**

```
ops  = ["RateLimiter","set_concurrency","start","start","start","finish","finish","start","start"]
args = [[5,100],[2,10000],["a",0,"x",4],["a",0,"y",2],["a",0,"z",1],["y",1],["x",1],["a",1,"w",1],["a",100,"v",1]]
                    -> [null,null,true,false,true,false,true,false,true]
```

`x` spends 4 of the 5 tokens. `y` wants 2 and is refused, so it holds no slot, and `z` gets the second one. Finishing `x` gives back its slot but not its tokens: `w` is refused for lack of a token, and by 100 ms one has refilled.

## Constraints

- `1 <= capacity <= 10^5` and `1 <= interval <= 10^6`, for every limit. At most 5 limits in all, added before the first request.
- `1 <= cost <= 10^4`
- `1 <= slots <= 10^4` and `1 <= timeout <= 10^9`. `set_concurrency` is called at most once, before the first request.
- `0 <= t <= 10^9`, and `t` never decreases from one call to the next.
- `client` and `request_id` are 1 to 20 lowercase letters and digits. No two `start` calls use the same `request_id`.
- Up to `10^5` calls in total, from up to `10^4` different clients.

## Aim for

`O(1)` amortized per call on top of the token check. Per client, keep the set of ids in flight and a queue of `(deadline, request_id)` in start order. Every request gets the same timeout and time never decreases, so the queue is already sorted by deadline. Clean it lazily, whenever the client is touched: pop every deadline `<= t` and drop that id from the set, if it is still there. `finish` cleans its client's queue first, so a request that timed out is already gone. A min-heap of deadlines works too. Scanning all in-flight requests on every call costs `O(slots)` and is too slow.

## Follow-ups

- Timeouts differ per request, or a client can extend one. What replaces the queue?
- A client's slots are shared by several servers. How do they agree on what is in flight, and what happens to the slots of a server that crashes?
- Next step: billing plans, with a character quota for every billing period.

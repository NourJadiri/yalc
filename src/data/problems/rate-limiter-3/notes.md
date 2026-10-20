## Pattern
Lazy expiry with a deadline queue

## Key idea
Deadlines are start plus a fixed timeout, so each client's queue is sorted: expire from its front when touched; a set of in-flight ids frees each slot once.

## Steps
1. Keep, per client, a set of request ids in flight and a queue of `(deadline, id)` in start order; `set_concurrency` just stores `slots` and `timeout`.
2. In `allow`, after the token check, expire the client's queue and refuse if `slots` requests are still in flight; charge only when both pass.
3. `start` is an `allow` that keeps its slot: on success, add the id to the set and `(t + timeout, id)` to the queue.
4. `finish` expires its client's queue first, then succeeds only if the id is still in the set, and removes it.
5. To expire at `t`, pop every deadline `<= t` off the queue's front and discard its id; a finished id is already gone.

## Cost
`O(L)` amortized time per call for `L` limits · `O(k * L + r)` space for `r` started streams

## Approach

What is already there: per client, one bucket per limit, refilled lazily and checked across all limits before any is charged. This step adds a second resource, slots, under the same all-or-nothing rule, and requests that end by themselves.

**What is in flight.** Per client, keep a set of the ids it has in flight. The number of busy slots is the size of that set. `start` adds its id and `finish` removes it. A map from id to client lets `finish` find the right set.

**Timeouts, lazily.** Nothing has to happen at the moment a request times out. What matters is that it is gone by the time anyone looks, so clean up whenever a client is touched. Every request gets the same timeout and time never decreases, so a client's deadlines arrive in sorted order: a plain queue in start order is sorted by deadline. To expire at time `t`, pop from the front while the deadline is `<= t`, and drop each popped id from the set. Each request is pushed once and popped once, so the cleanup is `O(1)` amortized. If timeouts differed per request, the queue would become a min-heap, at `O(log n)` per operation.

**One way out.** A request can be ended twice over: it times out, and later someone calls `finish` for it. The set makes this safe. `finish` expires its client's queue first, so a request past its deadline has already left the set, and `finish` returns `false`. The expiry uses `discard`, so a request that finished early and is popped later simply isn't there. Whoever ends a request, it leaves the set once, and its slot is freed once.

**Where the check goes.** `allow` now does the token check and then the slot check, and charges only if both pass. `start` is an `allow` that keeps its slot: when `allow` returns `true`, nothing has changed in between, so the slot it found free is still free and `start` takes it. A refused `start` took nothing, as the rules require. Without `set_concurrency` the slot check is skipped and nothing is queued, so a stream stays in flight until `finish`.

## Complexity

Each call costs `O(L)` for the token check plus `O(1)` amortized for slots: every started request enters and leaves its queue once. Space is `O(k * L)` for the buckets plus `O(r)` for the `r` requests that went through. Scanning all of a client's in-flight requests on every call would cost up to `slots = 10^4` per call instead.

## Pitfalls

- Freeing a slot twice. A per-client counter that the timeout decrements, and that `finish` decrements again for a request that already timed out, hands the client an extra slot. Example 2 is built to catch it.
- Off by one at the deadline. At exactly `start + timeout` the request has ended: its slot is free and `finish` returns `false`.
- Taking anything for a refused request: tokens for a `start` that has no slot, or a slot for one that is short of tokens.
- Forgetting that `allow` needs a free slot too, once concurrency is set.

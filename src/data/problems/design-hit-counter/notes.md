## Pattern
Design (circular buffer)

## Key idea
Only the last 300 seconds matter, so reuse 300 buckets at index `t % 300`; each remembers its second, which tells stale data from current.

## Steps
1. Make two arrays of 300 slots: `time[i]` says which second bucket `i` holds, `hits[i]` how many hits it had.
2. In `record(t)`, take bucket `i = t % 300`; if `time[i] != t` it is stale, so set `time[i] = t` and `hits[i] = 0`.
3. Add one to `hits[i]`.
4. In `count(t)`, sum `hits[i]` over the buckets whose second is within 300 of `t` (`t - time[i] < 300`).

## Cost
`O(1)` time per `record`, `O(300)` per `count` · `O(300)` space

## Approach

Start with the deque: append every timestamp on `record`; on `count(t)`, pop from the front while the oldest stamp is `<= t - 300`, then return the length. Every event is pushed and popped once, so it's `O(1)` amortised — but it stores every event inside the window, which under heavy traffic is a lot of memory.

The bucket design fixes the memory at 300 slots. Second `t` lives in bucket `t % 300`. Each bucket remembers *which* second it currently holds (`time[i]`) and how many hits that second had (`hits[i]`). Recording into a bucket that holds an older second means that second has aged out of any possible window, so the bucket is reset before counting. Counting sums only buckets whose second is within the last 300.

## Complexity

Deque: `O(1)` amortised per operation, `O(window events)` memory. Buckets: `O(1)` per `record`, `O(300)` per `count`, `O(300)` memory — constant in the traffic.

## Pitfalls

- The window is `[t - 299, t]` — 300 seconds including `t`. Popping with `< t - 300` keeps one second too many.
- A bucket can hold a second from several laps ago; compare stamps, don't assume it's fresh.

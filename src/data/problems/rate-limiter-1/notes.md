## Pattern
Token bucket with lazy refill

## Key idea
Never tick the refill: when a request arrives, credit the milliseconds since the last update, counting one token as `interval` ms, so fractions of a token stay exact integers.

## Steps
1. Measure credit in milliseconds: a token is `interval` ms and a full bucket `capacity * interval`; keep `level` and `last` per client.
2. On a client's first request, create its bucket full, with `last = t`.
3. Refill: add `t - last` to `level`, cap it at a full bucket, and set `last = t`.
4. If `level >= interval`, subtract `interval` and return `True`; otherwise keep the refilled level and return `False`.

## Cost
`O(1)` time per call · `O(k)` space for `k` clients

## Approach

A token bucket is a counter that fills with time and empties with use. Each client's bucket holds up to `capacity` tokens and gains one every `interval` ms, and a request spends one. That allows a burst of up to `capacity` requests at once, but over a long stretch no more than one request per `interval`.

**Refill lazily.** Nothing has to happen between requests. A bucket's level at time `t` depends only on its level at the last update and on the time since, so compute it when a request arrives. A timer per client, or a loop over every millisecond, does the same work a million times over for nothing.

**Count credit in milliseconds.** Half an interval adds half a token, and that half must not be lost. Floats would carry it, with rounding error. Instead change the unit: one token is `interval` milliseconds of credit. One elapsed millisecond then adds exactly one unit, a full bucket is `capacity * interval`, and "holds a whole token" means `level >= interval`. Everything stays an integer.

**The request.** A client's first request finds no bucket, so create it full. Then refill: `level = min(full, level + t - last)` and `last = t`. If `level >= interval`, spend `interval` and allow the request. A refused request still stores the refilled level: the credit was earned, and it stays until it is spent.

**Why capping at every update is right.** The cap throws away the time a bucket spends full, which is the rule. Capping early never loses anything else: `min(full, min(full, x + a) + b)` equals `min(full, x + a + b)` for `a, b >= 0`. So it doesn't matter how often you bring a bucket up to date, refused requests included.

## Complexity

`O(1)` per call: two dictionary lookups and a little arithmetic. Space is `O(k)` for the `k` clients that have made a request. All numbers stay below `capacity * interval <= 10^11`.

## Pitfalls

- Rounding down to whole tokens: `tokens += (t - last) // interval; last = t` throws away the part of an interval that has already passed. Requests 1.5 intervals apart lose half a token each time.
- Keeping the remainder but not capping it. A bucket that sat full for five seconds holds `capacity` tokens and no spare time: after a burst empties it, the next token is a full `interval` away.
- Moving `last` on a refused request without storing the refilled level. Update the two together.

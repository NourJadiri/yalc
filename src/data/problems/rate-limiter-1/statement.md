# Rate Limiter: Token Bucket

## In short
A token bucket per client → `allow(client, t)` takes a token and returns `true`, or `false` if the bucket has no whole token.

## The task

**Step 1 of 4.** A text-to-speech API meters its clients. Over four steps you build the gate in front of it, one feature at a time. This step is the core: every client gets a token bucket, and a request goes through only if its client's bucket can pay for it.

Implement `class RateLimiter`:

- `RateLimiter(capacity, interval)`: a limiter whose buckets hold at most `capacity` tokens and refill at one token every `interval` milliseconds.
- `allow(client, t)`: a request from `client` at time `t`. Return `true` if it goes through, `false` if not.

Clients are strings. Time `t` is in milliseconds. It never decreases from one call to the next, and several calls may share the same `t`.

The rules:

- Each client has its own bucket. It is created full, holding `capacity` tokens, at that client's first request.
- The bucket refills continuously. Over `d` milliseconds it gains `d / interval` tokens, so half an interval adds half a token. It never holds more than `capacity`: refill past that is lost.
- A request costs one token. If the bucket holds at least one whole token at time `t`, take one token and return `true`. Otherwise return `false` and take nothing.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `allow`.

## Examples

**Example 1**

```
ops  = ["RateLimiter","allow","allow","allow","allow","allow","allow"]
args = [[2,1000],["ana",0],["ana",0],["ana",400],["ben",400],["ana",1000],["ana",1000]]
                    -> [null,true,true,false,true,true,false]
```

Ana spends both tokens at 0 ms. By 400 ms her bucket has refilled 0.4 of a token, which is not enough. Ben has his own full bucket. At 1000 ms Ana's bucket holds exactly one token again.

**Example 2**

```
ops  = ["RateLimiter","allow","allow","allow","allow","allow"]
args = [[2,100],["x",0],["x",0],["x",150],["x",200],["x",250]]
                    -> [null,true,true,true,true,false]
```

The bucket is empty after the two requests at 0 ms. At 150 ms it holds 1.5 tokens: the request takes one, and the half stays. Another half arrives by 200 ms, which makes a whole token. At 250 ms there is only half a token.

**Example 3**

```
ops  = ["RateLimiter","allow","allow","allow","allow","allow","allow","allow"]
args = [[3,10],["k",5],["k",1000],["k",1000],["k",1000],["k",1000],["k",1005],["k",1010]]
                    -> [null,true,true,true,true,false,false,true]
```

After a long quiet stretch the bucket is full, and full means 3 tokens: the time it spent full is not saved up. Three requests at 1000 ms empty it. Half a token is back at 1005 ms, a whole one at 1010 ms.

## Constraints

- `1 <= capacity <= 10^5`
- `1 <= interval <= 10^6`
- `0 <= t <= 10^9`, and `t` never decreases from one call to the next.
- `client` is 1 to 20 lowercase letters and digits.
- Up to `10^5` calls to `allow`, from up to `10^4` different clients.

## Aim for

`O(1)` per call, with integers only. Keep each bucket in milliseconds of credit: one token is `interval` ms, and a full bucket is `capacity * interval`. Store, per client, the credit `level` and the time `last` it was brought up to date. On a request, add `t - last`, cap at a full bucket, then spend `interval` if there is that much. Don't simulate the refill tick by tick, and don't round down to whole tokens: the half token in Example 2 has to survive.

## Follow-ups

- A fixed-window counter is simpler: at most `capacity` requests per clock window. Show how a client gets twice that rate through at a window's edge.
- The limiter runs on many servers that share one store. What has to happen atomically, and what does each request cost in round trips?
- Next step: requests that cost more than one token, and a second limit on top of the first.

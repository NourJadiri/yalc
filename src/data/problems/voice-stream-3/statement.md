# Voice Stream: Latency Budget

An original design problem, written for this app. There is no LeetCode page for it.

## In short
A receiver that plays packets in order → add `set_delay(delay)`: once waiting audio is `delay` ms old, a missing packet is skipped as `null`.

## The task

**Step 3 of 4.** `StreamReceiver` takes in a voice agent's audio packets, drops duplicates against a sliding window of sequence numbers, and plays the rest back in order. So far a missing packet stalls playback forever. Live audio can't wait forever, so this step adds a latency budget.

- `StreamReceiver(window)`: a receiver that has kept no packets yet.
- `receive(seq, data, t)`: a packet arrives at time `t`. Return `true` if it is kept, `false` if it is dropped.
- `play(t)`: return what can be played at time `t`, in order: the data of buffered packets, and `null` for each missing packet given up on.
- `set_delay(delay)`: set the latency budget, in milliseconds.

Each packet carries a sequence number `seq` (the sender numbers its packets 0, 1, 2, …), a short string `data` that stands for its audio, and its arrival time `t` in milliseconds. Every call carries the time `t`, and times never decrease from one call to the next.

**Keeping packets (as before).** Let `top` be the highest `seq` kept so far. The window covers the `window` seqs from `top - window + 1` up to `top`. A packet is handled by the first rule that matches:

1. It is the first packet: keep it. Its `seq` becomes `top`.
2. `seq > top`: keep it. Its `seq` becomes the new `top`.
3. `seq <= top - window`: drop it. The window no longer covers it, so there's no telling whether it's a duplicate.
4. Otherwise `seq` is inside the window. Keep it, unless a packet with the same `seq` was already kept: then it's a duplicate, so drop it.

A dropped packet changes nothing.

**Playing (as before).** A kept packet waits in a buffer until it is played. Playback starts at seq 0 and moves up one seq at a time. `play(t)` returns the data of the buffered packets from the next seq to play onward, in seq order, up to the first seq that isn't in the buffer. Those packets leave the buffer and playback moves past them. `receive` also drops any packet whose `seq` is lower than the next seq to play.

**New in this step**

- `set_delay(delay)` is called at most once, before the first `receive`. Without it, `play` stops at the first missing seq and waits for it forever, as before.
- With a delay set, when `play(t)` reaches a seq that isn't in the buffer and the buffer isn't empty (every packet still in it has a higher seq), it looks at the buffered packet that arrived earliest. If that packet arrived at or before `t - delay`, the receiver gives up on the missing seq: it puts `null` (silence) in the returned list in its place and moves on to the next seq. Otherwise `play` stops there for now.
- After giving up, `play` carries on as usual: buffered packets play in turn, and at each missing seq the check runs again over the packets still in the buffer. `play` stops at a missing seq when the check fails or when the buffer is empty.
- A packet that arrives later for a seq that was given up on is dropped: like a played seq, it is lower than the next seq to play.

The earliest-arrived packet sets the pace because it has waited longest. Once it has waited `delay` ms, holding playback back any longer would make it late.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor and for `set_delay`, `true` or `false` for `receive`, and for `play` a list of strings and `null`s.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["StreamReceiver","set_delay","receive","receive","play","play","receive"]
args = [[8],[100],[0,"good",0],[2,"ning",10],[50],[110],[1,"mor",120]]
                                                    -> [null,null,true,true,["good"],[null,"ning"],false]
```

At time 50, seq 1 is missing, and the earliest-arrived packet waiting (seq 2) has waited 40 ms, so playback waits. At time 110 it has waited 100 ms, the whole budget: seq 1 is given up and becomes silence. When seq 1 turns up after all, it is dropped.

**Example 2**

```
ops  = ["StreamReceiver","set_delay","receive","receive","play"]
args = [[8],[50],[3,"how",0],[1,"mor",40],[60]]
                                                    -> [null,null,true,true,[null,"mor",null,"how"]]
```

Seq 1 has waited only 20 ms, but seq 3 has waited 60, past the 50 ms budget. So seq 0 is given up, seq 1 plays, and seq 2 is given up for the same reason before seq 3 plays.

**Example 3**

```
ops  = ["StreamReceiver","set_delay","receive","receive","play","play"]
args = [[8],[50],[1,"mor",0],[3,"how",30],[60],[80]]
                                                    -> [null,null,true,true,[null,"mor"],[null,"how"]]
```

At time 60, seq 1 has waited 60 ms, so seq 0 is given up and seq 1 plays. At seq 2 the check runs again: the only packet left, seq 3, has waited 30 ms, so playback waits. At time 80 it has waited 50 ms, and seq 2 is given up too.

## Constraints

- `1 <= window <= 10^5`
- `0 <= seq <= 10^9`
- `data` is 1 to 8 lowercase English letters.
- `0 <= t <= 10^9`, and `t` never decreases from one call to the next.
- `0 <= delay <= 10^9`. `set_delay` is called at most once, before the first `receive`.
- At most `2 * 10^5` calls in total. All `play` calls together return at most `2 * 10^5` entries, `null`s included.

## Aim for

`O(1)` amortised per call, plus `O(1)` for each entry `play` returns. At a gap the question is when the earliest-arrived waiting packet arrived. Times never decrease, so arrival order is call order: keep a FIFO queue of `(t, seq)` for every kept packet. A played packet stays in the queue until it reaches the front, where it is popped and ignored (lazy deletion), so after that cleanup the front is the earliest arrival still waiting. Each packet enters and leaves the queue once. A min-heap keyed by arrival time also works, at `O(log n)`. Scanning the buffer at every gap doesn't: thousands of packets can wait behind one gap.

## Follow-ups

- Real jitter buffers adapt the delay to the network: longer when arrivals are uneven, shorter when they are steady. How would you measure that from the arrival times?
- Instead of silence, a player can stretch the audio around a gap or repeat the last packet (packet loss concealment). What would `play` need to return?
- Next step: the user interrupts the agent, and the rest of the abandoned reply must never play.

# Voice Stream: Play in Order

An original design problem, written for this app. There is no LeetCode page for it.

## In short
A receiver that drops duplicate packets → add `play(t)`, which returns the audio that can be played now, in sequence order.

## The task

**Step 2 of 4.** `StreamReceiver` takes in a voice agent's audio packets and drops duplicates, judging each sequence number against a sliding window. Now it also holds on to the packets it keeps and plays them back in order.

- `StreamReceiver(window)`: a receiver that has kept no packets yet.
- `receive(seq, data, t)`: a packet arrives. Return `true` if it is kept, `false` if it is dropped.
- `play(t)`: return the data of the packets that can be played now, in order.

Each packet carries a sequence number `seq` (the sender numbers its packets 0, 1, 2, …), a short string `data` that stands for its audio, and its arrival time `t` in milliseconds. Every call carries the time `t`, and times never decrease from one call to the next. Nothing in this step depends on `t` yet.

**Keeping packets (as before).** Let `top` be the highest `seq` kept so far. The window covers the `window` seqs from `top - window + 1` up to `top`. A packet is handled by the first rule that matches:

1. It is the first packet: keep it. Its `seq` becomes `top`.
2. `seq > top`: keep it. Its `seq` becomes the new `top`.
3. `seq <= top - window`: drop it. The window no longer covers it, so there's no telling whether it's a duplicate.
4. Otherwise `seq` is inside the window. Keep it, unless a packet with the same `seq` was already kept: then it's a duplicate, so drop it.

A dropped packet changes nothing.

**New in this step**

- A kept packet waits in a buffer until it is played.
- Playback starts at seq 0 and moves up one seq at a time. `play(t)` returns the data of the buffered packets from the next seq to play onward, in seq order, and stops at the first seq that isn't in the buffer. Those packets leave the buffer and playback moves past them, so the next call carries on from there. If the next seq to play isn't in the buffer, `play` returns an empty list, even when later packets are waiting.
- `receive` also drops a packet whose `seq` is lower than the next seq to play: it was already played. Rules 3 and 4 already drop every such packet, so this changes no answer from step 1. It does mean a played packet never comes back.
- A packet that is lost, or that arrives too late to be kept (rule 3), stalls playback for good: everything after it waits in the buffer forever. The next step deals with that.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `receive`, and a list of strings for `play`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["StreamReceiver","receive","play","receive","receive","play","receive","play"]
args = [[8],[1,"mor",10],[15],[0,"good",20],[3,"how",25],[30],[2,"ning",40],[45]]
                                                    -> [null,true,[],true,true,["good","mor"],true,["ning","how"]]
```

Nothing can play until seq 0 arrives. Then seqs 0 and 1 play, and seq 3 waits for seq 2. When seq 2 arrives, it plays and lets seq 3 through.

**Example 2**

```
ops  = ["StreamReceiver","receive","play","receive","receive","receive","receive","play"]
args = [[8],[0,"one",0],[5],[0,"one",10],[2,"three",15],[2,"three",20],[1,"two",25],[30]]
                                                    -> [null,true,["one"],false,true,false,true,["two","three"]]
```

The second seq 0 arrives after seq 0 was played, and the second seq 2 is a copy of a packet still waiting. Both are dropped, so each piece of audio plays once.

**Example 3**

```
ops  = ["StreamReceiver","receive","receive","receive","receive","play"]
args = [[2],[1,"mor",0],[2,"ning",5],[3,"how",10],[0,"good",15],[20]]
                                                    -> [null,true,true,true,false,[]]
```

By the time seq 0 arrives, the window covers only seqs 2 and 3, so it is dropped. Playback is stuck at seq 0 for good, and seqs 1 to 3 wait forever.

## Constraints

- `1 <= window <= 10^5`
- `0 <= seq <= 10^9`
- `data` is 1 to 8 lowercase English letters.
- `0 <= t <= 10^9`, and `t` never decreases from one call to the next.
- At most `2 * 10^5` calls in total.

## Aim for

`O(1)` per `receive`, and `O(1 + k)` for a `play` that returns `k` packets. Keep the buffer as a hash map from seq to data, and remember the next seq to play. `play` pops `next`, then `next + 1`, and so on while they are there. Each packet enters and leaves the buffer once. Don't sort or scan the buffer in `play`: while one packet is late, thousands can be waiting behind it, and every `play` must still answer at once. This is the core of a jitter buffer, as used for RTP audio: hold the early packets, release them in order.

## Follow-ups

- While playback is stuck, the buffer grows without bound. How would you cap it, and what would you throw away first?
- A sound card asks for exactly one 20 ms frame every 20 ms. How would `play` change?
- Next step: stop waiting for a missing packet once it is too late to matter.

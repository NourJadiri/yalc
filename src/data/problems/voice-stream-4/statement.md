# Voice Stream: Interruptions

An original design problem, written for this app. There is no LeetCode page for it.

## In short
A receiver that plays a voice stream → add `interrupt(gen, t)` and packet generations, so audio from an abandoned response never plays.

## The task

**Step 4 of 4.** `StreamReceiver` takes in a voice agent's audio packets, drops duplicates against a sliding window of sequence numbers, plays the rest back in order, and gives up on a missing packet once the audio waiting behind it has used up a latency budget. Live conversations add one more event: the user starts talking over the agent (barge-in). The agent abandons its reply and starts a new one, and none of the old reply may play, even though some of it is already buffered and more is still on its way.

- `StreamReceiver(window)`: a receiver that has kept no packets yet.
- `receive(seq, data, t, gen=0)`: a packet of response `gen` arrives at time `t`. Return `true` if it is kept, `false` if it is dropped.
- `play(t)`: return what can be played at time `t`, in order: the data of buffered packets, and `null` for each missing packet given up on.
- `set_delay(delay)`: set the latency budget, in milliseconds.
- `interrupt(gen, t)`: the agent abandons its current response and starts response `gen`. Return how many buffered packets were thrown away.

Each packet carries a sequence number `seq` (the sender numbers each response's packets 0, 1, 2, …), a short string `data` that stands for its audio, and its arrival time `t` in milliseconds. Every call carries the time `t`, and times never decrease from one call to the next.

**Keeping packets (as before).** Let `top` be the highest `seq` kept so far. The window covers the `window` seqs from `top - window + 1` up to `top`. A packet is handled by the first rule that matches:

1. It is the first packet: keep it. Its `seq` becomes `top`.
2. `seq > top`: keep it. Its `seq` becomes the new `top`.
3. `seq <= top - window`: drop it. The window no longer covers it, so there's no telling whether it's a duplicate.
4. Otherwise `seq` is inside the window. Keep it, unless a packet with the same `seq` was already kept: then it's a duplicate, so drop it.

A dropped packet changes nothing.

**Playing (as before).** A kept packet waits in a buffer until it is played. Playback starts at seq 0 and moves up one seq at a time. `play(t)` returns the data of the buffered packets from the next seq to play onward, in seq order, up to the first seq that isn't in the buffer. Those packets leave the buffer and playback moves past them. `receive` also drops any packet whose `seq` is lower than the next seq to play.

**The latency budget (as before).** `set_delay(delay)` is called at most once, before the first `receive`. Without it, `play` stops at the first missing seq and waits for it forever. With it, when `play(t)` reaches a seq that isn't in the buffer and the buffer isn't empty, it looks at the buffered packet that arrived earliest. If that packet arrived at or before `t - delay`, the receiver gives up on the missing seq: it puts `null` in the returned list in its place and moves on to the next seq, so a late copy of the missing one is dropped. The same check runs again at each later missing seq, over the packets still in the buffer. Otherwise, or once the buffer is empty, `play` stops.

**New in this step**

- Each response the agent speaks has a generation number, and every packet carries the generation it belongs to as `gen`. The current generation starts at 0. `gen` defaults to 0, so calls without it behave exactly as before.
- `interrupt(gen, t)`: if `gen` is greater than the current generation, the receiver switches to it. It throws away every buffered packet and starts the stream over: seqs start again at 0, playback expects seq 0, and the window is empty, so the next packet of the new response counts as the first one. The delay stays as it was. Return how many buffered packets were thrown away. If `gen` is not greater than the current generation, nothing happens: return 0.
- `receive` drops a packet whose `gen` is lower than the current generation.
- A packet whose `gen` is greater than the current generation can arrive before its `interrupt`, because the network reorders. It first switches the receiver to its generation, exactly as `interrupt(gen, t)` would, and is then handled as usual, so it is kept as the first packet of the new stream. The `interrupt` that arrives after it changes nothing.

So `play` only ever returns audio of the current generation.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor and for `set_delay`, `true` or `false` for `receive`, a number for `interrupt`, and for `play` a list of strings and `null`s.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["StreamReceiver","receive","receive","play","receive","receive","interrupt","receive","receive","play"]
args = [[8],[0,"good",0],[1,"mor",10],[20],[2,"ning",30],[3,"how",40],[1,50],[4,"can",60],[0,"sure",70,1],[80]]
                                                    -> [null,true,true,["good","mor"],true,true,2,false,true,["sure"]]
```

The interrupt throws away seqs 2 and 3 before they play. Seq 4 of the old response (generation 0, the default) arrives afterwards and is dropped. The new response starts again at seq 0.

**Example 2**

```
ops  = ["StreamReceiver","receive","receive","receive","interrupt","receive","play"]
args = [[8],[0,"one",0],[1,"two",5],[0,"wait",10,1],[1,15],[2,"three",20],[25]]
                                                    -> [null,true,true,true,0,false,["wait"]]
```

The first packet of response 1 overtakes its interrupt. It switches the receiver at once, which throws away the two waiting packets of response 0, and it is kept. The interrupt that follows changes nothing and returns 0.

**Example 3**

```
ops  = ["StreamReceiver","receive","receive","interrupt","receive","receive","play"]
args = [[4],[0,"well",0],[9,"hmm",5],[2,10],[1,"sure",15,2],[0,"ok",20,2],[25]]
                                                    -> [null,true,true,2,true,true,["ok","sure"]]
```

Response 2 starts the stream over. Its seq 0 is not too old, because the old `top` of 9 is gone, and not a duplicate, because the old seq 0 belonged to response 0. Generations may skip numbers: going from 0 to 2 is fine.

## Constraints

- `1 <= window <= 10^5`
- `0 <= seq <= 10^9`
- `data` is 1 to 8 lowercase English letters.
- `0 <= t <= 10^9`, and `t` never decreases from one call to the next.
- `0 <= delay <= 10^9`. `set_delay` is called at most once, before the first `receive`.
- `0 <= gen <= 10^9`, in `receive` and in `interrupt`.
- At most `2 * 10^5` calls in total. All `play` calls together return at most `2 * 10^5` entries, `null`s included.

## Aim for

Every call in `O(1)` amortised, interrupts included, plus `O(1)` for each entry `play` returns. The buffer and the arrival queue can simply be replaced with empty ones: each packet in them was added once, so dropping them is already paid for. The window's ring is the catch. Rebuilding `window` slots on every interrupt costs `O(window)`, and a test switches responses 80,000 times with `window = 10^5`. Instead, stamp each slot with the generation as well as the seq. A slot written by an older response never matches, so the window is empty the moment the generation changes, without touching a slot. This is the generation (or epoch) trick: to invalidate a whole structure in `O(1)`, change the number its entries must carry.

## Follow-ups

- Clearing the buffer doesn't silence the speaker at once: audio can still sit in the operating system's sound buffer, or in packets already on the wire. Where else would you cut the old response off, and how quickly?
- Several speakers share one connection, each with their own stream. What would you key the receiver's state by?
- The agent sometimes resumes its old response instead of starting a new one. What would `interrupt` have to keep?

# Voice Stream: Drop Duplicates

An original design problem, written for this app. There is no LeetCode page for it.

## In short
A packet receiver with a sliding window → `receive` keeps each new packet and drops duplicates and packets too old to check.

## The task

**Step 1 of 4.** A voice agent streams its spoken reply as small audio packets. On the way, the network can deliver a packet twice, deliver packets out of order, or lose them. Over four steps you'll build the receiver that turns the stream back into sound. This first step drops the duplicates.

Each packet carries a sequence number `seq` (the sender numbers its packets 0, 1, 2, …), a short string `data` that stands for its audio, and its arrival time `t` in milliseconds. Times never decrease from one call to the next. This step only looks at `seq`: `data` is played from step 2, and `t` matters from step 3.

Implement `class StreamReceiver`:

- `StreamReceiver(window)`: a receiver that has kept no packets yet.
- `receive(seq, data, t)`: a packet arrives. Return `true` to keep it, `false` to drop it.

The receiver can't remember every packet forever, so it judges each one against a window of recent sequence numbers. Let `top` be the highest `seq` kept so far. The window covers the `window` seqs from `top - window + 1` up to `top`. A packet is handled by the first rule that matches:

1. It is the first packet: keep it. Its `seq` becomes `top`.
2. `seq > top`: keep it. Its `seq` becomes the new `top`.
3. `seq <= top - window`: drop it. The window no longer covers it, so there's no telling whether it's a duplicate.
4. Otherwise `seq` is inside the window. Keep it, unless a packet with the same `seq` was already kept: then it's a duplicate, so drop it.

A dropped packet changes nothing.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `receive`.

## Examples

**Example 1**

```
ops  = ["StreamReceiver","receive","receive","receive","receive","receive"]
args = [[3],[0,"good",0],[2,"ning",20],[1,"mor",25],[2,"ning",40],[0,"good",45]]
                                                    -> [null,true,true,true,false,false]
```

Seq 1 arrives after seq 2, but the window (seqs 0 to 2) still covers it, and it is new, so it's kept. The second copies of seqs 2 and 0 are duplicates.

**Example 2**

```
ops  = ["StreamReceiver","receive","receive","receive","receive","receive","receive"]
args = [[3],[5,"how",0],[3,"are",10],[2,"you",20],[9,"to",30],[7,"day",40],[6,"so",50]]
                                                    -> [null,true,true,false,true,true,false]
```

With `top` at 5 the window covers seqs 3 to 5, so seq 2 is too old. Once seq 9 arrives, the window covers 7 to 9: seq 6 is dropped, even though no seq 6 ever arrived before.

**Example 3**

```
ops  = ["StreamReceiver","receive","receive","receive","receive","receive","receive"]
args = [[4],[0,"hel",0],[1,"lo",10],[1000,"wor",20],[1,"lo",30],[998,"ld",40],[1000,"wor",50]]
                                                    -> [null,true,true,true,false,true,false]
```

The jump to seq 1000 moves the window to seqs 997 to 1000 at once. Seq 1 is now too old, seq 998 is new, and a second seq 1000 is a duplicate of `top`.

## Constraints

- `1 <= window <= 10^5`
- `0 <= seq <= 10^9`
- `data` is 1 to 8 lowercase English letters.
- `0 <= t <= 10^9`, and `t` never decreases from one call to the next.
- At most `2 * 10^5` calls to `receive`.

## Aim for

`O(1)` per packet and `O(window)` memory, however many packets arrive. Only seqs inside the window can still be judged, so remember only those: a ring of `window` slots, where seq `s` lives in slot `s % window`. Store the seq itself in its slot, not a yes/no flag. A seq inside the window is a duplicate exactly when its slot holds that very seq. Anything else in the slot is an older seq the window has left behind, so nothing ever needs clearing, even when `top` jumps by a billion. Network stacks do the same job with a 32- or 64-bit mask (the IPsec and DTLS anti-replay windows). A hash set of every seq ever kept passes the tests too, but it grows without bound: say so, then offer the ring.

## Follow-ups

- RTP numbers its packets with 16 bits, so `seq` wraps from 65535 back to 0. How do you tell which of two seqs is newer, and what happens to the window?
- How wide should the window be? What does a narrow window cost, and what does a wide one cost?
- Next step: play the audio in order.

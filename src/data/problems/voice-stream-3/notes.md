## Pattern
Queue with lazy deletion

## Key idea
Times never decrease, so arrival order is call order: a queue of kept packets, with played ones popped off the front lazily, always shows the oldest packet waiting.

## Steps
1. Add `delay` (None until `set_delay`) and `arrivals`, a FIFO queue of `(t, seq)` for kept packets.
2. In `receive`, append `(t, seq)` to `arrivals` whenever a packet is kept.
3. In `play`, at a missing seq with packets still buffered, pop `arrivals` entries whose seq is no longer buffered.
4. If the front arrived at or before `t - delay`, output `None`, move `next` on and keep playing; otherwise stop.

## Cost
`O(1)` amortised time per call and per entry returned · `O(window + n)` space for `n` kept packets

## Approach

Pattern: a **FIFO queue with lazy deletion**, which keeps the oldest waiting packet at hand.

Only `play`'s loop changes. At a missing seq, step 2 stopped. Now, if a delay is set and the buffer isn't empty, it asks how long the oldest waiting packet has waited. If that's at least `delay`, it gives up on the missing seq: it outputs `None`, moves `next` on, and keeps looping. Otherwise it stops.

Finding the oldest waiting packet is the whole problem. Times never decrease from one call to the next, so packets arrive in call order, and the earliest-arrived packet still buffered is simply the earliest-received one that hasn't played yet. So `receive` appends `(t, seq)` to a queue for each packet it keeps. Removing a packet from the middle of the queue when it plays would cost `O(n)`, so played packets stay put. When `play` needs the oldest, it pops entries off the front while their seq is no longer in the buffer. Within this step a seq enters the buffer at most once, so "not in the buffer" means "already played". After the cleanup, the front is the answer.

The check runs again at every gap, over whatever is still buffered. Packets that play in between may include the oldest one, and then the next gap has to wait (Example 3).

A seq that was given up on is now below `next`, so the `seq < next` rule from step 2 drops it if it turns up late. The window rules alone wouldn't: it was never kept, and it may still be inside the window. That is why `receive` checks `seq < next` first.

When the buffer is empty, `play` stops without silence. Nothing waits behind the gap, so nothing is being made late; the stream may just have paused.

## Complexity

Each kept packet enters `arrivals` once and leaves it at most once, so the cleanup costs `O(1)` amortised. Every other turn of `play`'s loop plays a packet, outputs a `None`, or stops. A call costs `O(1)` amortised plus `O(1)` per entry it returns.

Space: `O(window)` for the ring, plus the buffer and the queue. Played entries can linger in the queue behind an old packet that's still waiting, so the queue holds at most every kept packet: `O(n)`.

## Pitfalls

- Judging the wait by the packet right after the gap. It may have arrived a moment ago while an older packet further on is overdue (Example 2).
- `<` instead of `<=`: a packet that arrived exactly `delay` ms ago has used up the budget.
- Deciding once per `play`. After some packets play, the oldest waiting packet can be a younger one, and the next gap must wait (Example 3).
- Trusting the queue's front without the cleanup: a packet that already played can sit there with an old time and fake an overdue wait.
- Playing silence when the buffer is empty. With nothing waiting behind the gap, there is nothing to make late.

## Pattern
Reorder buffer (hash map)

## Key idea
Playback only ever needs one seq, the next one, so keep waiting packets in a hash map keyed by seq and pop from `next` while it's there.

## Steps
1. Add `buffer`, a dict from seq to data, and `next`, the next seq to play, starting at 0.
2. In `receive`, drop a seq below `next` first: it was already played.
3. When the window rules keep a packet, also store its data in `buffer`.
4. In `play`, pop `buffer[next]` and add one to `next` while `next` is in the buffer; return the popped data.

## Cost
`O(1)` time per `receive`, `O(1 + k)` per `play` of `k` packets · `O(window + buffered)` space

## Approach

Pattern: a **reorder buffer**, the heart of an audio jitter buffer.

Step 1's window decides which packets to keep. This step decides what happens to them next. Packets arrive in any order but must play strictly in seq order, one seq at a time, so the only question `play` ever asks is "has the next seq arrived?". A hash map from seq to data answers that in `O(1)`:

1. While `next` is in the buffer, pop its data into the output and add one to `next`.
2. At the first missing seq, stop. Everything later stays in the buffer for a future call.

A missing seq always stops playback, even with later packets waiting: they can't play before it, and it may still arrive. The receiver doesn't sort anything, and it never looks at a packet that can't play yet.

The new drop rule, `seq < next`, guards the buffer: a played packet must never come back. In this step the window rules already catch it. A played seq was kept, so either the window still covers it, and then its slot still holds it and it's a duplicate, or it has fallen below the window and is too old. Checking `seq < next` first costs nothing and makes the guarantee obvious. In step 3 it starts to matter.

The weak spot is the stall. A lost packet, or one that arrives after the window has passed it, never enters the buffer, so `next` never moves past it and everything behind it waits forever. Step 3 adds the way out.

## Complexity

`receive` is `O(1)`: the step 1 checks plus one dict insert. `play` is `O(1 + k)` for `k` packets returned. Each packet enters and leaves the buffer once, so all calls together cost `O(calls)`.

Space: `O(window)` for the ring, plus the buffer, which holds every kept packet that hasn't played yet. While playback is stalled that grows without bound, which is why step 3 exists.

## Pitfalls

- Playing past a gap: returning every buffered packet in seq order skips audio that is only late. When the late packet arrives, it counts as played and is lost for good.
- Sorting or scanning the buffer in every `play`. It gives the right answers, but costs `O(buffered)` per call. With seq 0 late and 60,000 packets waiting, that's billions of steps.
- Starting playback at the first packet's seq. Playback starts at seq 0, whatever arrives first: an early seq 5 waits for seqs 0 to 4.

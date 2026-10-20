## Pattern
Generation stamps (epoch counter)

## Key idea
Stamp each window slot with the response's generation as well as its seq; switching generations then empties the window without touching it.

## Steps
1. Add `gen`, the generation being played, starting at 0.
2. In `receive`, drop a packet from an older generation; for a newer one, call `interrupt(gen, t)` first.
3. Stamp ring slots with `(gen, seq)`, so slots written by an older generation never look like duplicates.
4. In `interrupt`, return 0 unless `gen` is newer than the current generation.
5. Otherwise count the buffer, swap in an empty buffer and queue, set `next` to 0 and `top` to -1, and switch `gen`.

## Cost
`O(1)` amortised time per call and per entry returned · `O(window + n)` space for `n` kept packets

## Approach

Pattern: **generation stamps**, also called an epoch counter. To throw away a whole structure in `O(1)`, change the number its entries must carry.

An interrupt has to make the receiver forget the current response: the buffer, the arrival queue, the playback position and the duplicate window. Most of that is easy:

- The buffer and the queue are replaced with empty ones. Each packet in them was added once, so throwing them away costs no more than adding them did.
- `next` goes back to 0 and `top` back to -1, so the next packet kept counts as the first.

The ring is the catch. Resetting its `window` slots costs `O(window)`, and with `window = 10^5` and 80,000 interrupts that's `8 * 10^9` steps. So stamp each slot with the generation as well as the seq: slot `seq % window` holds `(gen, seq)`, and the duplicate check asks whether it holds `(current gen, seq)`. A slot written by an older response carries an older generation, so it never matches. The window is empty the moment `gen` changes, without touching a slot. Within one response, the step 1 argument still holds: a slot holds that response's seq only if it was kept. Clearing just the slots written since the last switch also works, amortised, at the cost of remembering them.

Packets from other generations take one check at the top of `receive`:

- Older: drop it. That covers the old response's packets still in flight, and calls without `gen` (generation 0) once the receiver has moved on.
- Newer: the packet overtook its interrupt. `receive` calls `interrupt(gen, t)` itself, then runs the usual checks. The packet is the first of the new stream, so it's kept. When the real interrupt arrives, its `gen` is no longer newer, so it does nothing and returns 0.

The delay stays: it's a setting of the receiver, not of one response. The old arrival times leave with the old queue, so the new response's wait is measured from its own packets.

## Complexity

An interrupt is `O(1)`, plus freeing the old buffer and queue, which the packets that filled them already paid for. Everything else is as in step 3: `O(1)` amortised per call, plus `O(1)` per entry `play` returns.

Space: the ring is allocated once, `O(window)`. The buffer and queue hold at most the packets kept in the current response.

## Pitfalls

- Not resetting the window. The new response's seq 0 is then judged against the old `top` (too old) or against the old response's seq 0 (a duplicate). Example 3 is built to catch both.
- Rebuilding the ring with `[None] * window` on every interrupt. The answers are right, but each interrupt costs `O(window)`.
- Dropping a packet from a newer generation, or keeping it without switching. Either the new response loses its first packet, or the old audio stays in the buffer and plays.
- Keeping the old arrival queue. An old packet's time at its front makes the new response give up on a seq it has barely waited for.

## Pattern
Circular buffer (sliding window)

## Key idea
Only seqs inside the window can be judged, so give each a slot at `seq % window` holding the seq itself; leftovers from older seqs never match.

## Steps
1. Keep `top`, the highest seq kept (-1 at first), and a ring of `window` slots, each holding the last seq kept there.
2. If `seq > top`, the packet is new: raise `top` to `seq`.
3. Else if `seq <= top - window`, drop it: the window no longer covers it.
4. Else, if slot `seq % window` already holds `seq`, drop it as a duplicate.
5. Store `seq` in its slot and keep the packet.

## Cost
`O(1)` time per packet · `O(window)` space

## Approach

Pattern: a **sliding window** over sequence numbers, stored in a **circular buffer**.

The window is the `window` seqs that end at `top`: `top - window + 1` to `top`. A seq above it is new by definition, since nothing that high has been kept. A seq below it can't be checked, because the receiver has stopped remembering that far back. Dropping it is the safe choice: playing old audio twice is worse than losing it. So only the seqs inside the window need any memory.

Those are `window` consecutive numbers, so `seq % window` gives each one its own slot: a ring. The question is what a slot holds.

A yes/no flag ("was this seq kept?") needs care. When the window slides forward, the slots it moves onto still carry the flags of seqs it left behind, and they must be cleared first. Clearing one slot per seq the window moves costs `O(jump)`, and a jump can be `10^9`.

Storing the seq itself removes the clearing. Slot `seq % window` holds the last seq kept there. For a seq inside the window, the slot holds that exact seq only if it was kept. Any other seq that shares the slot differs from it by a multiple of `window`, so it's either below the window or above `top`, and nothing above `top` has been kept. Leftovers never match, so they never need erasing.

`receive` then reads straight off the rules:

1. `seq > top`: raise `top`, store `seq`, keep. With `top` starting at -1, the first packet lands here too.
2. `seq <= top - window`: drop.
3. The slot holds `seq`: a duplicate, drop.
4. Otherwise store `seq` and keep.

The classic version is a bitmask: bit `i` says whether seq `top - i` was kept, a new `top` shifts the mask left, and a jump of a whole window or more resets it. With 32 or 64 bits (the IPsec and DTLS anti-replay windows) that's a few machine instructions. In Python a `10^5`-bit mask still works, but every shift copies the whole number, `O(window)` per new `top`. The ring stays `O(1)`.

## Complexity

`O(1)` per `receive`, worst case: two comparisons and one slot. `O(window)` memory for the ring, however long the stream runs.

A hash set of every kept seq is also `O(1)` per packet, but its memory grows with the stream. The tests can't see memory; an interviewer can.

## Pitfalls

- The edge. The window covers `top - window + 1` to `top`, so `seq = top - window` is already out. Writing `seq < top - window` lets it through.
- A copy of `top` is a duplicate, not a new packet: `top` is inside the window, and it was kept.
- Flags that aren't cleared when the window slides make a new seq look like a duplicate of an older one in the same slot. Clearing them one seq at a time is too slow when `top` jumps far.

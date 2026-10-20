## Pattern
Lazy deletion with sequence numbers

## Key idea
Give each order a place-in-line number; a raise takes a fresh number and a new heap entry, and the old entry, no longer matching, is dropped when it surfaces.

## Steps
1. Hand out places in line from one counter, `next_seq`, and key the heaps by `(price key, seq, id)`.
2. In `amend`, return false unless the order is resting.
3. Store the new quantity; if it went up, re-queue the order through `_rest`.
4. In `_rest`, give the order a fresh `seq` and push a new entry; its older entry is now stale.
5. In `_best`, drop an entry if its order is gone or now holds a different `seq`.

## Cost
`O(log n)` time per `amend`, amortised `O(log n)` per order elsewhere · `O(n)` space

## Approach

Pattern: **lazy deletion with sequence numbers**. It's step 2's trick with one more way for an entry to go stale.

Until now the place in line was the id: heaps were keyed `(price key, id)`, and ids grow with arrival. A raise breaks that, because the order keeps its id but must queue as if it had just arrived. So the place in line becomes a number of its own, `seq`, drawn from a counter that every resting order and every raise advances. Keying the heaps by `(price key, seq, id)` changes nothing for orders that are never raised: each gets its `seq` when it rests, in arrival order, so the ranking is the same as before.

`amend` is short:

- If the order isn't resting, it has no record in `orders`: return `false`.
- Lowering the quantity, or keeping it: overwrite `qty` in the record. The heap entry, and with it the place in line, stays as it is, just as after a partial fill.
- Raising it: overwrite `qty`, then call `_rest` again. `_rest` hands out the next `seq` and pushes a new entry at the back of the line.

After a raise the order has two entries in its heap: the old one with its old `seq`, and the new one. The record only knows the new `seq`. So an entry is live only if its order still rests **and** the entry's `seq` matches the record's. `_best` checks both and drops whatever fails, the same way it dropped cancelled orders in step 2. The old entry has the same price and a smaller `seq`, so it always surfaces before the new one, and it can never pass for the order's current place.

Why not change the old entry's key in place? The heap would have to find it first, which is a linear search, and `heapq` has no public way to fix up an entry in the middle. A fresh push costs `O(log n)` and needs neither.

## Complexity

`amend` is a dictionary lookup, plus one push when it raises: `O(log n)`. Every entry is pushed once and popped at most once, so stale entries add amortised `O(log n)` per raise to the costs from before. Space is one heap entry per resting order or raise until it surfaces: `O(n)` in the number of calls.

The large test makes 30,000 amends on a book of about 30,000 orders. Searching the heap for the entry and re-keying it is `O(n)` per raise and times out there.

## Pitfalls

- Letting a raised order keep its place by only overwriting the quantity. Every order behind it at that price then waits longer than it should.
- Comparing with the original quantity. A raise is measured against what's left: an order for 10 that has sold 6 has 4, so 7 is a raise.
- Treating the same quantity as a raise. It changes nothing, and the order keeps its place.
- Pushing the new entry without making the old one stale. The order then still trades at its old place, and can stand in line twice.

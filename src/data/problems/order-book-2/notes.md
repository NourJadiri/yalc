## Pattern
Lazy deletion

## Key idea
Cancel only deletes the order's record; its heap entry is dropped when it reaches the top, so cancel is `O(1)` and nobody ever sees a dead order.

## Steps
1. In `cancel`, pop the id from `orders`: true if it was there, false otherwise (unknown, filled or already cancelled).
2. Before reading a heap's top, pop entries whose id is no longer in `orders`.

## Cost
`O(1)` time per `cancel`, amortised `O(log n)` per order elsewhere · `O(n)` space

## Approach

Pattern: **lazy deletion** from a heap.

A heap can't take an entry out of its middle cheaply: you'd have to find it first, and that's a linear search. But nobody needs a cancelled order gone from the middle. The book only ever reads the top of a heap: matching looks at the best order on the other side, and `top()` reads the best prices. So it's enough that a cancelled order never shows up **at the top**.

`cancel` does the cheap half. It deletes the order's record from `orders` and leaves the heap entry where it is. The entry is now dead: its id has no record. One dictionary lookup also decides the return value, because `orders` holds exactly the resting orders. An id that was never used, an order that traded away completely (its record went when it was filled) and an order already cancelled are all missing, so all three return `false`.

The other half lives in `_best`, the one place that reads a heap's top. Before answering, it pops dead entries until a live one is on top or the heap is empty. Matching and `top()` both ask `_best`, so neither had to change, and the book behaves exactly as if the cancelled order had never rested.

A dead entry deeper in the heap does no harm. It never decides which live entry is the best, and once everything above it is gone, it reaches the top and is dropped.

## Complexity

`cancel` is one dictionary pop: `O(1)`. Every heap entry is pushed once and popped at most once, either when its order fills or when it surfaces dead, so the pops add amortised `O(log n)` per order to step 1's costs. Dead entries wait in the heap until they surface, so space is `O(n)` in the number of orders that ever rested.

The alternative, searching the heap for the entry on every cancel, costs `O(n)` per cancel. The large test rests 30,000 orders and then cancels 25,000 of them in random order, which makes that time out.

## Pitfalls

- Dropping dead entries in matching but not in `top()`. Cancel the only ask at 15, and `top()` must stop reporting 15.
- Returning `true` for an order that was filled. If you keep records of filled orders, `cancel` must check that something is still resting.
- Marking an id dead before it exists. `cancel(2)` before order 2 arrives returns `false` and changes nothing: order 2 must still rest and trade normally.

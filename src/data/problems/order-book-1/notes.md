## Pattern
Two heaps

## Key idea
Keep bids in a max-heap and asks in a min-heap, both keyed by price and then id, so the order an arrival meets next is always on top.

## Steps
1. Keep bids in a heap of `(-price, id)` and asks in a heap of `(price, id)`, and each resting order's record by id.
2. Give every arriving order the next id, even one that never rests.
3. While the best order on the other side crosses the price, trade the smaller quantity at the resting order's price.
4. Pop a resting order once it's filled; a partly filled one keeps its heap entry, and so its place in line.
5. Push what's left of the arriving order onto its own side.

## Cost
`O(log n)` time per order plus `O(1)` per fill, `O(1)` per `top` · `O(n)` space

## Approach

Pattern: **two heaps facing each other**, one per side of the book.

Start with who trades next. An incoming buy wants the cheapest ask, and among asks at the same price, the oldest. Ids grow with arrival, so "oldest" means "smallest id", and the whole ranking is the tuple `(price, id)`: a min-heap of asks keyed that way always has the next ask to trade on top. An incoming sell wants the highest bid, then the oldest. Python's `heapq` only has min-heaps, so bids are keyed by `(-price, id)`: the highest price becomes the smallest key, and ties still go to the smaller id.

A heap entry holds only the key and the id. The order itself lives in a dictionary `orders`, from id to a small record: its side, its price and what's left of it. Only resting orders are in there.

Matching an arrival is one loop:

1. Look at the best order on the other side. Stop if there is none, or if its price doesn't cross: an ask above the buy's price, or a bid below the sell's price.
2. Trade `min(what's left, resting order's quantity)` at the **resting** order's price, and record `[buy_id, sell_id, price, qty]`.
3. If that filled the resting order, pop it and drop its record. Otherwise the arrival is the one that's filled, and the loop ends.

Whatever is left of the arrival then rests on its own side.

A partly filled resting order keeps its place for free. Its heap entry is `(price, id)`, and neither part changed, so it's still on top. Only its quantity in `orders` went down.

The book is never crossed between calls: an arrival keeps trading until the other side's best price is out of its reach, and only then rests. So the best bid is always below the best ask, and `top()` just reads the two heap tops.

## Complexity

Each order is pushed at most once and popped at most once, `O(log n)` each, where `n` is the number of resting orders. Every fill but the last one of an arrival empties a resting order and pays for that pop. The last fill may leave a resting order partly filled, which costs `O(1)`. So an arrival costs `O(log n)` for each order it removes and for resting, plus `O(1)` per fill. `top()` reads two heap tops: `O(1)`. Space is `O(n)`.

For comparison, scanning a list of resting orders for the best match is `O(n)` per fill. The large tests make that time out: one keeps about 20,000 orders resting while arrivals cross constantly, and another sweeps through 10,000 one-share orders at a time. A list kept sorted with `bisect.insort` finds each spot in `O(log n)` but shifts up to `n` entries per insert. It runs fast in practice, but it's still linear.

## Pitfalls

- Trading at the incoming order's price. A trade is always at the resting order's price: a buy at 102 that meets an ask at 101 trades at 101.
- Sending a partly filled resting order to the back of its line, for example by popping it and pushing it again with a fresh tiebreaker. It keeps its place with what's left.
- Skipping the id of an order that trades away completely. It never rests, but it still takes the next id.
- Missing trades at exactly the same price. A buy at 100 trades with an ask at 100: the test is `ask <= buy`, and `bid >= sell` for a sell.

# Order Book: Amend Orders

## In short
An order book with cancels → add `amend(order_id, qty)`, which changes a resting order's quantity; raising it costs the order its place in line.

## The task

**Step 3 of 4.** `OrderBook` runs the order book of one stock. Orders arrive one at a time and trade at once with whatever they can; what's left of them waits in the book until it trades or is cancelled. Resting buy orders are called bids, resting sell orders asks. So far the class has:

- `OrderBook()`: an empty book.
- `buy(trader, price, qty)`: an order to buy `qty` shares at `price` or less. Returns the trades it made.
- `sell(trader, price, qty)`: an order to sell `qty` shares at `price` or more. Returns the trades it made.
- `top()`: returns `[best bid, best ask]`: the highest bid price and the lowest ask price, `0` for a side with no orders.
- `cancel(order_id)`: removes what's left of a resting order and returns `true`, or returns `false` if the order isn't resting (no such id yet, traded away completely, or already cancelled).

How orders match:

- Every order gets an id: `1`, `2`, `3`, … in arrival order. Buys and sells share one counter, and an order takes its id even if it never rests.
- Each price on each side has its own line. A resting order joins the back of the line for its price, and a partly filled one keeps its place.
- An incoming buy trades with the asks priced at or below its own price: the lowest price first, and within a price, the line from the front. Each trade happens at the resting order's price, for the smaller of the two remaining quantities. When the buy is filled, or no ask is cheap enough, whatever is left rests as a bid.
- An incoming sell is the mirror image. It trades with the bids priced at or above its own price, the highest price first, then the line from the front, at the resting order's price. Whatever is left rests as an ask.
- `buy` and `sell` return their trades in the order they happened, each as `[buy_id, sell_id, price, qty]`, or `[]` if there were none. `trader` doesn't change anything yet, because no order is ever priced to trade with a resting order of its own trader (see Constraints).

**New in this step**

`amend(order_id, qty)` sets the remaining quantity of a resting order to `qty` and returns `true`. The order keeps its id, its price and its side. The remaining quantity is what's left after earlier trades: an order for 10 shares that has sold 6 has 4 left, so amending it to 7 is a raise.

- Lowering the quantity keeps the order's place in line.
- Raising it sends the order to the back of the line at its price, as if it had just arrived: behind every order resting at that price now, and ahead of any that arrives later.
- The same quantity changes nothing, and still returns `true`.
- If the order isn't resting (no order has that id yet, it traded away completely, or it was cancelled), return `false` and change nothing.
- Amending never trades, since the price doesn't change.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, a list of trades for `buy` and `sell`, a pair of prices for `top`, and `true` or `false` for `cancel` and `amend`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["OrderBook","sell","sell","amend","buy"]
args = [[],["ann",40,5],["bob",40,5],[1,2],["cat",40,4]]
                                        -> [null,[],[],true,[[3,1,40,2],[3,2,40,2]]]
```

Lowering order 1 to 2 shares keeps it first in line, so order 3 buys those 2 before it reaches order 2.

**Example 2**

```
ops  = ["OrderBook","sell","sell","amend","buy","top"]
args = [[],["ann",40,5],["bob",40,5],[1,8],["cat",40,6],[]]
                                        -> [null,[],[],true,[[3,2,40,5],[3,1,40,1]],[0,40]]
```

Raising order 1 to 8 sends it behind order 2. Order 3 takes all of order 2 first, then 1 share of order 1, which still rests with 7.

**Example 3**

```
ops  = ["OrderBook","buy","buy","sell","amend","sell","amend","amend"]
args = [[],["ann",25,10],["bob",25,3],["cat",25,4],[1,8],["dan",25,5],[2,3],[9,1]]
                                        -> [null,[],[],[[1,3,25,4]],true,[[2,4,25,3],[1,4,25,2]],false,false]
```

After order 3, order 1 has 6 shares left, so 8 is a raise even though the order was placed for 10. It moves behind order 2. Order 4 then fills order 2, which can no longer be amended, and no order has id 9.

## Constraints

- `1 <= price <= 10^4` and `1 <= qty <= 10^4`, in `amend` too.
- `1 <= order_id <= 10^5`.
- `trader` is 1 to 10 lowercase English letters.
- No order can trade with a resting order of its own trader: a buy is always priced below every ask of the same trader, and a sell above every bid of the same trader.
- At most `10^5` calls in total.

## Aim for

Searching a heap for an order's entry to re-key it is `O(n)`. Instead, give each resting order a place in line, `seq`, from one counter that new orders and raises share, and key the heaps by price, then `seq`. Lowering a quantity only changes the order's record. Raising takes a fresh `seq` and pushes a new heap entry. The old entry stays in the heap, but its `seq` no longer matches the order's, so it is recognised as stale and dropped when it reaches the top, just like a cancelled order's. `amend` is `O(log n)`, and everything else stays amortised `O(log n)` per order.

## Follow-ups

- Let `amend` change the price too. Why should that cost the order its place, and when can it trade?
- Exchanges let a trader lower a quantity without losing their place, but not raise it. What would traders do if raising kept the place?
- Next step: who traded with whom, with self-trade prevention and each trader's profit and loss.

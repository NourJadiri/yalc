# Order Book: Cancel Orders

## In short
An order book that matches on arrival → add `cancel(order_id)`, which pulls a resting order out of the book and says whether it could.

## The task

**Step 2 of 4.** `OrderBook` runs the order book of one stock. Orders arrive one at a time and trade at once with whatever they can; what's left of them waits in the book. Resting buy orders are called bids, resting sell orders asks. So far the class has:

- `OrderBook()`: an empty book.
- `buy(trader, price, qty)`: an order to buy `qty` shares at `price` or less. Returns the trades it made.
- `sell(trader, price, qty)`: an order to sell `qty` shares at `price` or more. Returns the trades it made.
- `top()`: returns `[best bid, best ask]`: the highest bid price and the lowest ask price, `0` for a side with no orders.

How orders match:

- Every order gets an id: `1`, `2`, `3`, … in arrival order. Buys and sells share one counter, and an order takes its id even if it never rests.
- An incoming buy trades with the asks priced at or below its own price: the lowest price first, and among equal prices the one that arrived first. Each trade happens at the resting order's price, for the smaller of the two remaining quantities. When the buy is filled, or no ask is cheap enough, whatever is left rests as a bid.
- An incoming sell is the mirror image. It trades with the bids priced at or above its own price, the highest price first, then the earliest arrival, at the resting order's price. Whatever is left rests as an ask.
- A partly filled resting order keeps its place in line.
- `buy` and `sell` return their trades in the order they happened, each as `[buy_id, sell_id, price, qty]`, or `[]` if there were none. `trader` doesn't change anything yet.

**New in this step**

- `cancel(order_id)`: if the order is resting in the book, even partly filled, remove what's left of it and return `true`. Return `false` if no order has that id yet, if the order traded away completely, or if it was already cancelled. A cancel that returns `false` changes nothing.

From then on, matching and `top()` behave as if what was left of the order had never been in the book. Its earlier trades stand, and its id isn't reused.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, a list of trades for `buy` and `sell`, a pair of prices for `top`, and `true` or `false` for `cancel`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["OrderBook","sell","sell","sell","cancel","top","buy"]
args = [[],["ann",20,5],["bob",21,5],["cat",20,5],[1],[],["dan",21,8]]
                                        -> [null,[],[],[],true,[0,20],[[4,3,20,5],[4,2,21,3]]]
```

Order 1 was first in line at 20. Once it's cancelled, order 3 is the best ask, and order 4 buys from it before moving up to order 2 at 21.

**Example 2**

```
ops  = ["OrderBook","buy","buy","sell","cancel","cancel","cancel","cancel","cancel","top"]
args = [[],["ann",30,4],["bob",29,2],["cat",30,6],[1],[3],[2],[2],[9],[]]
                                        -> [null,[],[],[[1,3,30,4]],false,true,true,false,false,[0,0]]
```

Order 3 fills order 1 completely, so order 1 can't be cancelled. Order 3 rests with 2 shares at 30, so cancelling it works. Order 2 can be cancelled once; the second try fails, and so does an id no order has.

**Example 3**

```
ops  = ["OrderBook","sell","sell","cancel","top","buy","top"]
args = [[],["ann",15,3],["bob",18,3],[1],[],["cat",16,2],[]]
                                        -> [null,[],[],true,[0,18],[],[16,18]]
```

With order 1 gone, the best ask is 18. Order 3 would have traded with order 1 at 15, but now no ask is cheap enough, so it rests as a bid at 16.

## Constraints

- `1 <= price <= 10^4` and `1 <= qty <= 10^4`.
- `1 <= order_id <= 10^5`.
- `trader` is 1 to 10 lowercase English letters.
- No order can trade with a resting order of its own trader: a buy is always priced below every ask of the same trader, and a sell above every bid of the same trader.
- At most `10^5` calls in total.

## Aim for

Taking an entry out of the middle of a heap means finding it first, which is `O(n)`. Don't. Use **lazy deletion**: `cancel` only drops the order's record, in `O(1)`, and leaves its heap entry where it is. When a dead entry reaches the top of a heap, whoever looks there (matching or `top()`) pops it and looks again. Each entry is popped at most once, so this adds amortised `O(log n)` per order, and nobody ever sees a cancelled order.

## Follow-ups

- Dead entries pile up when traders cancel far from the best price. When would you rebuild a heap, and what would that cost?
- Add `replace(order_id, price, qty)`: cancel an order and send a new one in a single call. Should the new order keep the old id?
- Next step: changing the quantity of a resting order.

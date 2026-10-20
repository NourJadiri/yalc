# Order Book: Match on Arrival

## In short
An order book for one stock → `buy`/`sell` match against resting orders, best price first, and return the trades; `top` shows the best prices.

## The task

**Step 1 of 4.** Over four steps you'll build the matching engine of a small exchange that trades one stock. This step is the core. Orders arrive one at a time. Each one trades at once with whatever it can, and what's left of it waits in the book. Resting buy orders are called bids, resting sell orders asks. Implement `class OrderBook`:

- `OrderBook()`: an empty book.
- `buy(trader, price, qty)`: an order to buy `qty` shares at `price` or less. Returns the trades it made.
- `sell(trader, price, qty)`: an order to sell `qty` shares at `price` or more. Returns the trades it made.
- `top()`: returns `[best bid, best ask]`: the highest price among the bids and the lowest among the asks, `0` for a side with no orders.

The rules:

- Every order gets an id: `1`, `2`, `3`, … in arrival order. Buys and sells share one counter, and an order takes its id even if it trades away completely and never rests.
- An incoming buy trades with the asks priced at or below its own price. The lowest price goes first, and among asks at the same price, the one that arrived first. Each trade happens at the resting order's price, for the smaller of the two remaining quantities. Matching stops when the buy is filled or no ask is cheap enough. Whatever is left rests in the book as a bid.
- An incoming sell is the mirror image. It trades with the bids priced at or above its own price, the highest price first, then the earliest arrival, always at the resting order's price. Whatever is left rests as an ask.
- A resting order that is partly filled keeps its place in line, with what's left of it.
- `buy` and `sell` return the trades in the order they happened, each as `[buy_id, sell_id, price, qty]`, or `[]` if there were none.
- `trader` names who sent the order. It changes nothing in this step, because no order is ever priced to trade with a resting order of its own trader (see Constraints). A later step uses it.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, a list of trades for `buy` and `sell`, and a pair of prices for `top`.

## Examples

**Example 1**

```
ops  = ["OrderBook","sell","sell","sell","buy","top"]
args = [[],["ann",103,5],["bob",101,3],["cat",102,4],["dan",102,9],[]]
                                        -> [null,[],[],[],[[4,2,101,3],[4,3,102,4]],[102,103]]
```

Order 4 takes the cheapest ask first: 3 shares from order 2, at that order's price of 101. Then it takes 4 shares from order 3 at 102. Order 1 asks 103, more than order 4 will pay, so its last 2 shares rest as a bid at 102.

**Example 2**

```
ops  = ["OrderBook","buy","buy","sell","sell","top"]
args = [[],["ann",50,4],["bob",50,6],["cat",50,3],["dan",49,5],[]]
                                        -> [null,[],[],[[1,3,50,3]],[[1,4,50,1],[2,4,50,4]],[50,0]]
```

Both bids are at 50, and order 1 arrived first, so order 3 takes 3 of order 1's 4 shares. Order 1 keeps its place with 1 share left, so order 4 fills that share before it reaches order 2. Order 4 sells at 50, not 49: a trade is always at the resting order's price.

**Example 3**

```
ops  = ["OrderBook","top","buy","sell","sell","buy","top"]
args = [[],[],["ann",10,2],["bob",8,2],["cat",9,1],["dan",9,1],[]]
                                        -> [null,[0,0],[],[[1,2,10,2]],[],[[4,3,9,1]],[0,0]]
```

Order 2 trades away completely and never rests, but it still takes id 2, so cat's sell is order 3. An empty side reads as `0`.

## Constraints

- `1 <= price <= 10^4` and `1 <= qty <= 10^4`.
- `trader` is 1 to 10 lowercase English letters.
- No order can trade with a resting order of its own trader: a buy is always priced below every ask of the same trader, and a sell above every bid of the same trader.
- At most `10^5` calls in total.

## Aim for

Scanning every resting order for the best match costs `O(n)` per fill. Name it, then beat it with two heaps facing each other, as in Find Median from Data Stream: a max-heap of bids keyed by `(-price, id)` and a min-heap of asks keyed by `(price, id)`, with each resting order's remaining quantity stored by id. The best order of each side sits on top, and the id breaks price ties by arrival. An order costs `O(log n)` to rest or to leave the book, plus `O(1)` per fill. `top()` is `O(1)`.

## Follow-ups

- Prices move in whole ticks inside a narrow band. How would an array of first-in-first-out queues, one per price, compare with the heaps?
- Add market orders, which take any price. What should happen to the part that finds nothing to trade with?
- Next step: cancelling a resting order.

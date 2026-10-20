# Order Book: Traders and P&L

## In short
An order book with cancels and amends → block trades between a trader and themselves, and report each trader's `position` and `pnl`.

## The task

**Step 4 of 4.** `OrderBook` runs the order book of one stock. Orders arrive one at a time and trade at once with whatever they can; what's left of them waits in the book until it trades or is cancelled. Resting buy orders are called bids, resting sell orders asks. So far the class has:

- `OrderBook()`: an empty book.
- `buy(trader, price, qty)`: an order to buy `qty` shares at `price` or less. Returns the trades it made.
- `sell(trader, price, qty)`: an order to sell `qty` shares at `price` or more. Returns the trades it made.
- `top()`: returns `[best bid, best ask]`: the highest bid price and the lowest ask price, `0` for a side with no orders.
- `cancel(order_id)`: removes what's left of a resting order and returns `true`, or returns `false` if the order isn't resting (no such id yet, traded away completely, or already cancelled).
- `amend(order_id, qty)`: sets the remaining quantity of a resting order and returns `true`, or `false` if the order isn't resting. Raising the quantity sends the order to the back of the line at its price; lowering it, or keeping it, keeps the order's place.

How orders match:

- Every order gets an id: `1`, `2`, `3`, … in arrival order. Buys and sells share one counter, and an order takes its id even if it never rests.
- Each price on each side has its own line. A resting order joins the back of the line for its price, and a partly filled one keeps its place.
- An incoming buy trades with the asks priced at or below its own price: the lowest price first, and within a price, the line from the front. Each trade happens at the resting order's price, for the smaller of the two remaining quantities. When the buy is filled, or no ask is cheap enough, whatever is left rests as a bid.
- An incoming sell is the mirror image. It trades with the bids priced at or above its own price, the highest price first, then the line from the front, at the resting order's price. Whatever is left rests as an ask.
- `buy` and `sell` return their trades in the order they happened, each as `[buy_id, sell_id, price, qty]`, or `[]` if there were none.

**New in this step**

In the earlier steps, no order could ever reach a resting order of its own trader. Now it can, and the book must not let a trader trade with themselves.

- Self-trade prevention: when matching reaches a resting order of the incoming order's trader (it's the next order in line, and its price is one the incoming order would trade at), that resting order is cancelled. What's left of it leaves the book, exactly as `cancel` would remove it, and matching carries on with the next resting order. The cancel is not a trade and doesn't appear in the returned list.
- A resting order of the same trader that matching never reaches, because the incoming order is filled first or the price is out of reach, stays in the book.
- `position(trader)`: the shares the trader has bought minus the shares they have sold, over all of their trades.
- `pnl(trader, mark)`: the trader's profit and loss with their shares valued at `mark`: `cash + position * mark`. `cash` is what they received for everything they sold minus what they paid for everything they bought, at `price * qty` per trade.
- Both return `0` for a trader with no trades, including a name the book has never seen.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, a list of trades for `buy` and `sell`, a pair of prices for `top`, `true` or `false` for `cancel` and `amend`, and a number for `position` and `pnl`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["OrderBook","sell","sell","buy","cancel","top"]
args = [[],["ann",10,3],["bob",11,4],["ann",12,5],[1],[]]
                                        -> [null,[],[],[[3,2,11,4]],false,[12,0]]
```

Ann's buy, order 3, reaches her own ask first. Order 1 is cancelled, and matching moves on to bob's order 2. The last share rests as a bid at 12. Order 1 is already cancelled, so cancelling it again fails.

**Example 2**

```
ops  = ["OrderBook","buy","sell","sell","position","position","pnl","pnl","pnl"]
args = [[],["ann",100,10],["bob",99,4],["cat",100,6],["ann"],["bob"],["ann",105],["bob",105],["dan",105]]
                                        -> [null,[],[[1,2,100,4]],[[1,3,100,6]],10,-4,50,-20,0]
```

Ann bought 10 shares at 100 each: bob asked 99, but the trade is at ann's resting price. Her cash is `-1000`, so at a mark of 105 her pnl is `-1000 + 10 * 105 = 50`. Bob received 400 and is short 4 shares: `400 - 4 * 105 = -20`. Dan never traded.

**Example 3**

```
ops  = ["OrderBook","sell","sell","sell","buy","top"]
args = [[],["bob",10,2],["ann",11,3],["ann",14,1],["ann",12,4],[]]
                                        -> [null,[],[],[],[[4,1,10,2]],[12,14]]
```

Order 4 buys bob's 2 shares, then reaches ann's own order 2 and cancels it. Ann's order 3 at 14 is out of reach, so it stays, and the rest of order 4 rests as a bid at 12.

## Constraints

- `1 <= price <= 10^4`, `1 <= qty <= 10^4` (in `amend` too) and `1 <= mark <= 10^4`.
- `1 <= order_id <= 10^5`.
- `trader` is 1 to 10 lowercase English letters.
- At most `10^5` calls in total.

## Aim for

Both features live in the matching loop you already have. Self-trade prevention is one check after the price check: if the resting order on top belongs to the incoming trader, cancel it the way `cancel` does, with lazy deletion taking care of its heap entry, and go around the loop again. For P&L, keep two running totals per trader, shares and cash, and update both sides of every fill. Then `position` and `pnl` are `O(1)` reads. Adding up a log of trades on every query is `O(trades)` per call and too slow.

## Follow-ups

- Charge the incoming order a fee on every fill and pay the resting order a rebate. Where do your totals change, and why would an exchange pay the resting side?
- Run a thousand stocks at once. What stays per stock, what is shared, and what does `position` become?
- The exchange must survive a crash without losing a trade. What would you write to a log before answering a call, and what can be rebuilt from that log?

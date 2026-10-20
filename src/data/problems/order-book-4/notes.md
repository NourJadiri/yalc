## Pattern
Simulation with running totals

## Key idea
Both features live in the matching loop: cancel an own resting order the moment matching reaches it, and post every fill to both traders' running totals.

## Steps
1. Keep two totals per trader, `shares` and `cash`, both starting at 0.
2. Answer `position` from `shares`, and `pnl` as `cash + shares * mark`.
3. In matching, after the price check, if the resting order is the trader's own, cancel it and loop again.
4. On each fill, move the shares from the seller to the buyer, and `price * qty` cash the other way.

## Cost
`O(1)` time per `position` and `pnl`, `O(1)` extra per fill · `O(n + t)` space for `t` traders

## Approach

Pattern: **simulation with running totals**. The data structures don't change; both features are a few lines in the loop that already exists.

**Self-trade prevention.** The loop looks at the best resting order on the other side and stops if its price is out of reach. Right after that check, compare traders. If the resting order belongs to the incoming trader, cancel it exactly as `cancel` would: drop its record, and lazy deletion pops its heap entry the next time `_best` looks. Then go around the loop again, and the next order in line is on top. The incoming order loses nothing: it keeps its whole remaining quantity and meets the next resting order.

The order of the two checks matters. Matching reaches a resting order only when it is next in line and its price is one the incoming order would trade at. An own order that's out of reach, or that is never reached because the incoming order fills first, stays in the book. So the price check comes first, then the trader check.

Because the cancel goes through `cancel`, the rest of the book already knows the order is gone: `top()` stops reporting it, `cancel` and `amend` return `false` for it, and its heap entries are dead.

**P&L.** A trade moves `qty` shares from the seller to the buyer, and `price * qty` cash from the buyer to the seller, at the resting order's price. Keep two dictionaries, `shares` and `cash`, and update both traders on every fill. Then `position(trader)` is the trader's `shares`, and `pnl(trader, mark)` is `cash + shares * mark`: what the trader would end up with if they sold all they hold at `mark`, or bought back what they're short. Reading with `.get(trader, 0)` answers 0 for anyone who never traded.

Why every earlier test still passes: before this step no order could reach its own trader's resting order, so the new check never fires on those tests, and the totals only feed the new methods.

## Complexity

A self-trade cancel is `O(1)`, plus its heap pop when the entry surfaces, amortised `O(log n)` like any other cancel. Each fill does four dictionary updates, `O(1)`. `position` and `pnl` are `O(1)`. Space grows by two numbers per trader who has traded.

The alternative, logging every trade and adding up a trader's trades on each query, is `O(trades)` per query. The large test mixes about 12,000 queries into 24,000 orders from four traders, about 15,000 trades, and that times out even with a separate list of trades per trader.

## Pitfalls

- Skipping your own resting order but leaving it in the book. It must be cancelled: otherwise `top()` still shows it, `cancel` still finds it, and the next trader trades with it.
- Cancelling the incoming order instead, or stopping at the own order. The incoming order keeps matching with the next resting order.
- Checking the trader before the price. An own order that's out of reach was never reached, so it stays.
- Moving cash at the incoming order's price. Cash moves at the trade price, which is the resting order's price.

## Pattern
Per-key aggregates with delta updates

## Key idea
A scan or a new promotion changes one sku's cost only, so make that cost cheap to recompute from a few sums and move the running subtotal by its change.

## Steps
1. Give each promotion a `saving(tally)` that runs in `O(1)`: a multibuy reads the sku's unit count, a percent off its lines' summed savings.
2. Keep a `Tally` per sku in the basket: its lines, their units, their prices and their savings under the sku's promotion.
3. In `scan`, note the sku's cost, add the line to its tally, and move the running subtotal by the change in cost.
4. In `total`, subtract the largest amount among the spend discounts whose threshold the subtotal reaches.
5. In the new `add_` methods, refuse anything invalid first; a new item promotion re-prices its sku's lines and moves the subtotal by the change.

## Cost
`O(1)` time per scan, `O(coupons)` per total · `O(products + lines)` space

## Approach

Pattern: **aggregates per key** (here, per sku) kept up to date with **delta updates**.

Look at what each rule needs to know:

- A multibuy needs the number of units of its sku in the whole basket. It doesn't care how they were split into lines.
- A percent off needs each line's own price, because each line's saving is rounded on its own. Two lines of 125 at 10% save 13 + 13 = 26, while 250 at once would save 25.
- A spend discount needs the subtotal of the whole basket.

So the basket gets a `Tally` per sku: the sku's lines, the units summed, the line prices summed (`gross`), and the lines' savings summed (`line_savings`). Each promotion is a small class with `line_saving(line)` and `saving(tally)`:

- `Multibuy`: `line_saving` is 0, and `saving` is `units // n * (n * unit_price - price)`, one saving per complete group.
- `PercentOff`: `line_saving` is `(line.price * percent + 50) // 100`, the same halves-up trick as in step 2, and `saving` is the tally's `line_savings`.

A sku's cost is `gross - promotion.saving(tally)`, or just `gross` without a promotion. That's `O(1)`.

The running total from the earlier steps becomes a running subtotal: the sum of every tally's cost. Every change touches one sku, so every change follows one pattern. Note the sku's cost, make the change, and add the difference to the subtotal.

- `scan`: the change is `tally.add(line)`. If the sku already has a percent off, the new line's saving goes into `line_savings` right away.
- A new item promotion: the change is attaching it. Lines scanned before it arrived haven't been priced under it yet, so `reprice` sums their savings once. A sku gets at most one item promotion, so that costs `O(lines)` once per sku at most.

`total` picks the spend discount every time it's called. The subtotal can go down as well as up, because a late promotion lowers it, so a coupon that applied a moment ago may not apply now. There are at most 20 coupons, so a plain scan for the largest qualifying amount is fine.

The validation in `add_multibuy` and `add_percent_off` runs before anything is touched. A refused call returns `False` and the checkout is exactly as it was.

## Complexity

`scan` is `O(1)`: a few additions and two `cost()` calls. `total` is `O(coupons)`, at most 20. Attaching an item promotion costs `O(lines of that sku)` once. Space is `O(products + lines)`.

Re-pricing the whole basket inside `total()` is `O(lines)` per call. Re-pricing a sku from its lines on every scan is `O(lines of that sku)` per scan, which turns quadratic when one sku is scanned thousands of times. The large tests do both.

## Pitfalls

- Applying a multibuy to each line on its own. Two single scans of milk then never form "2 for 2.00".
- Rounding the percent-off saving once per sku instead of once per line.
- Forgetting the lines that were scanned before their promotion was added.
- Checking a spend discount's threshold against the total before item promotions, or remembering which coupon applied. A promotion added later can push the subtotal back below a threshold, and the total goes up.
- Changing state before validating, so a refused promotion is half applied.

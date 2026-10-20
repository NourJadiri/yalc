## Pattern
Strategy pattern for promotions

## Key idea
Each promotion is an object that prices its own sku's lines, so the checkout just groups lines by sku, asks each promotion for its saving, and recomputes everything when asked.

## Steps
1. Make each promotion a class that knows its product and works out its saving from that sku's lines: units for a multibuy, line by line for a percent off.
2. Group the basket's lines by sku, in the order the skus first appear.
3. Make the subtotal every line's price minus, for each promoted sku, what its promotion saves on that sku's lines.
4. In `total`, subtract the largest amount among the spend discounts whose threshold the subtotal reaches.
5. In the new `add_` methods, refuse anything invalid before changing anything; otherwise store the promotion under its sku, or keep the coupon.

## Cost
`O(lines + coupons)` time per total, `O(1)` per other call · `O(products + lines)` space

## Approach

Pattern: the **strategy pattern**. Each kind of promotion is a small class, and all of them answer the same question: what do you save on these lines?

Look at what each rule needs to know:

- A multibuy needs the number of units of its sku in the whole basket. It doesn't care how they were split into lines.
- A percent off needs each line's own price, because each line's saving is rounded on its own. Two lines of 125 at 10% save 13 + 13 = 26, while 250 at once would save 25.
- A spend discount needs the subtotal of the whole basket.

So every promotion gets the same method, `saving(lines)`, and is handed the lines of its own sku:

- `Multibuy.saving`: count the units on the lines, then `groups * (n * unit_price - price)`, one saving per complete group.
- `PercentOff.saving`: `(line.price() * percent + 50) // 100` for each line, added up. It's the halves-up trick from step 2.

The checkout keeps the promotions in a dict by sku, which also makes "at most one item promotion per sku" a single membership test. `_groups()` sorts the basket's lines into a dict from sku to lines. A dict remembers insertion order, so the skus come out in the order they first appear in the basket. `_subtotal()` is every line's price minus each promoted sku's saving on its group. `total()` then takes off the largest qualifying spend discount, with a plain loop over at most 20 coupons.

Nothing is stored that could go stale. A promotion added after the scans counts at the next `total()`. A promotion that pushes the subtotal below a coupon's threshold switches that coupon off, so the total can go up.

The validation in `add_multibuy` and `add_percent_off` runs before anything is touched. A refused call returns `False` and the checkout is exactly as it was.

## Complexity

`total` is `O(lines + coupons)`: one pass prices the lines, one groups them, and each promotion looks at its own group only. `scan` and the `add_` methods are `O(1)`. Space is `O(products + lines)`.

The limits (500 lines, 500 calls to `total`, 50 promotions, 20 coupons) keep any plain version quick, even one where each promotion filters the whole basket for its own lines, `O(lines * promotions)` per call. The large tests are scale and correctness checks. Only work that is quadratic in the basket on every call runs out of time, such as collecting each line's sku-mates by scanning the whole basket again for every line.

## Pitfalls

- Applying a multibuy to each line on its own. Two single scans of milk then never form "2 for 2.00".
- Rounding the percent-off saving once per sku instead of once per line.
- Checking a spend discount's threshold against the total before item promotions.
- Changing state before validating, so a refused promotion is half applied.

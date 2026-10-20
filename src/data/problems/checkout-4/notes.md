## Pattern
Per-key stacks and integer formatting

## Key idea
The line to void is always the newest in its sku's tally, so the tally doubles as a stack: pop the line, reverse its sums, and every total stays right.

## Steps
1. Write `money(cents)` with integer arithmetic, `f"{cents // 100}.{cents % 100:02d}"`, so 150 prints as `1.50` and 5 as `0.05`.
2. Let each product and promotion print its own receipt line; a weight prints as `f"{g // 1000}.{g % 1000:03d}"` kilograms.
3. Give `Tally` a `remove_last()` that pops its newest line and takes it out of every sum, the mirror of `add`.
4. In `void`, return `False` if the sku has no lines; otherwise pop its newest, flag it voided, and move the subtotal by the change.
5. In `receipt`, print the lines in scan order, then saving promotions by first appearance, then subtotal, coupon (largest amount, lowest threshold) and total.

## Cost
`O(1)` time per void, `O(lines + skus)` per receipt · `O(products + lines)` space

## Approach

Pattern: a **stack per key** for the void, and **integer formatting** for the receipt.

**Void.** The statement asks for the most recent line of the sku that is still in the basket. Each sku's tally from step 3 already keeps its lines oldest first, so that line is always `tally.lines[-1]`: the tally is a stack. `remove_last()` pops it and subtracts exactly what `add` added: its units, its price, and its own saving under the sku's promotion, if it has one. The subtotal gets the same delta update as a scan: note the sku's cost, pop, and add the difference. A multibuy group that loses a unit breaks up by itself, because the saving is computed from the unit count.

The scan-order list still holds the voided line, and taking it out of the middle of a list would cost `O(lines)`. Instead the line is flagged `voided`, and the receipt skips flagged lines. A later scan of the same sku appends a new line at the end, as usual.

The subtotal can now go down, and a coupon that applied a moment ago may not apply now. `total` already chooses the coupon afresh on every call, so nothing else changes.

**Receipt.** Its five parts come out in three moves.

1. One pass over the scan-order list. Each live line prints itself: `Product.describe` writes `qty x unit price`, and `WeighedProduct.describe` writes the weight in kilograms. The same pass records each sku the first time it shows up, in a dict, which keeps insertion order.
2. For each recorded sku, its promotion prints itself if it saves more than 0. A multibuy without a complete group, or a 1% off a 49-cent line, saves nothing and prints nothing.
3. Then the subtotal, the coupon if one applies, and the total. The coupon is the qualifying spend discount with the largest amount; on a tie, the one with the lowest threshold. `max` with the key `(amount, -threshold)` says exactly that.

Each kind of product and promotion formats its own line, so a new kind means one new class and no change to `receipt`.

**Money.** Cents are integers, so print them with integers: `cents // 100`, a dot, and `cents % 100` padded to two digits. `str(cents / 100)` prints `1.5` for 150 and `5.0` for 500. Kilograms work the same way, with three digits.

## Complexity

`void` is `O(1)`: a pop, three subtractions and two `cost()` calls. `receipt` is `O(scans + skus)`, voided scans included. `total` stays `O(coupons)`, at most 20. Space is `O(products + scans)`.

Searching the scan-order list backwards for the sku's latest line works, but costs `O(lines)` per void. Re-pricing the sku from all its lines after a void costs `O(lines of that sku)`. The large tests void lines that sit behind 20,000 others, thousands of times.

## Pitfalls

- Voiding the sku's first line instead of its most recent one.
- Forgetting to take the voided line out of the promotion's sums: its units for a multibuy, its own saving for a percent off.
- Printing money through floats: `1.5` instead of `1.50`, `0.5` instead of `0.50`.
- Printing a promotion that saves nothing.
- Ordering promotion lines by when the promotion was added instead of by the sku's first appearance among the remaining lines. A sku voided away and scanned again moves to the end.
- Breaking a tie between spend discounts by the first one added instead of the lowest threshold.

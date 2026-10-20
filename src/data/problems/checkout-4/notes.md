## Pattern
Backward search and integer formatting

## Key idea
Everything is recomputed from the lines, so a void just deletes the sku's newest line, found from the end, and the receipt prints what the same helpers compute.

## Steps
1. Write `money(cents)` with integer arithmetic, `f"{cents // 100}.{cents % 100:02d}"`, so 150 prints as `1.50` and 5 as `0.05`.
2. Let each product and promotion print its own receipt line; a weight prints as `f"{g // 1000}.{g % 1000:03d}"` kilograms.
3. Pick the coupon in one place: the qualifying spend discount with the largest amount, and on a tie the lowest threshold.
4. In `void`, walk back from the newest line to the sku's most recent one and delete it; return `False` if there is none.
5. In `receipt`, print the lines in scan order, then saving promotions by first appearance, then subtotal, coupon and total.

## Cost
`O(lines)` time per void, `O(lines + coupons)` per receipt or total · `O(products + lines)` space

## Approach

Pattern: a **backward search** for the void, and **integer formatting** for the receipt.

**Void.** The statement asks for the most recent line of the sku that is still in the basket. The basket is a list in scan order, so walk it from the end, `range(len(self.lines) - 1, -1, -1)`, and the first line of that sku you meet is the one. Delete it with `del self.lines[i]`, and that's the whole job. Totals and savings are recomputed from the lines every time they're asked for, so there is nothing else to undo. A multibuy group that loses a unit breaks up by itself, a percent-off line takes its saving with it, and a coupon whose threshold is no longer reached stops applying. A later scan of the same sku appends a new line at the end, as usual.

**Receipt.** Its five parts come out in three moves.

1. One line per basket line, in scan order. Each line is printed by its product: `Product.describe` writes `qty x unit price`, and `WeighedProduct.describe` writes the weight in kilograms.
2. The same `_groups()` that the subtotal uses, which yields the skus in the order they first appear. For each sku with a promotion, ask for its saving and print the promotion's line if the saving is more than 0. A multibuy without a complete group, or a 1% off a 49-cent line, saves nothing and prints nothing.
3. Then the subtotal, the coupon if one applies, and the total. `_coupon` picks the qualifying spend discount with the largest amount, and on a tie the lowest threshold: `max` with the key `(amount, -threshold)` says exactly that. `total()` uses `_coupon` too, so the receipt and the total can't disagree.

Each kind of product and promotion formats its own line, so a new kind means one new class and no change to `receipt`.

**Money.** Cents are integers, so print them with integers: `cents // 100`, a dot, and `cents % 100` padded to two digits. `str(cents / 100)` prints `1.5` for 150 and `5.0` for 500. Kilograms work the same way, with three digits.

## Complexity

`void` is `O(lines)`: a backward search and one deletion. `receipt` is `O(lines + coupons)`, like `total`. Space is `O(products + lines)`.

With at most 500 lines, 500 voids, 500 totals and 20 receipts, the plain design runs in well under a second. The large tests are scale and correctness checks. At these sizes nothing natural is quadratic per void or per receipt, so they can't tell a backward search from anything cleverer. The tests carried over from the earlier steps still fail a `total` that does quadratic work per call.

## Pitfalls

- Voiding the sku's first line instead of its most recent one.
- Printing money through floats: `1.5` instead of `1.50`, `0.5` instead of `0.50`.
- Printing a promotion that saves nothing.
- Ordering promotion lines by when the promotion was added instead of by the sku's first appearance among the remaining lines. A sku voided away and scanned again moves to the end.
- Breaking a tie between spend discounts by the first one added instead of the lowest threshold.

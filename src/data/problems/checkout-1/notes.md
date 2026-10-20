## Pattern
Hash map plus a running total

## Key idea
The total only changes when a line is added, so add each line's price to a running sum as it is scanned; `total()` then just reads that number.

## Steps
1. Keep a dict from sku to product, a list of lines for the basket, and a running total starting at 0.
2. In `add_product`, return `False` if the sku is already in the dict; otherwise store the new product.
3. In `scan`, look the sku up (missing: `False`), append a line of `qty` units, and add its price to the running total.
4. Make `total` return the running total.

## Cost
`O(1)` time per call · `O(products + lines)` space

## Approach

Pattern: a **hash map** for the catalog and a **running total** as a cache over the basket.

Three small classes keep the model plain:

- `Product`: sku, name and unit price. It knows how to price `qty` units: `line_price(qty)`.
- `Line`: one scan. It points at its product, holds `qty`, and stores its price, worked out once when the line is scanned.
- `Checkout`: the catalog (`sku -> Product`), the basket (a list of `Line`s in scan order) and the running total.

`add_product` checks before it writes. A dict assignment silently replaces the old value, so `products[sku] = Product(...)` on its own would overwrite the first price. Test `sku in self.products` first and return `False` without touching anything.

`scan` looks the sku up. A missing sku returns `False` and adds nothing. Otherwise it builds a `Line`, appends it, and adds `line.price` to the running total. Repeated scans of one sku stay separate lines: the statement says each scan is its own line, and the basket is the record of what happened at the till.

`total` returns the running total. The invariant: after every call, the running total equals the sum of the prices of the lines in the basket. Only `scan` adds lines, and it updates the sum in the same step, so the invariant always holds.

## Complexity

Every call is `O(1)`: dict lookups, one append and one addition. Space is `O(products + lines)`.

Summing the lines inside `total()` is also correct, but each call costs `O(lines)`. With a total after every scan, `n` scans cost `O(n^2)` in all. The large tests do exactly that.

## Pitfalls

- Overwriting a product when its sku is added again. The return value can still be right while the price is wrong: the bug shows up only on the next scan of that sku.
- Recomputing the total from the lines on every call. Fine for a small basket, too slow for the large tests.
- Adding a line, or its price, for a scan that failed.

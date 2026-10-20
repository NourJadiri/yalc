## Pattern
Hash map catalog, list of lines

## Key idea
Model the till as it is: a catalog mapping skus to products, a basket of lines, one per scan, and a total that adds up the lines when asked.

## Steps
1. Keep a dict from sku to product, and a list of lines for the basket.
2. In `add_product`, return `False` if the sku is already in the dict; otherwise store the new product.
3. In `scan`, look the sku up (missing: `False`) and append a line of `qty` units.
4. In `total`, add up the price of every line.

## Cost
`O(1)` time per add and scan, `O(lines)` per total · `O(products + lines)` space

## Approach

Pattern: a **hash map** for the catalog and a plain **list** for the basket.

Three small classes keep the model plain:

- `Product`: sku, name and unit price. It knows how to price `qty` units: `line_price(qty)`.
- `Line`: one scan. It holds its product and its quantity, and `price()` asks the product.
- `Checkout`: the catalog (`sku -> Product`) and the basket (a list of `Line`s in scan order).

`add_product` checks before it writes. A dict assignment silently replaces the old value, so `products[sku] = Product(...)` on its own would overwrite the first price. Test `sku in self.products` first and return `False` without touching anything.

`scan` looks the sku up. A missing sku returns `False` and adds nothing. Otherwise it appends a new `Line`. Repeated scans of one sku stay separate lines: the statement says each scan is its own line, and the basket is the record of what happened at the till.

`total` adds up the lines' prices every time it's called. Nothing is cached, so nothing can go stale: whatever the basket holds, the total is right. That pays off as the build grows. Weights, promotions and voids only change how lines are priced or which lines are there, and the total follows by itself.

## Complexity

`add_product` and `scan` are `O(1)`. `total` is `O(lines)`. Space is `O(products + lines)`.

With at most 500 lines and 500 calls to `total`, a test prices at most 250,000 lines, a fraction of a second. The large tests are scale checks: anything that does a constant amount of work per line on each call passes. Only a `total` that does quadratic work per call, such as re-pricing the whole basket once for every line, runs out of time on them.

Keeping a running total so that `total()` is `O(1)` is a follow-up, not something these tests ask for.

## Pitfalls

- Overwriting a product when its sku is added again. The return value can still be right while the price is wrong.
- Adding a line for a scan that failed.
- Merging repeated scans into one line. The total doesn't change, but the basket stops being one line per scan.

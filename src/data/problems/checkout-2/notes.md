## Pattern
Integer rounding, halves up

## Key idea
Add half the divisor before dividing: `(price_per_kg * grams + 500) // 1000` is the nearest cent with halves up, with no `round()` and no floats to get it wrong.

## Steps
1. Add a `WeighedProduct` subclass whose `line_price(grams)` returns `(price * grams + 500) // 1000`.
2. In `add_weighed`, refuse a sku the catalog already has, of either kind; otherwise store a `WeighedProduct`.
3. Leave `scan` as it was: the line asks its product for its price, so each weighed line is rounded on its own, once.

## Cost
`O(1)` time per call · `O(products + lines)` space

## Approach

Pattern: **integer rounding**, plus a small dose of polymorphism.

A weighed product differs from a unit product in one thing: how it prices a line. That makes it a subclass of `Product` that overrides `line_price`. Its `price` field now means cents per kilogram, and the `qty` it receives means grams. Nothing else changes. `scan` still builds a `Line`, the line still asks its product for its price, and the running total still adds that price. The catalog dict holds both kinds, so the existing `sku in self.products` check already refuses a sku taken by either kind.

The rounding is the part to get exactly right. The exact price is `price * grams / 1000` cents, a number with up to three decimals. "Nearest cent, halves up" means `floor(x + 0.5)`. Scale everything by 1000 to stay in integers: `floor((price * grams + 500) / 1000)`, which is `(price * grams + 500) // 1000` in Python. All the arithmetic is exact, whatever the size.

Why not the obvious tools:

- `round(x)` uses round-half-to-even. It sends 448.5 to 448 and 149.5 to 150, so it's right only half of the time on exact halves.
- Floats. `price / 1000 * grams` divides first, and `145 / 1000 * 1500` comes out as `217.49999999999997`, so adding 0.5 and flooring gives 217 instead of 218. Converting to currency first (`1.15 * 0.5 * 100`) drifts the same way.

Each line is rounded when it's scanned and stored on the line. Grouping the grams of one product and rounding once gives a different total: three 500 g lines at 1 cent per kg cost 1 + 1 + 1 = 3, while 1500 g at once would cost 2.

## Complexity

Every call is still `O(1)`; pricing a line is one multiplication and one integer division. Space is `O(products + lines)`.

## Pitfalls

- Using `round()`. The tests with halves above an even number (6.5, 32.5, 448.5) catch it; halves above an odd number don't, which is why it survives a quick try.
- Floating-point division, especially dividing the price by 1000 before multiplying by the weight.
- Rounding once per product instead of once per line.
- Letting `add_weighed` replace a unit product with the same sku, or the other way round.

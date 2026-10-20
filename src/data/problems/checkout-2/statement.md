# Checkout: Produce by Weight

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## In short
A checkout for unit-priced products → add `add_weighed`: produce priced per kilogram, scanned by weight in grams, each line rounded to the nearest cent.

## The task

**Step 2 of 4.** The checkout so far has a catalog of products sold by the unit and a basket of scanned lines, and it reports the basket's total. All money is in integer cents. Methods so far:

- `Checkout()`: an empty catalog and an empty basket.
- `add_product(sku, name, price)`: add a product sold by the unit at `price` cents each. Return `true`, or `false` if the catalog already has `sku`.
- `scan(sku, qty=1)`: put `qty` units of a product into the basket as a new line. Return `true`, or `false` if `sku` isn't in the catalog.
- `total()`: return the sum of the line prices, in cents (`0` for an empty basket).

A sku names one product for good: adding a sku the catalog already has returns `false` and changes nothing. Each successful scan adds its own line, and a failed scan adds nothing. Products can be added at any time.

**New in this step**

- `add_weighed(sku, name, price_per_kg)`: add a product sold by weight, at `price_per_kg` cents per kilogram. Return `true`, or `false` if the catalog already has `sku`, whether as a unit product or a weighed one.

When you scan a weighed product, `qty` is its weight in grams. Every scan of a weighed product passes its weight, so the default `qty=1` only ever applies to unit products.

A weighed line costs `price_per_kg * grams / 1000` cents, rounded to the nearest cent. An exact half rounds up: 448.5 becomes 449, and 149.5 becomes 150. A line may round down to 0 cents.

Each line is rounded on its own, and the total adds up the rounded lines. So two 500 g lines can cost one cent more than a single 1000 g line of the same product.

Unit products work as before. Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["Checkout","add_weighed","add_product","scan","scan","scan","total"]
args = [[],["APL","Apples",299],["MILK","Milk",129],["APL",523],["MILK"],["APL",1500],[]]
                                                    -> [null,true,true,true,true,true,734]
```

523 g of apples cost 299 * 523 / 1000 = 156.377, which rounds to 156. 1500 g cost exactly 448.5, which rounds up to 449. With the milk: 156 + 129 + 449 = 734.

**Example 2**

```
ops  = ["Checkout","add_product","add_weighed","add_weighed","scan","scan","total"]
args = [[],["NUTS","Nuts",650],["NUTS","Loose Nuts",1990],["GRAPE","Grapes",299],["GRAPE",500],["GRAPE",500],[]]
                                                    -> [null,true,false,true,true,true,300]
```

`NUTS` is already a unit product, so it can't also be a weighed one. Each 500 g line of grapes costs 149.5, rounded up to 150, so the basket costs 300. A single 1000 g line would cost exactly 299.

**Example 3**

```
ops  = ["Checkout","add_weighed","add_product","scan","scan","total"]
args = [[],["HERB","Basil",2500],["HERB","Basil Pot",199],["HERB",1],["HERB",3],[]]
                                                    -> [null,true,false,true,true,11]
```

`HERB` is taken by the weighed basil, so `add_product` refuses it. 1 g costs 2.5, rounded up to 3, and 3 g cost 7.5, rounded up to 8: the total is 11.

## Constraints

- `sku` is 1 to 8 letters and digits. `name` is 1 to 20 letters and spaces.
- `1 <= price <= 10^5` and `1 <= price_per_kg <= 10^5`
- `1 <= qty <= 10^4`: units for a unit product, grams for a weighed one.
- At most `10^5` calls in total.

## Aim for

Still `O(1)` per call. Price each line once, when it's scanned, and round it there, so the running total from step 1 keeps working. Round with integers only: `(price_per_kg * grams + 500) // 1000` is the nearest cent with halves going up. Python's `round()` sends an exact half to the even neighbour (448.5 becomes 448), and floating-point division can land a hair below the half. A weighed product is a product that prices its lines differently, which makes it a natural subclass.

## Follow-ups

- The scale reports weight in grams with an error of up to 2 g. Should the customer get the benefit of the doubt, and how would you change the rounding rule?
- The rounding rule is set by law and differs between countries. Where in your design does it live, and how would you swap it?
- Next step: promotions. Multibuy deals, percent-off deals and coupons that depend on how much the basket costs.

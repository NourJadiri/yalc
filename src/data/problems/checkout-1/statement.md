# Checkout: Scan and Total

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## In short
A supermarket checkout → `add_product` fills the catalog, `scan` adds a line to the basket, and `total` returns the basket's price in cents.

## The task

**Step 1 of 4.** Over four steps you build the checkout of a small supermarket: a catalog of products, a basket of scanned lines, and later produce sold by weight, promotions and a printed receipt. This step is the core. All money is in integer cents: `129` means 1.29. Implement `class Checkout`:

- `Checkout()`: an empty catalog and an empty basket.
- `add_product(sku, name, price)`: add a product sold by the unit at `price` cents each. Return `true`, or `false` if the catalog already has `sku`.
- `scan(sku, qty=1)`: put `qty` units of a product into the basket. Return `true`, or `false` if `sku` isn't in the catalog.
- `total()`: return the price of the basket, in cents.

The rules:

- A sku names one product for good. Calling `add_product` with a sku the catalog already has returns `false` and changes nothing: the first name and price stay.
- Each successful `scan` adds its own line to the basket, even if that sku was scanned before. A line of `qty` units costs `qty * price`.
- A failed `scan` adds nothing.
- `total()` is the sum of the line prices, `0` for an empty basket. Calling it changes nothing.
- Products can be added at any time, also after scanning has started.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `add_product` and `scan`, a number for `total`.

## Examples

**Example 1**

```
ops  = ["Checkout","add_product","add_product","scan","scan","scan","total"]
args = [[],["MILK","Milk",129],["EGGS","Eggs",349],["MILK"],["EGGS",2],["MILK"],[]]
                                                    -> [null,true,true,true,true,true,956]
```

Milk is scanned twice, as two lines of one unit each. The basket costs 129 + 2 * 349 + 129 = 956 cents.

**Example 2**

```
ops  = ["Checkout","add_product","scan","add_product","scan","total"]
args = [[],["TEA","Green Tea",450],["COFFEE"],["TEA","Black Tea",399],["TEA",3],[]]
                                                    -> [null,true,false,false,true,1350]
```

`COFFEE` isn't in the catalog, so that scan fails and adds nothing. The second `add_product` reuses the sku `TEA`: it's refused, and `TEA` keeps its first price, so three units cost 1350.

**Example 3**

```
ops  = ["Checkout","total","scan","add_product","scan","total"]
args = [[],[],["JAM"],["JAM","Jam",275],["JAM",4],[]]
                                                    -> [null,0,false,true,true,1100]
```

An empty basket costs 0. `JAM` can't be scanned before it's in the catalog. Once it's added, it can.

## Constraints

- `sku` is 1 to 8 letters and digits. `name` is 1 to 20 letters and spaces.
- `1 <= price <= 10^5`
- `1 <= qty <= 10^4`
- At most `10^5` calls in total.

## Aim for

`O(1)` per call. Keep the catalog in a hash map from sku to product, and the basket as a list of lines, one per scan. Next to the lines, keep a running total that each scan adds its line's price to, so `total()` never re-adds the basket. Summing the lines inside `total()` is correct but costs `O(lines)` per call, and the large tests ask for the total after nearly every scan.

## Follow-ups

- Should a line store its price, or look it up from the product when asked? What changes if prices can change during the day?
- Two tills share one catalog. Which state is shared, and which belongs to each till?
- Next step: produce sold by weight, priced per kilogram and scanned in grams.

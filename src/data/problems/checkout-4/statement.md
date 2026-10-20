# Checkout: Voids and the Receipt

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## In short
A checkout with weighed produce and promotions → add `void`, which takes back a sku's latest line, and `receipt`, which prints the basket.

## The task

**Step 4 of 4.** The checkout so far has a catalog of products sold by the unit or by weight, a basket of scanned lines, item promotions and spend discounts. It reports the basket's total in cents. Methods so far:

- `Checkout()`: an empty catalog and an empty basket.
- `add_product(sku, name, price)`: add a product sold by the unit at `price` cents each.
- `add_weighed(sku, name, price_per_kg)`: add a product sold by weight at `price_per_kg` cents per kilogram.
- `scan(sku, qty=1)`: put a new line into the basket: `qty` units of a unit product, or `qty` grams of a weighed one.
- `total()`: return the price of the basket in cents, after all promotions.
- `add_multibuy(sku, n, price)`: "n for price" on a unit product.
- `add_percent_off(sku, percent)`: `percent` off every line of a product.
- `add_spend_discount(threshold, amount)`: `amount` off a basket whose subtotal reaches `threshold`.

The rules so far:

- Every method except `total` (and the new `receipt`) returns `true` when it does what it's asked, and `false`, changing nothing, when it's refused.
- A sku names one product for good: adding a sku the catalog already has, as either kind, is refused, and so is scanning an unknown sku. Each successful scan is its own line, and every scan of a weighed product passes its weight.
- A unit line costs `qty * price`. A weighed line costs `price_per_kg * grams / 1000`, rounded to the nearest cent with exact halves rounding up, each line on its own.
- A sku has at most one item promotion: a multibuy or a percent off. A multibuy counts the sku's units across the whole basket. Every complete group of `n` units costs `price` instead of `n` times the unit price, and the units left over cost the unit price. A percent off saves `line price * percent / 100` on each line of the sku, rounded to the nearest cent with halves up, each line on its own.
- `add_multibuy` and `add_percent_off` are refused for an unknown sku, a sku that already has an item promotion, a multibuy on a weighed product, a multibuy with `n < 2` or with `price >= n * unit price`, or a percent outside `1` to `100`. `add_spend_discount` is refused unless `1 <= amount <= threshold`.
- The subtotal is the sum of the line prices minus what the item promotions save. Among the spend discounts whose `threshold` the subtotal reaches, the one with the largest `amount` applies. `total()` is the subtotal minus that amount, or the subtotal if none applies.
- Promotions can be added before or after the scans. Everything always reflects the basket and the promotions as they stand.

**New in this step**

- `void(sku)`: remove the most recent line of `sku` that is still in the basket, the whole line, whatever its `qty`. Return `true`, or `false` if the basket holds no line of `sku`. From then on, the total, the promotions and the receipt behave as if that line had never been scanned. Scanning the sku again adds a new line at the end.
- `receipt()`: return the receipt as a list of strings, one per printed line, in this order:

1. One line per basket line, in scan order. A unit line prints `{name} {qty} x {unit price} = {line price}`, like `Milk 2 x 1.29 = 2.58`. A weighed line prints `{name} {kg} kg @ {price per kg}/kg = {line price}`, like `Apples 0.523 kg @ 2.99/kg = 1.56`, where `kg` is the weight in grams divided by 1000, written with exactly three decimals.
2. One line per sku whose item promotion saves more than 0, in the order those skus first appear among the basket lines. A multibuy prints `{name} {n} for {price} -{saving}`, like `Milk 2 for 2.00 -0.58`. A percent off prints `{name} {percent}% off -{saving}`, like `Cheese 20% off -1.99`. The saving is the promotion's whole saving on that sku.
3. `Subtotal {amount}`, the subtotal after item promotions.
4. Only if a spend discount applies: `Coupon {threshold}+ -{amount}` for that discount, like `Coupon 20.00+ -5.00`. If several qualifying discounts share the largest amount, print the one with the lowest threshold.
5. `Total {amount}`.

Every amount of money prints as cents divided by 100 with exactly two decimals and no thousands separators: 5 prints as `0.05`, 129 as `1.29`, 0 as `0.00` and 1234567 as `12345.67`. Parts are separated by single spaces, exactly as shown. Calling `receipt()` changes nothing.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `scan`, `void` and the `add_` methods, a number for `total` and a list of strings for `receipt`. Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["Checkout","add_product","add_weighed","add_multibuy","scan","scan","scan","receipt"]
args = [[],["MILK","Milk",129],["APL","Apples",299],["MILK",2,200],["MILK",2],["APL",523],["MILK"],[]]
     -> [null,true,true,true,true,true,true,["Milk 2 x 1.29 = 2.58","Apples 0.523 kg @ 2.99/kg = 1.56","Milk 1 x 1.29 = 1.29","Milk 2 for 2.00 -0.58","Subtotal 4.85","Total 4.85"]]
```

The two milk lines print separately, in scan order. Across the basket there are three milks, so one group of 2 costs 2.00 instead of 2.58, and the multibuy line shows the saving of 0.58. No spend discount applies, so there is no coupon line.

**Example 2**

```
ops  = ["Checkout","add_product","add_product","scan","scan","scan","void","void","receipt"]
args = [[],["TEA","Tea",450],["JAM","Jam",275],["TEA",2],["JAM"],["TEA",5],["TEA"],["RICE"],[]]
     -> [null,true,true,true,true,true,true,false,["Tea 2 x 4.50 = 9.00","Jam 1 x 2.75 = 2.75","Subtotal 11.75","Total 11.75"]]
```

`void("TEA")` takes back the most recent tea line, the one with 5 units, and keeps the first. The basket holds no rice, so the second void returns `false`.

**Example 3**

```
ops  = ["Checkout","add_product","add_weighed","add_percent_off","add_spend_discount","scan","scan","receipt","void","receipt"]
args = [[],["WINE","Wine",1250],["CHEESE","Cheese",2490],["CHEESE",20],[2000,500],["WINE"],["CHEESE",400],[],["WINE"],[]]
     -> [null,true,true,true,true,true,true,["Wine 1 x 12.50 = 12.50","Cheese 0.400 kg @ 24.90/kg = 9.96","Cheese 20% off -1.99","Subtotal 20.47","Coupon 20.00+ -5.00","Total 15.47"],true,["Cheese 0.400 kg @ 24.90/kg = 9.96","Cheese 20% off -1.99","Subtotal 7.97","Total 7.97"]]
```

400 g of cheese cost 9.96, and 20% of that is 1.992, which rounds to 1.99. The subtotal of 20.47 reaches the coupon's threshold of 20.00, so 5.00 comes off. Once the wine is voided, the subtotal drops to 7.97 and the coupon no longer applies.

## Constraints

- `sku` is 1 to 8 letters and digits. `name` is 1 to 20 letters and spaces.
- `add_product`: `1 <= price <= 10^5`. `add_weighed`: `1 <= price_per_kg <= 10^5`.
- `1 <= qty <= 10^4`: units for a unit product, grams for a weighed one.
- `add_multibuy`: `0 <= n <= 100` and `1 <= price <= 10^7`.
- `add_percent_off`: `0 <= percent <= 200`.
- `add_spend_discount`: `0 <= threshold <= 10^9` and `0 <= amount <= 10^9`.
- At most `500` calls to `scan` and at most `500` calls to `total`.
- At most `50` calls to `add_multibuy` and `add_percent_off` together, and at most `20` calls to `add_spend_discount`.
- At most `500` calls to `void` and at most `20` calls to `receipt`.
- At most `5000` calls in total.

## Aim for

Both new methods stay small when the checkout works everything out from its lines. `void` walks the basket backwards from the newest line to the sku's most recent one and deletes it, `O(lines)`. Because totals and savings are worked out from the lines whenever they're asked for, deleting the line is all a void has to do. `receipt` is `O(lines + spend discounts)`: each line in scan order, printed by its own product, then each promotion that saves money, from the same grouping by sku that the subtotal uses (a dict keeps the order in which the skus first appear), then the subtotal, the coupon and the total. Print money with integers, `f"{cents // 100}.{cents % 100:02d}"`, not `str(cents / 100)`, which prints `1.5` for 150.

## Follow-ups

- The till shows the total after every scan, and lines get voided. How would you make `total()` and `void` `O(1)`, and what would a void then have to undo?
- Each product gets a tax category with its own rate, and the receipt lists the tax per category. Which classes change, and where does the rounding happen?
- Loyalty points: one point per whole 1.00 paid, double points on some skus. Which object should know about points?
- A meal deal across skus: a sandwich, a drink and a snack for 5.00. Which classes change, and how do you choose the groups when a basket can form them in several ways?

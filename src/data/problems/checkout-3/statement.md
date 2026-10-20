# Checkout: Promotions

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## In short
A checkout with unit and weighed products → add multibuy deals, percent-off deals and spend-based coupons, all reflected in `total`.

## The task

**Step 3 of 4.** The checkout so far has a catalog of products, some sold by the unit and some by weight, and a basket of scanned lines. It reports the basket's total in cents. Methods so far:

- `Checkout()`: an empty catalog and an empty basket.
- `add_product(sku, name, price)`: add a product sold by the unit at `price` cents each. Return `true`, or `false` if the sku is taken.
- `add_weighed(sku, name, price_per_kg)`: add a product sold by weight at `price_per_kg` cents per kilogram. Return `true`, or `false` if the sku is taken.
- `scan(sku, qty=1)`: put a new line into the basket: `qty` units of a unit product, or `qty` grams of a weighed one. Return `true`, or `false` (adding nothing) for an unknown sku.
- `total()`: return the price of the basket, in cents.

A sku names one product for good: adding a taken sku, as either kind, returns `false` and changes nothing. Each successful scan is its own line, and every scan of a weighed product passes its weight. A unit line costs `qty * price`. A weighed line costs `price_per_kg * grams / 1000`, rounded to the nearest cent with exact halves rounding up, each line on its own.

**New in this step**

Three kinds of promotion. Each new method returns `true` if the promotion was added. When it returns `false`, nothing changes.

- `add_multibuy(sku, n, price)`: "n for price" on a unit product. Count the units of `sku` across the whole basket, over all its lines. Every complete group of `n` units costs `price` instead of `n` times the unit price. The units left over cost the unit price.
- `add_percent_off(sku, percent)`: `percent` off every line of `sku`, a unit or a weighed product. Each line saves `line price * percent / 100`, rounded to the nearest cent with halves up, each line on its own. A weighed line's price is its already rounded price.
- `add_spend_discount(threshold, amount)`: a coupon for the whole basket. It takes `amount` off when the subtotal is at least `threshold`.

The multibuy and the percent off are item promotions, and a sku can have at most one of them. `add_multibuy` and `add_percent_off` return `false` when:

- the sku isn't in the catalog, or already has an item promotion;
- a multibuy is for a weighed product, has `n < 2`, or has `price >= n * unit price` (it would save nothing);
- a percent is outside `1` to `100`.

`add_spend_discount` returns `false` unless `1 <= amount <= threshold`, so a total never goes below 0. Several spend discounts can be added.

How `total()` is worked out:

1. The subtotal is the sum of the line prices minus everything the item promotions save.
2. Among the spend discounts whose `threshold` the subtotal reaches, only the one with the largest `amount` applies.
3. `total()` is the subtotal minus that amount, or the subtotal itself if no spend discount applies.

Promotions can be added before or after the items are scanned. `total()` always reflects the basket and the promotions as they stand at that moment.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `scan` and the `add_` methods, a number for `total`. Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["Checkout","add_product","add_multibuy","scan","scan","total","scan","total"]
args = [[],["MILK","Milk",129],["MILK",2,200],["MILK"],["MILK"],[],["MILK",3],[]]
                                                    -> [null,true,true,true,true,200,true,529]
```

Two scans of one milk each make a complete group of 2 across the basket, so they cost 200 instead of 258. After three more there are five: two groups cost 400, and the fifth milk costs 129.

**Example 2**

```
ops  = ["Checkout","add_weighed","add_product","scan","scan","scan","total","add_percent_off","total"]
args = [[],["CHEESE","Cheese",2500],["BREAD","Bread",250],["CHEESE",50],["BREAD"],["CHEESE",54],[],["CHEESE",10],[]]
                                                    -> [null,true,true,true,true,true,510,true,483]
```

The cheese lines cost 125 and 135. The 10% off arrives after the scans and still counts. Each line's saving is rounded on its own: 12.5 rounds up to 13 and 13.5 up to 14, so the total drops by 27 to 483.

**Example 3**

```
ops  = ["Checkout","add_product","add_spend_discount","add_spend_discount","add_spend_discount","scan","total","scan","total"]
args = [[],["WINE","Wine",999],[2000,300],[1500,500],[1000,1001],["WINE",2],[],["WINE"],[]]
                                                    -> [null,true,true,true,false,true,1498,true,2497]
```

The third coupon would take off more than its threshold, so it's refused. At a subtotal of 1998, only the coupon with threshold 1500 qualifies. At 2997 both qualify, and only the larger amount, 500, comes off, even though the other coupon has the higher threshold.

## Constraints

- `sku` is 1 to 8 letters and digits. `name` is 1 to 20 letters and spaces.
- `add_product`: `1 <= price <= 10^5`. `add_weighed`: `1 <= price_per_kg <= 10^5`.
- `1 <= qty <= 10^4`: units for a unit product, grams for a weighed one.
- `add_multibuy`: `0 <= n <= 100` and `1 <= price <= 10^7`.
- `add_percent_off`: `0 <= percent <= 200`.
- `add_spend_discount`: `0 <= threshold <= 10^9` and `0 <= amount <= 10^9`.
- At most `500` calls to `scan` and at most `500` calls to `total`.
- At most `50` calls to `add_multibuy` and `add_percent_off` together, and at most `20` calls to `add_spend_discount`.
- At most `5000` calls in total.

## Aim for

Promotions as small strategy classes. A `Multibuy` and a `PercentOff` each know their product and work out their saving from that sku's lines: the multibuy from the units on them, the percent off line by line. `total()` groups the basket's lines by sku, takes every line's price, subtracts what each promotion saves on its own sku's lines, then subtracts the largest spend discount the subtotal qualifies for. Everything is worked out when it's asked for, so a promotion added after the scans just works. That's `O(lines + spend discounts)` per `total`. Applying a multibuy line by line is the classic bug: two single scans of milk never form "2 for 2.00".

## Follow-ups

- The till shows the total after every scan, and promotions can arrive at any time. How would you make `total()` `O(1)`? Notice that each call changes the cost of one sku only.
- Let a sku have several promotions and charge the customer the cheapest result. What changes in how a sku's cost is worked out?
- "Buy 2, get 1 free" is a multibuy in disguise. Which other common deals fit your promotion classes, and which don't?
- Next step: voiding a scanned line, and printing the receipt.

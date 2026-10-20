# The slip: void takes back the sku's FIRST line instead of its most recent
# one. Totals still look plausible, since a line of that sku does disappear,
# but when the lines differ in size the wrong one goes, and the receipt shows it.

# Money is cents: print it with integer arithmetic, never through a float
def money(cents):
    return f"{cents // 100}.{cents % 100:02d}"


class Product:
    def __init__(self, sku, name, price):
        self.sku = sku
        self.name = name
        self.price = price                      # cents per unit
        self.promo = None                       # its item promotion, if any

    def line_price(self, qty):
        return self.price * qty

    # Each product prints its own lines, and each promotion its own saving
    def describe(self, line):
        return f"{self.name} {line.qty} x {money(self.price)} = {money(line.price)}"


class WeighedProduct(Product):
    # price is in cents per kilogram, and a line's qty is its weight in grams

    def line_price(self, grams):
        # price * grams / 1000 to the nearest cent, halves up, in integers only
        return (self.price * grams + 500) // 1000

    def describe(self, line):
        kg = f"{line.qty // 1000}.{line.qty % 1000:03d}"
        return f"{self.name} {kg} kg @ {money(self.price)}/kg = {money(line.price)}"


class Line:
    def __init__(self, product, qty):
        self.product = product
        self.qty = qty
        self.price = product.line_price(qty)    # fixed when the line is scanned
        self.voided = False


# Each promotion works out its sku's saving in O(1) from the sku's tally
class Multibuy:
    # "n for price": every complete group of n units across the basket costs price

    def __init__(self, n, price):
        self.n = n
        self.price = price

    def line_saving(self, line):
        return 0                                # it counts units across lines, not single lines

    def saving(self, tally):
        groups = tally.units // self.n
        return groups * (self.n * tally.product.price - self.price)

    def describe(self, product, saving):
        return f"{product.name} {self.n} for {money(self.price)} -{money(saving)}"


class PercentOff:
    def __init__(self, percent):
        self.percent = percent

    def line_saving(self, line):
        return (line.price * self.percent + 50) // 100     # each line rounded, halves up

    def saving(self, tally):
        return tally.line_savings

    def describe(self, product, saving):
        return f"{product.name} {self.percent}% off -{money(saving)}"


# A tally per sku: its lines in the basket and the sums its promotion reads
class Tally:
    def __init__(self, product):
        self.product = product
        self.lines = []                         # oldest first
        self.units = 0                          # qty summed over the lines
        self.gross = 0                          # line prices summed
        self.line_savings = 0                   # the promotion's line_saving summed over the lines

    def add(self, line):
        self.lines.append(line)
        self.units += line.qty
        self.gross += line.price
        if self.product.promo:
            self.line_savings += self.product.promo.line_saving(line)

    # The mirror of add: take a line back out of every sum
    def remove_last(self):
        line = self.lines.pop(0)                # the bug: the oldest line, not the newest
        self.units -= line.qty
        self.gross -= line.price
        if self.product.promo:
            self.line_savings -= self.product.promo.line_saving(line)
        return line

    def reprice(self):
        # a promotion was just attached: price the lines that were already here
        self.line_savings = sum(map(self.product.promo.line_saving, self.lines))

    def cost(self):
        promo = self.product.promo
        return self.gross - (promo.saving(self) if promo else 0)


class Checkout:

    def __init__(self):
        # The catalog, the basket's lines, and a running subtotal
        self.products = {}                      # sku -> Product (or WeighedProduct)
        self.lines = []                         # every scan in scan order; voided ones are flagged
        self.tallies = {}                       # sku -> Tally of its lines in the basket
        self.running = 0                        # the tallies' costs summed: the subtotal after item promotions
        self.coupons = []                       # spend discounts, as (threshold, amount)

    def add_product(self, sku: str, name: str, price: int) -> bool:
        # A sku that's taken is refused, never overwritten
        if sku in self.products:
            return False
        self.products[sku] = Product(sku, name, price)
        return True

    def add_weighed(self, sku: str, name: str, price_per_kg: int) -> bool:
        # Same rule for weighed products: one sku, one product, whatever its kind
        if sku in self.products:
            return False
        self.products[sku] = WeighedProduct(sku, name, price_per_kg)
        return True

    def scan(self, sku: str, qty: int = 1) -> bool:
        # Each scan appends its own line
        product = self.products.get(sku)
        if product is None:
            return False                        # unknown sku: the basket is untouched
        # The product prices the line, so a weighed line is rounded on its own, right here
        line = Line(product, qty)
        self.lines.append(line)
        # Only this sku's cost can change: move the subtotal by the difference
        tally = self.tallies.get(sku)
        if tally is None:
            tally = self.tallies[sku] = Tally(product)
        before = tally.cost()
        tally.add(line)
        self.running += tally.cost() - before
        return True

    def total(self) -> int:
        # The spend discount that applies, if any, comes off the subtotal
        coupon = self._coupon()
        return self.running - (coupon[1] if coupon else 0)

    def add_multibuy(self, sku: str, n: int, price: int) -> bool:
        # Refuse before touching anything; a refused promotion changes nothing
        product = self.products.get(sku)
        if (product is None or product.promo is not None or isinstance(product, WeighedProduct)
                or n < 2 or price >= n * product.price):
            return False
        self._attach(product, Multibuy(n, price))
        return True

    def add_percent_off(self, sku: str, percent: int) -> bool:
        product = self.products.get(sku)
        if product is None or product.promo is not None or not 1 <= percent <= 100:
            return False
        self._attach(product, PercentOff(percent))
        return True

    def add_spend_discount(self, threshold: int, amount: int) -> bool:
        if not 1 <= amount <= threshold:
            return False                        # it could push a total below zero
        self.coupons.append((threshold, amount))
        return True

    def void(self, sku: str) -> bool:
        # Take a line of the sku out of its tally, then fix the subtotal
        tally = self.tallies.get(sku)
        if tally is None or not tally.lines:
            return False
        before = tally.cost()
        tally.remove_last().voided = True       # the receipt skips it from now on
        self.running += tally.cost() - before
        return True

    def receipt(self) -> List[str]:
        # Lines in scan order, then promotions in the order their skus first appear
        out, seen = [], {}                      # seen: sku -> tally, in first-appearance order
        for line in self.lines:
            if not line.voided:
                out.append(line.product.describe(line))
                seen.setdefault(line.product.sku, self.tallies[line.product.sku])
        for tally in seen.values():
            promo = tally.product.promo
            saving = promo.saving(tally) if promo else 0
            if saving > 0:
                out.append(promo.describe(tally.product, saving))
        out.append("Subtotal " + money(self.running))
        coupon = self._coupon()
        if coupon:
            out.append(f"Coupon {money(coupon[0])}+ -{money(coupon[1])}")
        out.append("Total " + money(self.total()))
        return out

    def _attach(self, product, promo):
        # A promotion can arrive after its sku was scanned: re-price that tally
        tally = self.tallies.get(product.sku)
        before = tally.cost() if tally else 0
        product.promo = promo
        if tally:
            tally.reprice()
            self.running += tally.cost() - before

    def _coupon(self):
        # The qualifying spend discount with the largest amount; on a tie, the lowest threshold
        qualifying = [(t, a) for t, a in self.coupons if self.running >= t]
        return max(qualifying, key=lambda c: (c[1], -c[0]), default=None)

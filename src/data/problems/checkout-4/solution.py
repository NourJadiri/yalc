# 1. Money is cents: print it with integer arithmetic, never through a float
def money(cents):
    return f"{cents // 100}.{cents % 100:02d}"


class Product:
    def __init__(self, sku, name, price):
        self.sku = sku
        self.name = name
        self.price = price                      # cents per unit

    def line_price(self, qty):
        return self.price * qty

    # 2. Each product prints its own lines, and each promotion its own saving
    def describe(self, line):
        return f"{self.name} {line.qty} x {money(self.price)} = {money(line.price())}"


class WeighedProduct(Product):
    # price is in cents per kilogram, and a line's qty is its weight in grams

    def line_price(self, grams):
        # price * grams / 1000 to the nearest cent, halves up, in integers only
        return (self.price * grams + 500) // 1000

    def describe(self, line):
        kg = f"{line.qty // 1000}.{line.qty % 1000:03d}"
        return f"{self.name} {kg} kg @ {money(self.price)}/kg = {money(line.price())}"


class Line:
    def __init__(self, product, qty):
        self.product = product
        self.qty = qty

    def price(self):
        # The product prices its own line, so each weighed line is rounded on its own
        return self.product.line_price(self.qty)


# A promotion knows its product and works out its saving from that sku's lines
class Multibuy:
    # "n for price": every complete group of n units across the basket costs price

    def __init__(self, product, n, price):
        self.product = product
        self.n = n
        self.price = price

    def saving(self, lines):
        groups = sum(line.qty for line in lines) // self.n
        return groups * (self.n * self.product.price - self.price)

    def describe(self, saving):
        return f"{self.product.name} {self.n} for {money(self.price)} -{money(saving)}"


class PercentOff:
    def __init__(self, product, percent):
        self.product = product
        self.percent = percent

    def saving(self, lines):
        # each line's saving is rounded on its own, halves up
        return sum((line.price() * self.percent + 50) // 100 for line in lines)

    def describe(self, saving):
        return f"{self.product.name} {self.percent}% off -{money(saving)}"


class Checkout:

    def __init__(self):
        # The catalog, keyed by sku, and the basket: one line per scan, in scan order
        self.products = {}                      # sku -> Product (or WeighedProduct)
        self.lines = []
        self.promotions = {}                    # sku -> its item promotion
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
        # Each successful scan appends its own line
        product = self.products.get(sku)
        if product is None:
            return False                        # unknown sku: the basket is untouched
        self.lines.append(Line(product, qty))
        return True

    def _groups(self):
        # The basket's lines by sku; a dict keeps the order in which the skus first appear
        groups = {}
        for line in self.lines:
            groups.setdefault(line.product.sku, []).append(line)
        return groups

    def _subtotal(self):
        # Every line's price, minus what each promotion saves on its own sku's lines
        subtotal = sum(line.price() for line in self.lines)
        for sku, lines in self._groups().items():
            if sku in self.promotions:
                subtotal -= self.promotions[sku].saving(lines)
        return subtotal

    def _coupon(self, subtotal):
        # 3. The spend discount that applies: the largest amount; on a tie, the lowest threshold
        qualifying = [(t, a) for t, a in self.coupons if subtotal >= t]
        return max(qualifying, key=lambda c: (c[1], -c[0]), default=None)

    def total(self) -> int:
        # Take off the spend discount that applies, if any
        subtotal = self._subtotal()
        coupon = self._coupon(subtotal)
        return subtotal - (coupon[1] if coupon else 0)

    def add_multibuy(self, sku: str, n: int, price: int) -> bool:
        # Refuse anything invalid before changing anything
        product = self.products.get(sku)
        if (product is None or sku in self.promotions or isinstance(product, WeighedProduct)
                or n < 2 or price >= n * product.price):
            return False
        self.promotions[sku] = Multibuy(product, n, price)
        return True

    def add_percent_off(self, sku: str, percent: int) -> bool:
        product = self.products.get(sku)
        if product is None or sku in self.promotions or not 1 <= percent <= 100:
            return False
        self.promotions[sku] = PercentOff(product, percent)
        return True

    def add_spend_discount(self, threshold: int, amount: int) -> bool:
        if not 1 <= amount <= threshold:
            return False                        # it could push a total below zero
        self.coupons.append((threshold, amount))
        return True

    def void(self, sku: str) -> bool:
        # 4. Walk back from the newest line to the sku's most recent one, and take it out
        for i in range(len(self.lines) - 1, -1, -1):
            if self.lines[i].product.sku == sku:
                del self.lines[i]               # totals and the receipt are worked out afresh
                return True
        return False

    def receipt(self) -> List[str]:
        # 5. Lines in scan order, then promotions in the order their skus first appear
        out = [line.product.describe(line) for line in self.lines]
        for sku, lines in self._groups().items():
            promo = self.promotions.get(sku)
            saving = promo.saving(lines) if promo else 0
            if saving > 0:
                out.append(promo.describe(saving))
        subtotal = self._subtotal()
        coupon = self._coupon(subtotal)
        out.append("Subtotal " + money(subtotal))
        if coupon:
            out.append(f"Coupon {money(coupon[0])}+ -{money(coupon[1])}")
        out.append("Total " + money(self.total()))
        return out

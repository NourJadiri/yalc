class Product:
    def __init__(self, sku, name, price):
        self.sku = sku
        self.name = name
        self.price = price                      # cents per unit
        self.promo = None                       # its item promotion, if any

    def line_price(self, qty):
        return self.price * qty


class WeighedProduct(Product):
    # price is in cents per kilogram, and a line's qty is its weight in grams

    def line_price(self, grams):
        # price * grams / 1000 to the nearest cent, halves up, in integers only
        return (self.price * grams + 500) // 1000


class Line:
    def __init__(self, product, qty):
        self.product = product
        self.qty = qty
        self.price = product.line_price(qty)    # fixed when the line is scanned


# 1. Each promotion works out its sku's saving in O(1) from the sku's tally
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


class PercentOff:
    def __init__(self, percent):
        self.percent = percent

    def line_saving(self, line):
        return (line.price * self.percent + 50) // 100     # each line rounded, halves up

    def saving(self, tally):
        return tally.line_savings


# 2. A tally per sku: its lines in the basket and the sums its promotion reads
class Tally:
    def __init__(self, product):
        self.product = product
        self.lines = []
        self.units = 0                          # qty summed over the lines
        self.gross = 0                          # line prices summed
        self.line_savings = 0                   # the promotion's line_saving summed over the lines

    def add(self, line):
        self.lines.append(line)
        self.units += line.qty
        self.gross += line.price
        if self.product.promo:
            self.line_savings += self.product.promo.line_saving(line)

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
        self.lines = []                         # the basket: one Line per scan, in scan order
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
        # 3. Only this sku's cost can change: move the subtotal by the difference
        tally = self.tallies.setdefault(sku, Tally(product))
        before = tally.cost()
        tally.add(line)
        self.running += tally.cost() - before
        return True

    def total(self) -> int:
        # 4. The largest spend discount whose threshold the subtotal reaches comes off
        best = max((amount for threshold, amount in self.coupons if self.running >= threshold), default=0)
        return self.running - best

    def add_multibuy(self, sku: str, n: int, price: int) -> bool:
        # 5. Refuse before touching anything; a refused promotion changes nothing
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

    def _attach(self, product, promo):
        # A promotion can arrive after its sku was scanned: re-price that tally
        tally = self.tallies.get(product.sku)
        before = tally.cost() if tally else 0
        product.promo = promo
        if tally:
            tally.reprice()
            self.running += tally.cost() - before

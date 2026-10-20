class Product:
    def __init__(self, sku, name, price):
        self.sku = sku
        self.name = name
        self.price = price                      # cents per unit

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

    def price(self):
        # The product prices its own line, so each weighed line is rounded on its own
        return self.product.line_price(self.qty)


# 1. A promotion knows its product and works out its saving from that sku's lines
class Multibuy:
    # "n for price": every complete group of n units across the basket costs price

    def __init__(self, product, n, price):
        self.product = product
        self.n = n
        self.price = price

    def saving(self, lines):
        groups = sum(line.qty for line in lines) // self.n
        return groups * (self.n * self.product.price - self.price)


class PercentOff:
    def __init__(self, product, percent):
        self.product = product
        self.percent = percent

    def saving(self, lines):
        # each line's saving is rounded on its own, halves up
        return sum((line.price() * self.percent + 50) // 100 for line in lines)


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
        # 2. The basket's lines by sku; a dict keeps the order in which the skus first appear
        groups = {}
        for line in self.lines:
            groups.setdefault(line.product.sku, []).append(line)
        return groups

    def _subtotal(self):
        # 3. Every line's price, minus what each promotion saves on its own sku's lines
        subtotal = sum(line.price() for line in self.lines)
        for sku, lines in self._groups().items():
            if sku in self.promotions:
                subtotal -= self.promotions[sku].saving(lines)
        return subtotal

    def total(self) -> int:
        # 4. Take off the largest spend discount whose threshold the subtotal reaches
        subtotal = self._subtotal()
        best = max((amount for threshold, amount in self.coupons if subtotal >= threshold), default=0)
        return subtotal - best

    def add_multibuy(self, sku: str, n: int, price: int) -> bool:
        # 5. Refuse anything invalid before changing anything
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

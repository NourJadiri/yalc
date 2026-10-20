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
        # 1. price * grams / 1000 to the nearest cent, halves up, in integers only
        return (self.price * grams + 500) // 1000


class Line:
    def __init__(self, product, qty):
        self.product = product
        self.qty = qty

    def price(self):
        # 2. The product prices its own line, so each weighed line is rounded on its own
        return self.product.line_price(self.qty)


class Checkout:

    def __init__(self):
        # The catalog, keyed by sku, and the basket: one line per scan, in scan order
        self.products = {}                      # sku -> Product (or WeighedProduct)
        self.lines = []

    def add_product(self, sku: str, name: str, price: int) -> bool:
        # A sku that's taken is refused, never overwritten
        if sku in self.products:
            return False
        self.products[sku] = Product(sku, name, price)
        return True

    def add_weighed(self, sku: str, name: str, price_per_kg: int) -> bool:
        # 3. Same rule for weighed products: one sku, one product, whatever its kind
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

    def total(self) -> int:
        # Work the total out from the lines whenever it's asked for
        return sum(line.price() for line in self.lines)

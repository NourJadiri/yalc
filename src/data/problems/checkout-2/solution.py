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
        self.price = product.line_price(qty)    # fixed when the line is scanned


class Checkout:

    def __init__(self):
        # The catalog, the basket's lines, and a running total of their prices
        self.products = {}                      # sku -> Product (or WeighedProduct)
        self.lines = []                         # the basket: one Line per scan, in scan order
        self.running = 0                        # sum of the lines' prices, kept up to date

    def add_product(self, sku: str, name: str, price: int) -> bool:
        # A sku that's taken is refused, never overwritten
        if sku in self.products:
            return False
        self.products[sku] = Product(sku, name, price)
        return True

    def add_weighed(self, sku: str, name: str, price_per_kg: int) -> bool:
        # 2. Same rule for weighed products: one sku, one product, whatever its kind
        if sku in self.products:
            return False
        self.products[sku] = WeighedProduct(sku, name, price_per_kg)
        return True

    def scan(self, sku: str, qty: int = 1) -> bool:
        # Each scan appends its own line and adds its price to the running total
        product = self.products.get(sku)
        if product is None:
            return False                        # unknown sku: the basket is untouched
        # 3. The product prices the line, so a weighed line is rounded on its own, right here
        line = Line(product, qty)
        self.lines.append(line)
        self.running += line.price
        return True

    def total(self) -> int:
        # total reads the running sum: the work already happened in scan
        return self.running

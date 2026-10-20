class Product:
    def __init__(self, sku, name, price):
        self.sku = sku
        self.name = name
        self.price = price                      # cents per unit

    def line_price(self, qty):
        return self.price * qty


class Line:
    def __init__(self, product, qty):
        self.product = product
        self.qty = qty
        self.price = product.line_price(qty)    # fixed when the line is scanned


class Checkout:

    def __init__(self):
        # 1. The catalog, the basket's lines, and a running total of their prices
        self.products = {}                      # sku -> Product
        self.lines = []                         # the basket: one Line per scan, in scan order
        self.running = 0                        # sum of the lines' prices, kept up to date

    def add_product(self, sku: str, name: str, price: int) -> bool:
        # 2. A sku that's taken is refused, never overwritten
        if sku in self.products:
            return False
        self.products[sku] = Product(sku, name, price)
        return True

    def scan(self, sku: str, qty: int = 1) -> bool:
        # 3. Each scan appends its own line and adds its price to the running total
        product = self.products.get(sku)
        if product is None:
            return False                        # unknown sku: the basket is untouched
        line = Line(product, qty)
        self.lines.append(line)
        self.running += line.price
        return True

    def total(self) -> int:
        # 4. total reads the running sum: the work already happened in scan
        return self.running

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

    def price(self):
        return self.product.line_price(self.qty)


class Checkout:

    def __init__(self):
        # 1. The catalog, keyed by sku, and the basket: one line per scan, in scan order
        self.products = {}                      # sku -> Product
        self.lines = []

    def add_product(self, sku: str, name: str, price: int) -> bool:
        # 2. A sku that's taken is refused, never overwritten
        if sku in self.products:
            return False
        self.products[sku] = Product(sku, name, price)
        return True

    def scan(self, sku: str, qty: int = 1) -> bool:
        # 3. Each successful scan appends its own line
        product = self.products.get(sku)
        if product is None:
            return False                        # unknown sku: the basket is untouched
        self.lines.append(Line(product, qty))
        return True

    def total(self) -> int:
        # 4. Work the total out from the lines whenever it's asked for
        return sum(line.price() for line in self.lines)

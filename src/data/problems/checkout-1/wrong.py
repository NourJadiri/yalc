# The classic slip: add_product reports a taken sku correctly, but stores the
# new product anyway. The dict assignment replaces the first price, and since
# total() looks prices up when it's asked, every line of that sku is charged
# the second one.

class Product:
    def __init__(self, sku, name, price):
        self.sku = sku
        self.name = name
        self.price = price


class Checkout:
    def __init__(self):
        self.products = {}
        self.lines = []

    def add_product(self, sku, name, price):
        fresh = sku not in self.products
        self.products[sku] = Product(sku, name, price)     # overwrites a taken sku
        return fresh

    def scan(self, sku, qty=1):
        if sku not in self.products:
            return False
        self.lines.append((sku, qty))
        return True

    def total(self):
        return sum(self.products[sku].price * qty for sku, qty in self.lines)

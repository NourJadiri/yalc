# The classic slip: add_product reports a taken sku correctly, but stores the
# new product anyway. The dict assignment replaces the first price, so every
# later scan of that sku is charged the second one.

class Checkout:
    def __init__(self):
        self.products = {}
        self.lines = []
        self.running = 0

    def add_product(self, sku, name, price):
        fresh = sku not in self.products
        self.products[sku] = (name, price)      # overwrites a taken sku
        return fresh

    def scan(self, sku, qty=1):
        if sku not in self.products:
            return False
        price = self.products[sku][1] * qty
        self.lines.append((sku, qty, price))
        self.running += price
        return True

    def total(self):
        return self.running

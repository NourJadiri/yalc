# Remembers every scan exactly as it happened and re-prices the whole basket
# from the catalog on every total() call.

class Checkout:
    def __init__(self):
        self.catalog = {}
        self.scans = []

    def add_product(self, sku, name, price):
        if sku in self.catalog:
            return False
        self.catalog[sku] = price
        return True

    def scan(self, sku, qty=1):
        if sku not in self.catalog:
            return False
        self.scans.append((sku, qty))
        return True

    def total(self):
        cents = 0
        for sku, qty in self.scans:
            cents += self.catalog[sku] * qty
        return cents

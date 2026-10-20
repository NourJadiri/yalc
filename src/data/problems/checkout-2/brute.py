# Remembers every scan exactly as it happened and re-prices the whole basket
# on every total() call. Weighed lines are priced with exact fractions and an
# explicit "halves go up" rule, independently of any integer trick.
from fractions import Fraction
import math


class Checkout:
    def __init__(self):
        self.catalog = {}                       # sku -> (weighed?, price)
        self.scans = []

    def add_product(self, sku, name, price):
        if sku in self.catalog:
            return False
        self.catalog[sku] = (False, price)
        return True

    def add_weighed(self, sku, name, price_per_kg):
        if sku in self.catalog:
            return False
        self.catalog[sku] = (True, price_per_kg)
        return True

    def scan(self, sku, qty=1):
        if sku not in self.catalog:
            return False
        self.scans.append((sku, qty))
        return True

    def total(self):
        cents = 0
        for sku, qty in self.scans:
            weighed, price = self.catalog[sku]
            if weighed:
                exact = Fraction(price * qty, 1000)
                cents += math.floor(exact + Fraction(1, 2))
            else:
                cents += price * qty
        return cents

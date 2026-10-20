# Remembers every call's effect as plainly as possible and re-prices the whole
# basket from scratch on every total(): group the scans by sku, apply that
# sku's promotion, then pick the best spend discount. Rounding uses exact
# fractions with an explicit "halves go up" rule.
from fractions import Fraction
import math


def half_up(x):
    return math.floor(x + Fraction(1, 2))


class Checkout:
    def __init__(self):
        self.catalog = {}                       # sku -> (weighed?, price)
        self.promos = {}                        # sku -> ("multibuy", n, price) or ("percent", p)
        self.coupons = []
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

    def add_multibuy(self, sku, n, price):
        if sku not in self.catalog or sku in self.promos:
            return False
        weighed, unit = self.catalog[sku]
        if weighed or n < 2 or price >= n * unit:
            return False
        self.promos[sku] = ("multibuy", n, price)
        return True

    def add_percent_off(self, sku, percent):
        if sku not in self.catalog or sku in self.promos:
            return False
        if percent < 1 or percent > 100:
            return False
        self.promos[sku] = ("percent", percent)
        return True

    def add_spend_discount(self, threshold, amount):
        if amount < 1 or amount > threshold:
            return False
        self.coupons.append((threshold, amount))
        return True

    def line_price(self, sku, qty):
        weighed, price = self.catalog[sku]
        if weighed:
            return half_up(Fraction(price * qty, 1000))
        return price * qty

    def total(self):
        by_sku = {}
        for sku, qty in self.scans:
            by_sku.setdefault(sku, []).append(qty)
        subtotal = 0
        for sku, qtys in by_sku.items():
            promo = self.promos.get(sku)
            if promo is None:
                subtotal += sum(self.line_price(sku, q) for q in qtys)
            elif promo[0] == "percent":
                for q in qtys:
                    lp = self.line_price(sku, q)
                    subtotal += lp - half_up(Fraction(lp * promo[1], 100))
            else:
                _, n, deal = promo
                left = sum(qtys)
                while left >= n:                # take complete groups off one at a time
                    subtotal += deal
                    left -= n
                subtotal += left * self.catalog[sku][1]
        best = 0
        for threshold, amount in self.coupons:
            if subtotal >= threshold and amount > best:
                best = amount
        return subtotal - best

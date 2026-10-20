# Remembers every call's effect as plainly as possible and rebuilds everything
# from scratch when asked: the basket is a plain list of (sku, qty) scans, a
# void deletes the last matching entry, and total() and receipt() re-price
# the whole basket. Rounding uses exact fractions with an explicit "halves go
# up" rule, and printing goes through Decimal rather than integer tricks.
from decimal import Decimal
from fractions import Fraction
import math


def half_up(x):
    return math.floor(x + Fraction(1, 2))


def cash(cents):
    return format(Decimal(cents) / Decimal(100), ".2f")


class Checkout:
    def __init__(self):
        self.catalog = {}                       # sku -> (name, weighed?, price)
        self.promos = {}                        # sku -> ("multibuy", n, price) or ("percent", p)
        self.coupons = []
        self.scans = []

    def add_product(self, sku, name, price):
        if sku in self.catalog:
            return False
        self.catalog[sku] = (name, False, price)
        return True

    def add_weighed(self, sku, name, price_per_kg):
        if sku in self.catalog:
            return False
        self.catalog[sku] = (name, True, price_per_kg)
        return True

    def scan(self, sku, qty=1):
        if sku not in self.catalog:
            return False
        self.scans.append((sku, qty))
        return True

    def void(self, sku):
        for i in range(len(self.scans) - 1, -1, -1):
            if self.scans[i][0] == sku:
                del self.scans[i]
                return True
        return False

    def add_multibuy(self, sku, n, price):
        if sku not in self.catalog or sku in self.promos:
            return False
        _, weighed, unit = self.catalog[sku]
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
        _, weighed, price = self.catalog[sku]
        if weighed:
            return half_up(Fraction(price * qty, 1000))
        return price * qty

    def saving(self, sku):
        promo = self.promos.get(sku)
        qtys = [q for s, q in self.scans if s == sku]
        if promo is None:
            return 0
        if promo[0] == "percent":
            return sum(half_up(Fraction(self.line_price(sku, q) * promo[1], 100)) for q in qtys)
        _, n, deal = promo
        unit = self.catalog[sku][2]
        left, saved = sum(qtys), 0
        while left >= n:                        # take complete groups off one at a time
            saved += n * unit - deal
            left -= n
        return saved

    def subtotal(self):
        gross = sum(self.line_price(s, q) for s, q in self.scans)
        return gross - sum(self.saving(s) for s in set(s for s, _ in self.scans))

    def coupon(self):
        sub, best = self.subtotal(), None
        for threshold, amount in self.coupons:
            if sub < threshold:
                continue
            if best is None or amount > best[1] or (amount == best[1] and threshold < best[0]):
                best = (threshold, amount)
        return best

    def total(self):
        c = self.coupon()
        return self.subtotal() - (c[1] if c else 0)

    def receipt(self):
        out, order = [], []
        for sku, qty in self.scans:
            name, weighed, price = self.catalog[sku]
            lp = cash(self.line_price(sku, qty))
            if weighed:
                kg = format(Decimal(qty) / Decimal(1000), ".3f")
                out.append(name + " " + kg + " kg @ " + cash(price) + "/kg = " + lp)
            else:
                out.append(name + " " + str(qty) + " x " + cash(price) + " = " + lp)
            if sku not in order:
                order.append(sku)
        for sku in order:
            s = self.saving(sku)
            if s > 0:
                promo, name = self.promos[sku], self.catalog[sku][0]
                if promo[0] == "multibuy":
                    out.append(name + " " + str(promo[1]) + " for " + cash(promo[2]) + " -" + cash(s))
                else:
                    out.append(name + " " + str(promo[1]) + "% off -" + cash(s))
        out.append("Subtotal " + cash(self.subtotal()))
        c = self.coupon()
        if c:
            out.append("Coupon " + cash(c[0]) + "+ -" + cash(c[1]))
        out.append("Total " + cash(self.total()))
        return out

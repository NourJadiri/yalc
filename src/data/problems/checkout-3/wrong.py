# The tempting shortcut: apply "n for price" to each scan line on its own.
# A line of 4 milks gets its groups, but scanning milk twice, one at a time,
# never forms a group of 2, so the deal silently disappears.

class Checkout:
    def __init__(self):
        self.products = {}                      # sku -> (weighed?, price)
        self.lines = []                         # (sku, qty) per scan
        self.promos = {}                        # sku -> ("multibuy", n, price) or ("percent", p)
        self.coupons = []

    def add_product(self, sku, name, price):
        if sku in self.products:
            return False
        self.products[sku] = (False, price)
        return True

    def add_weighed(self, sku, name, price_per_kg):
        if sku in self.products:
            return False
        self.products[sku] = (True, price_per_kg)
        return True

    def scan(self, sku, qty=1):
        if sku not in self.products:
            return False
        self.lines.append((sku, qty))
        return True

    def add_multibuy(self, sku, n, price):
        p = self.products.get(sku)
        if p is None or sku in self.promos or p[0] or n < 2 or price >= n * p[1]:
            return False
        self.promos[sku] = ("multibuy", n, price)
        return True

    def add_percent_off(self, sku, percent):
        if sku not in self.products or sku in self.promos or not 1 <= percent <= 100:
            return False
        self.promos[sku] = ("percent", percent)
        return True

    def add_spend_discount(self, threshold, amount):
        if not 1 <= amount <= threshold:
            return False
        self.coupons.append((threshold, amount))
        return True

    def total(self):
        subtotal = 0
        for sku, qty in self.lines:
            weighed, price = self.products[sku]
            cost = (price * qty + 500) // 1000 if weighed else price * qty
            promo = self.promos.get(sku)
            if promo and promo[0] == "multibuy":    # the bug: groups counted inside one line
                _, n, deal = promo
                cost = qty // n * deal + qty % n * price
            elif promo:
                cost -= (cost * promo[1] + 50) // 100
            subtotal += cost
        best = max((a for t, a in self.coupons if subtotal >= t), default=0)
        return subtotal - best

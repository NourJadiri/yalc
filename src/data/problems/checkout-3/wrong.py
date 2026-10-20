# The tempting shortcut: apply "n for price" to each scan line on its own.
# A line of 4 milks gets its groups, but scanning milk twice, one at a time,
# never forms a group of 2, so the deal silently disappears.

class Checkout:
    def __init__(self):
        self.products = {}                      # sku -> [weighed?, price, promo]
        self.lines = {}                         # sku -> the qty of each of its lines
        self.running = 0
        self.coupons = []

    def add_product(self, sku, name, price):
        if sku in self.products:
            return False
        self.products[sku] = [False, price, None]
        return True

    def add_weighed(self, sku, name, price_per_kg):
        if sku in self.products:
            return False
        self.products[sku] = [True, price_per_kg, None]
        return True

    def _net(self, sku, qty):
        weighed, price, promo = self.products[sku]
        gross = (price * qty + 500) // 1000 if weighed else price * qty
        if promo is None:
            return gross
        if promo[0] == "multibuy":              # the bug: groups counted inside one line
            _, n, deal = promo
            return qty // n * deal + qty % n * price
        return gross - (gross * promo[1] + 50) // 100

    def scan(self, sku, qty=1):
        if sku not in self.products:
            return False
        self.lines.setdefault(sku, []).append(qty)
        self.running += self._net(sku, qty)
        return True

    def _attach(self, sku, promo):
        mine = self.lines.get(sku, [])
        self.running -= sum(self._net(sku, q) for q in mine)
        self.products[sku][2] = promo
        self.running += sum(self._net(sku, q) for q in mine)

    def add_multibuy(self, sku, n, price):
        p = self.products.get(sku)
        if p is None or p[2] is not None or p[0] or n < 2 or price >= n * p[1]:
            return False
        self._attach(sku, ("multibuy", n, price))
        return True

    def add_percent_off(self, sku, percent):
        p = self.products.get(sku)
        if p is None or p[2] is not None or not 1 <= percent <= 100:
            return False
        self._attach(sku, ("percent", percent))
        return True

    def add_spend_discount(self, threshold, amount):
        if not 1 <= amount <= threshold:
            return False
        self.coupons.append((threshold, amount))
        return True

    def total(self):
        best = max((a for t, a in self.coupons if self.running >= t), default=0)
        return self.running - best

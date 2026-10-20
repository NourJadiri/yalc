# Rounds with Python's round(). It looks right, but round() sends an exact
# half to the even neighbour: 448.5 becomes 448, not 449. Halves above an odd
# number (149.5 -> 150) come out right, which is why the bug survives a quick test.

class Checkout:
    def __init__(self):
        self.products = {}                      # sku -> (weighed?, price)
        self.lines = []
        self.running = 0

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
        weighed, price = self.products[sku]
        cost = round(price * qty / 1000) if weighed else price * qty
        self.lines.append((sku, qty, cost))
        self.running += cost
        return True

    def total(self):
        return self.running

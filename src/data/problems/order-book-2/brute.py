# Every resting order sits in one plain list. Each fill scans the whole list
# for the best order that can trade, and a cancel searches the list for its
# id, so it's slow, but there's little to get wrong.

class OrderBook:
    def __init__(self):
        self.resting = []           # [id, side, price, qty], side "B" or "S"
        self.last_id = 0

    def buy(self, trader, price, qty):
        return self._order("B", price, qty)

    def sell(self, trader, price, qty):
        return self._order("S", price, qty)

    def top(self):
        bids = [o[2] for o in self.resting if o[1] == "B"]
        asks = [o[2] for o in self.resting if o[1] == "S"]
        return [max(bids) if bids else 0, min(asks) if asks else 0]

    def cancel(self, order_id):
        for o in self.resting:
            if o[0] == order_id:
                self.resting.remove(o)
                return True
        return False

    def _order(self, side, price, qty):
        self.last_id += 1
        me = self.last_id
        trades = []
        while qty > 0:
            if side == "B":
                fits = [o for o in self.resting if o[1] == "S" and o[2] <= price]
                rank = lambda o: (o[2], o[0])       # cheapest, then oldest
            else:
                fits = [o for o in self.resting if o[1] == "B" and o[2] >= price]
                rank = lambda o: (-o[2], o[0])      # highest, then oldest
            if not fits:
                break
            o = min(fits, key=rank)
            n = min(qty, o[3])
            trades.append([me, o[0], o[2], n] if side == "B" else [o[0], me, o[2], n])
            qty -= n
            o[3] -= n
            if o[3] == 0:
                self.resting.remove(o)
        if qty > 0:
            self.resting.append([me, side, price, qty])
        return trades

# Every resting order sits in one plain list with its trader and the time it
# joined its line, and every trade goes into a log. Each fill scans the whole
# list for the best order that can trade; position and pnl add up the log from
# scratch. Slow, but there's little to get wrong.

class OrderBook:
    def __init__(self):
        self.resting = []           # [id, trader, side, price, qty, joined], side "B" or "S"
        self.log = []               # (buyer, seller, price, qty) for every trade
        self.last_id = 0
        self.clock = 0

    def buy(self, trader, price, qty):
        return self._order(trader, "B", price, qty)

    def sell(self, trader, price, qty):
        return self._order(trader, "S", price, qty)

    def top(self):
        bids = [o[3] for o in self.resting if o[2] == "B"]
        asks = [o[3] for o in self.resting if o[2] == "S"]
        return [max(bids) if bids else 0, min(asks) if asks else 0]

    def cancel(self, order_id):
        for o in self.resting:
            if o[0] == order_id:
                self.resting.remove(o)
                return True
        return False

    def amend(self, order_id, qty):
        for o in self.resting:
            if o[0] == order_id:
                if qty > o[4]:              # a raise joins the back of the line
                    self.clock += 1
                    o[5] = self.clock
                o[4] = qty
                return True
        return False

    def position(self, trader):
        bought = sum(q for b, s, p, q in self.log if b == trader)
        sold = sum(q for b, s, p, q in self.log if s == trader)
        return bought - sold

    def pnl(self, trader, mark):
        received = sum(p * q for b, s, p, q in self.log if s == trader)
        paid = sum(p * q for b, s, p, q in self.log if b == trader)
        return received - paid + self.position(trader) * mark

    def _order(self, trader, side, price, qty):
        self.last_id += 1
        me = self.last_id
        trades = []
        while qty > 0:
            if side == "B":
                fits = [o for o in self.resting if o[2] == "S" and o[3] <= price]
                rank = lambda o: (o[3], o[5])       # cheapest, then longest in line
            else:
                fits = [o for o in self.resting if o[2] == "B" and o[3] >= price]
                rank = lambda o: (-o[3], o[5])      # highest, then longest in line
            if not fits:
                break
            o = min(fits, key=rank)
            if o[1] == trader:                      # own order: cancel it, look again
                self.resting.remove(o)
                continue
            n = min(qty, o[4])
            if side == "B":
                trades.append([me, o[0], o[3], n])
                self.log.append((trader, o[1], o[3], n))
            else:
                trades.append([o[0], me, o[3], n])
                self.log.append((o[1], trader, o[3], n))
            qty -= n
            o[4] -= n
            if o[4] == 0:
                self.resting.remove(o)
        if qty > 0:
            self.clock += 1
            self.resting.append([me, trader, side, price, qty, self.clock])
        return trades

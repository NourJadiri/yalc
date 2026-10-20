# The common slip: every trade happens at the incoming order's price instead of
# the resting order's. A buy at 102 that meets a sell resting at 101 should trade
# at 101; this one trades at 102. Prices only come out right when both orders
# name the same price.
import heapq


class OrderBook:
    def __init__(self):
        self.bids = []          # [-price, id, qty]
        self.asks = []          # [price, id, qty]
        self.next_id = 1

    def buy(self, trader, price, qty):
        return self._go(True, price, qty)

    def sell(self, trader, price, qty):
        return self._go(False, price, qty)

    def top(self):
        return [-self.bids[0][0] if self.bids else 0, self.asks[0][0] if self.asks else 0]

    def _go(self, is_buy, price, qty):
        me = self.next_id
        self.next_id += 1
        book = self.asks if is_buy else self.bids
        trades = []
        while qty and book:
            entry = book[0]
            rest_price = entry[0] if is_buy else -entry[0]
            if (rest_price > price) if is_buy else (rest_price < price):
                break
            n = min(qty, entry[2])
            trades.append([me, entry[1], price, n] if is_buy else [entry[1], me, price, n])
            qty -= n
            entry[2] -= n
            if entry[2] == 0:
                heapq.heappop(book)
        if qty:
            heapq.heappush(self.bids if is_buy else self.asks,
                           [-price if is_buy else price, me, qty])
        return trades

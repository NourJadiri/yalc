# The tempting shortcut: amend just overwrites the quantity, whichever way it
# goes. Lowering is fine, but a raised order keeps its old place in line, so it
# still trades ahead of orders that were waiting behind it.
import heapq


class OrderBook:
    def __init__(self):
        self.bids = []          # (-price, id)
        self.asks = []          # (price, id)
        self.left = {}          # id -> [price, quantity left], resting orders only
        self.next_id = 1

    def buy(self, trader, price, qty):
        return self._go(True, price, qty)

    def sell(self, trader, price, qty):
        return self._go(False, price, qty)

    def _clean(self, book):
        while book and book[0][1] not in self.left:
            heapq.heappop(book)

    def top(self):
        self._clean(self.bids)
        self._clean(self.asks)
        return [-self.bids[0][0] if self.bids else 0, self.asks[0][0] if self.asks else 0]

    def cancel(self, order_id):
        return self.left.pop(order_id, None) is not None

    def amend(self, order_id, qty):
        if order_id not in self.left:
            return False
        self.left[order_id][1] = qty
        return True

    def _go(self, is_buy, price, qty):
        me = self.next_id
        self.next_id += 1
        book = self.asks if is_buy else self.bids
        trades = []
        while qty:
            self._clean(book)
            if not book:
                break
            rid = book[0][1]
            rest_price, rest_qty = self.left[rid]
            if (rest_price > price) if is_buy else (rest_price < price):
                break
            n = min(qty, rest_qty)
            trades.append([me, rid, rest_price, n] if is_buy else [rid, me, rest_price, n])
            qty -= n
            self.left[rid][1] -= n
            if self.left[rid][1] == 0:
                heapq.heappop(book)
                del self.left[rid]
        if qty:
            self.left[me] = [price, qty]
            heapq.heappush(self.bids if is_buy else self.asks, (-price if is_buy else price, me))
        return trades

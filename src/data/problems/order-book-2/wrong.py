# Lazy deletion done halfway: matching skips cancelled orders, but top() reads
# the heap tops as they are. Cancel the only ask at 15 and top() still reports
# 15, although nothing rests there any more.
import heapq


class OrderBook:
    def __init__(self):
        self.bids = []          # (-price, id)
        self.asks = []          # (price, id)
        self.left = {}          # id -> quantity left, resting orders only
        self.next_id = 1

    def buy(self, trader, price, qty):
        return self._go(True, price, qty)

    def sell(self, trader, price, qty):
        return self._go(False, price, qty)

    def top(self):
        return [-self.bids[0][0] if self.bids else 0, self.asks[0][0] if self.asks else 0]

    def cancel(self, order_id):
        return self.left.pop(order_id, None) is not None

    def _go(self, is_buy, price, qty):
        me = self.next_id
        self.next_id += 1
        book = self.asks if is_buy else self.bids
        trades = []
        while qty and book:
            key, rid = book[0]
            if rid not in self.left:            # cancelled: skip it
                heapq.heappop(book)
                continue
            rest_price = key if is_buy else -key
            if (rest_price > price) if is_buy else (rest_price < price):
                break
            n = min(qty, self.left[rid])
            trades.append([me, rid, rest_price, n] if is_buy else [rid, me, rest_price, n])
            qty -= n
            self.left[rid] -= n
            if self.left[rid] == 0:
                heapq.heappop(book)
                del self.left[rid]
        if qty:
            self.left[me] = qty
            heapq.heappush(self.bids if is_buy else self.asks, (-price if is_buy else price, me))
        return trades

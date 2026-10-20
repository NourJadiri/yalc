# Self-trade prevention done as "skip it": when matching reaches the trader's
# own order, this steps over it and puts it back afterwards instead of
# cancelling it. The order stays in the book, so top() still shows it, cancel()
# still finds it, and the next trader to come along trades with it.
import heapq
from collections import defaultdict


class OrderBook:
    def __init__(self):
        self.bids = []          # (-price, seq, id)
        self.asks = []          # (price, seq, id)
        self.live = {}          # id -> [trader, is_buy, price, qty, seq], resting orders only
        self.next_id = 1
        self.seq = 0
        self.shares = defaultdict(int)
        self.cash = defaultdict(int)

    def buy(self, trader, price, qty):
        return self._go(trader, True, price, qty)

    def sell(self, trader, price, qty):
        return self._go(trader, False, price, qty)

    def _clean(self, book):
        while book and (book[0][2] not in self.live or self.live[book[0][2]][4] != book[0][1]):
            heapq.heappop(book)

    def top(self):
        self._clean(self.bids)
        self._clean(self.asks)
        return [-self.bids[0][0] if self.bids else 0, self.asks[0][0] if self.asks else 0]

    def cancel(self, order_id):
        return self.live.pop(order_id, None) is not None

    def amend(self, order_id, qty):
        o = self.live.get(order_id)
        if o is None:
            return False
        if qty > o[3]:
            self._queue(order_id)
        o[3] = qty
        return True

    def position(self, trader):
        return self.shares.get(trader, 0)

    def pnl(self, trader, mark):
        return self.cash.get(trader, 0) + self.shares.get(trader, 0) * mark

    def _queue(self, oid):
        o = self.live[oid]
        self.seq += 1
        o[4] = self.seq
        heapq.heappush(self.bids if o[1] else self.asks, (-o[2] if o[1] else o[2], o[4], oid))

    def _go(self, trader, is_buy, price, qty):
        me = self.next_id
        self.next_id += 1
        book = self.asks if is_buy else self.bids
        trades, skipped = [], []
        while qty:
            self._clean(book)
            if not book:
                break
            rid = book[0][2]
            r_trader, _, r_price, r_qty, _ = self.live[rid]
            if (r_price > price) if is_buy else (r_price < price):
                break
            if r_trader == trader:
                skipped.append(heapq.heappop(book))     # step over it for now
                continue
            n = min(qty, r_qty)
            buyer, seller = (trader, r_trader) if is_buy else (r_trader, trader)
            trades.append([me, rid, r_price, n] if is_buy else [rid, me, r_price, n])
            self.shares[buyer] += n
            self.shares[seller] -= n
            self.cash[buyer] -= n * r_price
            self.cash[seller] += n * r_price
            qty -= n
            self.live[rid][3] -= n
            if self.live[rid][3] == 0:
                heapq.heappop(book)
                del self.live[rid]
        for entry in skipped:                           # ...and back in the book it goes
            heapq.heappush(book, entry)
        if qty:
            self.live[me] = [trader, is_buy, price, qty, 0]
            self._queue(me)
        return trades

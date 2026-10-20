class Order:
    """A resting order: its side, its price and how much of it is left."""

    def __init__(self, is_buy, price, qty):
        self.is_buy = is_buy
        self.price = price
        self.qty = qty


class OrderBook:

    def __init__(self):
        # One heap per side, best order on top. Entries are (key, id): bids
        # use -price as the key, so the highest bid comes out first; asks use
        # price. Equal prices fall back to the id, which is arrival order.
        self.bids = []
        self.asks = []
        self.orders = {}            # id -> Order, for every order resting in the book
        self.next_id = 1

    def buy(self, trader: str, price: int, qty: int) -> List[List[int]]:
        return self._place(True, price, qty)

    def sell(self, trader: str, price: int, qty: int) -> List[List[int]]:
        return self._place(False, price, qty)

    def top(self) -> List[int]:
        bid, ask = self._best(self.bids), self._best(self.asks)
        return [self.orders[bid].price if bid else 0,
                self.orders[ask].price if ask else 0]

    def cancel(self, order_id: int) -> bool:
        # 1. Only resting orders are in `orders`, so one lookup answers every
        # case: unknown, filled and already cancelled ids are all missing.
        # The heap entry stays behind, dead, until it reaches the top.
        return self.orders.pop(order_id, None) is not None

    def _place(self, is_buy, price, qty):
        # Every order takes the next id, even one that never rests
        oid = self.next_id
        self.next_id += 1
        other = self.asks if is_buy else self.bids
        trades = []
        while qty:
            rid = self._best(other)
            if rid is None:
                break
            rest = self.orders[rid]
            # Stop at the first resting order out of reach; otherwise trade
            # the smaller quantity at the resting order's price.
            if (rest.price > price) if is_buy else (rest.price < price):
                break
            fill = min(qty, rest.qty)
            trades.append([oid, rid, rest.price, fill] if is_buy else [rid, oid, rest.price, fill])
            qty -= fill
            rest.qty -= fill
            # A filled resting order leaves the book. A partly filled one stays
            # on top: its heap entry, and so its place in line, hasn't changed.
            if rest.qty == 0:
                heappop(other)
                del self.orders[rid]
        # Whatever is left rests on its own side
        if qty:
            self.orders[oid] = Order(is_buy, price, qty)
            self._rest(oid)
        return trades

    def _rest(self, oid):
        order = self.orders[oid]
        if order.is_buy:
            heappush(self.bids, (-order.price, oid))
        else:
            heappush(self.asks, (order.price, oid))

    def _best(self, book):
        """The id of the best order resting on one side, or None if that side is empty."""
        # 2. Drop dead entries as they reach the top. Matching and top() both
        # come through here, so neither ever sees a cancelled order.
        while book and book[0][-1] not in self.orders:
            heappop(book)
        return book[0][-1] if book else None

class Order:
    """A resting order: who sent it, its side, its price, how much of it is left, and its place in line."""

    def __init__(self, trader, is_buy, price, qty):
        self.trader = trader
        self.is_buy = is_buy
        self.price = price
        self.qty = qty
        self.seq = 0                # place in line, set by _rest


class OrderBook:

    def __init__(self):
        # One heap per side, best order on top. Entries are (key, seq, id):
        # bids use -price as the key, so the highest bid comes out first; asks
        # use price. Equal prices fall back to seq, the order's place in line.
        self.bids = []
        self.asks = []
        self.orders = {}            # id -> Order, for every order resting in the book
        self.next_id = 1
        # Places in line come from one counter: a new order, or a raised one,
        # takes the next number and so queues behind everyone already waiting.
        self.next_seq = 1
        # 1. Running totals per trader, updated on every fill: shares bought
        # minus shares sold, and cash received minus cash paid.
        self.shares = collections.defaultdict(int)
        self.cash = collections.defaultdict(int)

    def buy(self, trader: str, price: int, qty: int) -> List[List[int]]:
        return self._place(True, trader, price, qty)

    def sell(self, trader: str, price: int, qty: int) -> List[List[int]]:
        return self._place(False, trader, price, qty)

    def top(self) -> List[int]:
        bid, ask = self._best(self.bids), self._best(self.asks)
        return [self.orders[bid].price if bid else 0,
                self.orders[ask].price if ask else 0]

    def cancel(self, order_id: int) -> bool:
        # Only resting orders are in `orders`, so one lookup answers every
        # case: unknown, filled and already cancelled ids are all missing.
        # The heap entry stays behind, dead, until it reaches the top.
        return self.orders.pop(order_id, None) is not None

    def amend(self, order_id: int, qty: int) -> bool:
        # Only a resting order can be amended
        order = self.orders.get(order_id)
        if order is None:
            return False
        # Lowering the quantity, or keeping it, keeps the place in line.
        # Raising it re-queues the order as if it had just arrived.
        raised = qty > order.qty
        order.qty = qty
        if raised:
            self._rest(order_id)
        return True

    def position(self, trader: str) -> int:
        # 2. Queries only read the totals; a trader who never traded reads 0
        return self.shares.get(trader, 0)

    def pnl(self, trader: str, mark: int) -> int:
        return self.cash.get(trader, 0) + self.shares.get(trader, 0) * mark

    def _place(self, is_buy, trader, price, qty):
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
            # Stop at the first resting order out of reach
            if (rest.price > price) if is_buy else (rest.price < price):
                break
            # 3. Self-trade prevention: matching reached one of the trader's own
            # orders. Cancel it, exactly as cancel() would, and keep matching.
            if rest.trader == trader:
                self.cancel(rid)
                continue
            # Trade the smaller quantity at the resting order's price
            fill = min(qty, rest.qty)
            trades.append([oid, rid, rest.price, fill] if is_buy else [rid, oid, rest.price, fill])
            # 4. Shares go from the seller to the buyer, and cash the other way
            buyer, seller = (trader, rest.trader) if is_buy else (rest.trader, trader)
            self.shares[buyer] += fill
            self.shares[seller] -= fill
            self.cash[buyer] -= fill * rest.price
            self.cash[seller] += fill * rest.price
            qty -= fill
            rest.qty -= fill
            # A filled resting order leaves the book. A partly filled one stays
            # on top: its heap entry, and so its place in line, hasn't changed.
            if rest.qty == 0:
                heappop(other)
                del self.orders[rid]
        # Whatever is left rests on its own side
        if qty:
            self.orders[oid] = Order(trader, is_buy, price, qty)
            self._rest(oid)
        return trades

    def _rest(self, oid):
        # Join the back of the line at its price: a fresh seq and a new heap
        # entry. Any older entry of this order is now stale.
        order = self.orders[oid]
        order.seq = self.next_seq
        self.next_seq += 1
        if order.is_buy:
            heappush(self.bids, (-order.price, order.seq, oid))
        else:
            heappush(self.asks, (order.price, order.seq, oid))

    def _best(self, book):
        """The id of the best order resting on one side, or None if that side is empty."""
        # An entry is live only if its order still rests and still holds the
        # seq the entry was pushed with. Dead and stale entries are dropped as
        # they reach the top, so matching and top() never see them.
        while book:
            _, seq, oid = book[0]
            order = self.orders.get(oid)
            if order is not None and order.seq == seq:
                return oid
            heappop(book)
        return None

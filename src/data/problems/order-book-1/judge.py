# Most tests carry their expected outputs. The large ones carry null and are
# checked against this simulation instead, so the spec doesn't have to store
# tens of thousands of trades. It keeps the book differently from the
# reference: one first-come-first-served queue per price level, plus a heap of
# the prices that have a queue.
import heapq
from collections import deque


def simulate(ops, args):
    levels = ({}, {})       # [0] asks, [1] bids: price -> deque of [id, qty left]
    prices = ([], [])       # [0] ask prices, [1] bid prices negated: heaps
    next_id, out = 1, []
    for op, a in zip(ops, args):
        if op == "buy" or op == "sell":
            _, price, qty = a
            mine = 1 if op == "buy" else 0
            theirs = 1 - mine
            me, next_id = next_id, next_id + 1
            trades = []
            while qty:
                best = best_price(levels[theirs], prices[theirs], theirs)
                if best is None or (best > price if mine else best < price):
                    break
                queue = levels[theirs][best]
                head = queue[0]
                n = min(qty, head[1])
                trades.append([me, head[0], best, n] if mine else [head[0], me, best, n])
                qty -= n
                head[1] -= n
                if head[1] == 0:
                    queue.popleft()
                    if not queue:
                        del levels[theirs][best]
            if qty:
                if price not in levels[mine]:
                    levels[mine][price] = deque()
                    heapq.heappush(prices[mine], -price if mine else price)
                levels[mine][price].append([me, qty])
            out.append(trades)
        elif op == "top":
            bid = best_price(levels[1], prices[1], 1)
            ask = best_price(levels[0], prices[0], 0)
            out.append([bid or 0, ask or 0])
        else:
            out.append(None)
    return out


def best_price(levels, heap, is_bid):
    """The best price on one side that still has orders, or None."""
    while heap:
        price = -heap[0] if is_bid else heap[0]
        if price in levels:
            return price
        heapq.heappop(heap)
    return None


def check(got, expected, args):
    ops, xs = args["ops"], args["args"]
    if expected is None:
        expected = simulate(ops, xs)
    if not isinstance(got, list) or len(got) != len(expected):
        return False
    for k, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            return ("Call #" + str(k) + " " + ops[k] + "(" + ", ".join(show(v, 80) for v in xs[k]) + ")"
                    + " returned " + show(g, 200) + ", expected " + show(e, 200) + ".")
    return True

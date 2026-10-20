# Most tests carry their expected outputs. The large ones carry null and are
# checked against this simulation instead, so the spec doesn't have to store
# tens of thousands of answers. It keeps the book differently from the
# reference: one queue per price level, in line order, plus a heap of the
# prices that have a queue. A cancel takes its order straight out of its
# queue, and a raise moves it to the queue's end.
import heapq
from collections import OrderedDict


def simulate(ops, args):
    levels = ({}, {})       # [0] asks, [1] bids: price -> OrderedDict(id -> qty left)
    prices = ([], [])       # [0] ask prices, [1] bid prices negated: heaps
    where = {}              # resting id -> (side, price)
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
                level = levels[theirs][best]
                rid = next(iter(level))
                n = min(qty, level[rid])
                trades.append([me, rid, best, n] if mine else [rid, me, best, n])
                qty -= n
                if level[rid] == n:
                    remove(levels, where, rid)
                else:
                    level[rid] -= n
            if qty:
                if price not in levels[mine]:
                    levels[mine][price] = OrderedDict()
                    heapq.heappush(prices[mine], -price if mine else price)
                levels[mine][price][me] = qty
                where[me] = (mine, price)
            out.append(trades)
        elif op == "cancel":
            oid = a[0]
            if oid in where:
                remove(levels, where, oid)
                out.append(True)
            else:
                out.append(False)
        elif op == "amend":
            oid, qty = a
            if oid in where:
                side, price = where[oid]
                level = levels[side][price]
                if qty > level[oid]:
                    level.move_to_end(oid)
                level[oid] = qty
                out.append(True)
            else:
                out.append(False)
        elif op == "top":
            bid = best_price(levels[1], prices[1], 1)
            ask = best_price(levels[0], prices[0], 0)
            out.append([bid or 0, ask or 0])
        else:
            out.append(None)
    return out


def remove(levels, where, oid):
    side, price = where.pop(oid)
    level = levels[side][price]
    del level[oid]
    if not level:
        del levels[side][price]


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

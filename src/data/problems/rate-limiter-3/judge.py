# Most tests carry their expected outputs. The large ones carry null and are
# checked against this simulation instead, so the spec doesn't have to store
# tens of thousands of answers.
import heapq


def simulate(ops, args):
    limits = [tuple(args[0])]                   # (capacity, interval)
    buckets = {}                                # client -> (levels in ms of credit, last time)
    slots = timeout = None
    busy, heaps, streams = {}, {}, {}           # streams: id -> [client, open?]
    out = [None]

    def expire(client, t):
        heap = heaps.get(client)
        while heap and heap[0][0] <= t:
            stream = streams[heapq.heappop(heap)[1]]
            if stream[1]:
                stream[1] = False
                busy[client] -= 1

    def request(client, t, cost):
        if client not in buckets:
            buckets[client] = ([c * i for c, i in limits], t)
        levels, last = buckets[client]
        levels = [min(c * i, lv + t - last) for (c, i), lv in zip(limits, levels)]
        buckets[client] = (levels, t)
        if not all(lv >= cost * i for (c, i), lv in zip(limits, levels)):
            return False
        if slots is not None:
            expire(client, t)
            if busy.get(client, 0) >= slots:
                return False
        buckets[client] = ([lv - cost * i for (c, i), lv in zip(limits, levels)], t)
        return True

    for op, a in zip(ops[1:], args[1:]):
        if op == "add_limit":
            limits.append(tuple(a))
            out.append(None)
        elif op == "set_concurrency":
            slots, timeout = a
            out.append(None)
        elif op == "allow":
            out.append(request(a[0], a[1], a[2] if len(a) > 2 else 1))
        elif op == "start":
            client, t, rid = a[0], a[1], a[2]
            passed = request(client, t, a[3] if len(a) > 3 else 1)
            if passed:
                busy[client] = busy.get(client, 0) + 1
                streams[rid] = [client, True]
                if timeout is not None:
                    heapq.heappush(heaps.setdefault(client, []), (t + timeout, rid))
            out.append(passed)
        else:                                   # finish
            rid, t = a
            stream = streams.get(rid)
            if stream is not None:
                expire(stream[0], t)
            if stream is not None and stream[1]:
                stream[1] = False
                busy[stream[0]] -= 1
                out.append(True)
            else:
                out.append(False)
    return out


def check(got, expected, args):
    ops, xs = args["ops"], args["args"]
    if expected is None:
        expected = simulate(ops, xs)
    if not isinstance(got, list) or len(got) != len(expected):
        return False
    for k, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            return ("Call #" + str(k) + " " + ops[k] + "(" + ", ".join(map(show, xs[k])) + ")"
                    + " returned " + show(g) + ", expected " + show(e) + ".")
    return True

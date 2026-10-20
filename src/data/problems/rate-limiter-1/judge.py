# Most tests carry their expected outputs. The two large ones carry null and
# are checked against this simulation instead, so the spec doesn't have to
# store a hundred thousand answers.


def simulate(ops, args):
    capacity, interval = args[0]
    full = capacity * interval
    buckets, out = {}, [None]
    for op, a in zip(ops[1:], args[1:]):
        client, t = a
        level, last = buckets.get(client, (full, t))
        level = min(full, level + t - last)
        passed = level >= interval
        buckets[client] = (level - interval if passed else level, t)
        out.append(passed)
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

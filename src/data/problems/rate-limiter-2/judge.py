# Most tests carry their expected outputs. The large ones carry null and are
# checked against this simulation instead, so the spec doesn't have to store a
# hundred thousand answers.


def simulate(ops, args):
    limits = [tuple(args[0])]                   # (capacity, interval)
    buckets, out = {}, [None]
    for op, a in zip(ops[1:], args[1:]):
        if op == "add_limit":
            limits.append(tuple(a))
            out.append(None)
            continue
        client, t = a[0], a[1]
        cost = a[2] if len(a) > 2 else 1
        if client not in buckets:
            buckets[client] = ([c * i for c, i in limits], t)
        levels, last = buckets[client]
        levels = [min(c * i, lv + t - last) for (c, i), lv in zip(limits, levels)]
        passed = all(lv >= cost * i for (c, i), lv in zip(limits, levels))
        if passed:
            levels = [lv - cost * i for (c, i), lv in zip(limits, levels)]
        buckets[client] = (levels, t)
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

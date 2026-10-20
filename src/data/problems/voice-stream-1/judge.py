# Most tests carry their expected outputs. The two large ones carry null and are
# checked against this plain simulation instead, so the spec doesn't have to
# store two hundred thousand answers. It remembers every seq it keeps, which is
# fine for a checker.


def simulate(ops, args):
    window, kept, top, out = args[0][0], set(), -1, []
    for op, a in zip(ops, args):
        if op == "receive":
            seq = a[0]
            if seq > top:
                top = seq
                kept.add(seq)
                out.append(True)
            elif seq <= top - window or seq in kept:
                out.append(False)
            else:
                kept.add(seq)
                out.append(True)
        else:
            out.append(None)
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

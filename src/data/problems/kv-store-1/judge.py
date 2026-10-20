# Most tests carry their expected outputs. The 100,000-call test carries null
# and is checked against this plain simulation instead, so the spec doesn't
# have to store a hundred thousand answers.


def simulate(ops, args):
    data, holders, out = {}, {}, []
    for op, a in zip(ops, args):
        if op == "set":
            key, value = a
            if key in data:
                holders[data[key]] -= 1
            data[key] = value
            holders[value] = holders.get(value, 0) + 1
            out.append(None)
        elif op == "get":
            out.append(data.get(a[0]))
        elif op == "delete":
            if a[0] in data:
                holders[data.pop(a[0])] -= 1
                out.append(True)
            else:
                out.append(False)
        elif op == "count":
            out.append(holders.get(a[0], 0))
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

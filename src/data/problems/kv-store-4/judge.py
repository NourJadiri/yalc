# Most tests carry their expected outputs. The large generated tests carry
# null and are checked against this simulation instead, so the spec doesn't
# have to store a hundred thousand answers. It models a crash its own way:
# the committed state is exactly what is left after every open transaction
# rolls back, so crash() rolls them all back and recover() just counts keys.
# Each open transaction remembers what every key it touched held before its
# first change; a commit merges that into the parent (smaller map into larger).
# checkpoint() only has to say how many keys are committed: a key touched by an
# open transaction is committed with the value the outermost such map holds.


def simulate(ops, args):
    data, holders, out = {}, {}, []
    first = []                          # per open transaction: key -> value before (None if absent)

    def put(key, value):
        if key in data:
            holders[data[key]] -= 1
            del data[key]
        if value is not None:
            data[key] = value
            holders[value] = holders.get(value, 0) + 1

    def touch(key):
        if first and key not in first[-1]:
            first[-1][key] = data.get(key)

    def rollback():
        for key, value in first.pop().items():
            put(key, value)

    for op, a in zip(ops, args):
        res = None
        if op == "set":
            touch(a[0])
            put(a[0], a[1])
        elif op == "get":
            res = data.get(a[0])
        elif op == "delete":
            res = a[0] in data
            if res:
                touch(a[0])
                put(a[0], None)
        elif op == "count":
            res = holders.get(a[0], 0)
        elif op == "begin":
            first.append({})
        elif op == "rollback":
            res = bool(first)
            if res:
                rollback()
        elif op == "commit":
            res = bool(first)
            if res:
                child = first.pop()
                if first:
                    parent = first[-1]
                    if len(child) > len(parent):
                        child.update(parent)        # the parent's "before" is older: it wins
                        first[-1] = child
                    else:
                        for key, value in child.items():
                            parent.setdefault(key, value)
        elif op == "crash":
            while first:
                rollback()
        elif op == "recover":
            res = len(data)
        elif op == "checkpoint":
            res, seen = len(data), set()
            for level in first:                     # outermost first
                for key, before in level.items():
                    if key not in seen:
                        seen.add(key)
                        res += (before is not None) - (key in data)
        out.append(res)
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

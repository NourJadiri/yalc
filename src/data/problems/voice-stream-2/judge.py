# Most tests carry their expected outputs. The large ones carry null and are
# checked against this plain simulation instead, so the spec doesn't have to
# store a hundred thousand answers. It remembers every seq it keeps, which is
# fine for a checker.


def simulate(ops, args):
    window, kept, top, out = args[0][0], set(), -1, []
    buffer, nxt = {}, 0
    for op, a in zip(ops, args):
        if op == "receive":
            seq, data = a[0], a[1]
            if seq < nxt or (seq <= top and (seq <= top - window or seq in kept)):
                out.append(False)
            else:
                top = max(top, seq)
                kept.add(seq)
                buffer[seq] = data
                out.append(True)
        elif op == "play":
            run = []
            while nxt in buffer:
                run.append(buffer.pop(nxt))
                nxt += 1
            out.append(run)
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

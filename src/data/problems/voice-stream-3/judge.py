# Most tests carry their expected outputs. The large ones carry null and are
# checked against this plain simulation instead, so the spec doesn't have to
# store a hundred thousand answers. It keeps every seq it ever kept, and finds
# the earliest arrival with a heap rather than the reference's queue.
import heapq


def simulate(ops, args):
    window, kept, top, out = args[0][0], set(), -1, []
    buffer, nxt, delay, heap = {}, 0, None, []
    for k, (op, a) in enumerate(zip(ops, args)):
        if op == "receive":
            seq, data, t = a[0], a[1], a[2]
            if seq < nxt or (seq <= top and (seq <= top - window or seq in kept)):
                out.append(False)
            else:
                top = max(top, seq)
                kept.add(seq)
                buffer[seq] = data
                heapq.heappush(heap, (t, k, seq))
                out.append(True)
        elif op == "play":
            t, run = a[0], []
            while True:
                if nxt in buffer:
                    run.append(buffer.pop(nxt))
                elif buffer and delay is not None:
                    while heap[0][2] not in buffer:
                        heapq.heappop(heap)
                    if heap[0][0] > t - delay:
                        break
                    run.append(None)
                else:
                    break
                nxt += 1
            out.append(run)
        elif op == "set_delay":
            delay = a[0]
            out.append(None)
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

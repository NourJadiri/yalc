# Most tests carry their expected outputs. The 10^4-line tests whose answer is
# about as long as the files carry null, so the spec doesn't have to store ten
# thousand lines, and are checked against this copy of the rules instead. A
# long result that is wrong is reported by its first wrong entry, not as a
# list cut off after 200 characters.


def canonical_diff(a, b):
    top = 0
    while top < len(a) and top < len(b) and a[top] == b[top]:
        top += 1
    bottom = 0
    while (bottom < len(a) - top and bottom < len(b) - top
           and a[len(a) - 1 - bottom] == b[len(b) - 1 - bottom]):
        bottom += 1
    x, y = a[top:len(a) - bottom], b[top:len(b) - bottom]
    m, n = len(x), len(y)
    L = [[0] * (n + 1) for _ in range(m + 1)]       # LCS lengths of suffixes
    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            L[i][j] = L[i + 1][j + 1] + 1 if x[i] == y[j] else max(L[i + 1][j], L[i][j + 1])
    out, i, j = [" " + s for s in a[:top]], 0, 0
    while i < m or j < n:
        if i < m and j < n and x[i] == y[j]:
            out.append(" " + x[i])
            i, j = i + 1, j + 1
        elif i < m and L[i + 1][j] == L[i][j]:
            out.append("-" + x[i])
            i += 1
        else:
            out.append("+" + y[j])
            j += 1
    return out + [" " + s for s in a[len(a) - bottom:]]


def canonical_unified(a, b, context):
    d = canonical_diff(a, b)
    before_a, before_b = [0], [0]
    for e in d:
        before_a.append(before_a[-1] + (e[0] != "+"))
        before_b.append(before_b[-1] + (e[0] != "-"))
    groups = []
    for k, e in enumerate(d):
        if e[0] != " ":
            if groups and k - groups[-1][1] - 1 <= 2 * context:
                groups[-1][1] = k
            else:
                groups.append([k, k])
    out = []
    for first, last in groups:
        lo, hi = max(0, first - context), min(len(d), last + 1 + context)
        n1, n2 = before_a[hi] - before_a[lo], before_b[hi] - before_b[lo]
        s1, s2 = before_a[lo] + (n1 > 0), before_b[lo] + (n2 > 0)
        out.append("@@ -" + str(s1) + "," + str(n1) + " +" + str(s2) + "," + str(n2) + " @@")
        out.extend(d[lo:hi])
    return out


SIMULATE = {"diff": canonical_diff, "unified": canonical_unified}


def simulate(ops, args):
    out = []
    for op, xs in zip(ops, args):
        out.append(SIMULATE[op](*xs) if op in SIMULATE else None)
    return out


def mismatch(g, e):
    if isinstance(g, list) and isinstance(e, list):
        for n, (x, y) in enumerate(zip(g, e)):
            if not same(x, y):
                return "entry " + str(n) + " of the result is " + show(x, 80) + ", expected " + show(y, 80) + "."
        return "the result has " + str(len(g)) + " entries, expected " + str(len(e)) + "."
    return "returned " + show(g, 200) + ", expected " + show(e, 200) + "."


def check(got, expected, args):
    ops, xs = args["ops"], args["args"]
    if expected is None:
        expected = simulate(ops, xs)
    if not isinstance(got, list) or len(got) != len(expected):
        return False
    for k, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            call = ops[k] + "(" + ", ".join(show(v, 80) for v in xs[k]) + ")"
            return "Call #" + str(k) + " " + call + ": " + mismatch(g, e)
    return True

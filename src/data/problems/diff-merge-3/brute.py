# The rules, literally. Every "is a shortest diff still possible?" question is
# answered by computing a fresh LCS length of what's left, so nothing is shared
# with the reference's single table walk. Cubic, and fine for small files.


def lcs_length(x, y):
    # The classic prefix table: t[i][j] = LCS length of x[:i] and y[:j].
    t = [[0] * (len(y) + 1) for _ in range(len(x) + 1)]
    for i in range(1, len(x) + 1):
        for j in range(1, len(y) + 1):
            if x[i - 1] == y[j - 1]:
                t[i][j] = t[i - 1][j - 1] + 1
            else:
                t[i][j] = max(t[i - 1][j], t[i][j - 1])
    return t[len(x)][len(y)]


class DiffTool:
    def __init__(self):
        pass

    def diff(self, a, b):
        # Rule 1: the longest run both files start with...
        start = 0
        while start < len(a) and start < len(b) and a[start] == b[start]:
            start += 1
        rest_a, rest_b = a[start:], b[start:]
        # ...then, of what remains, the longest run both end with.
        end = 0
        while (end < len(rest_a) and end < len(rest_b)
               and rest_a[len(rest_a) - 1 - end] == rest_b[len(rest_b) - 1 - end]):
            end += 1
        x = rest_a[:len(rest_a) - end]
        y = rest_b[:len(rest_b) - end]

        # Rule 2, one entry at a time. A shortest diff of the middle keeps
        # `best` lines; a step is allowed if that is still reachable after it.
        best = lcs_length(x, y)
        middle, kept, i, j = [], 0, 0, 0
        while i < len(x) or j < len(y):
            if i < len(x) and j < len(y) and x[i] == y[j]:
                middle.append(" " + x[i])
                kept += 1
                i += 1
                j += 1
            elif i < len(x) and kept + lcs_length(x[i + 1:], y[j:]) == best:
                middle.append("-" + x[i])
                i += 1
            else:
                middle.append("+" + y[j])
                j += 1

        return ([" " + line for line in a[:start]] + middle
                + [" " + line for line in rest_a[len(rest_a) - end:]])

    def unified(self, a, b, context):
        d = self.diff(a, b)

        # An entry is shown when it lies within `context` places of a change.
        # A hunk is a maximal run of shown entries: two changes end up in the
        # same run exactly when their windows overlap or touch.
        shown = [False] * len(d)
        for k, entry in enumerate(d):
            if entry[0] != " ":
                for t in range(k - context, k + context + 1):
                    if 0 <= t < len(d):
                        shown[t] = True

        # The line number each entry has in a and in b (None if it isn't there).
        in_a, in_b, count_a, count_b = [], [], 0, 0
        for entry in d:
            if entry[0] == "+":
                in_a.append(None)
            else:
                count_a += 1
                in_a.append(count_a)
            if entry[0] == "-":
                in_b.append(None)
            else:
                count_b += 1
                in_b.append(count_b)

        def start(numbers, lo, hi):
            inside = [x for x in numbers[lo:hi] if x is not None]
            if inside:
                return inside[0], len(inside)
            earlier = [x for x in numbers[:lo] if x is not None]
            return (earlier[-1] if earlier else 0), 0

        out, k = [], 0
        while k < len(d):
            if not shown[k]:
                k += 1
                continue
            end = k
            while end < len(d) and shown[end]:
                end += 1
            s1, n1 = start(in_a, k, end)
            s2, n2 = start(in_b, k, end)
            out.append("@@ -" + str(s1) + "," + str(n1) + " +" + str(s2) + "," + str(n2) + " @@")
            out.extend(d[k:end])
            k = end
        return out

    def merge(self, base, ours, theirs):
        def pairs(other):
            # {base line index: other line index} for every kept entry of the diff
            found, i, j = {}, 0, 0
            for entry in self.diff(base, other):
                if entry[0] == " ":
                    found[i] = j
                    i += 1
                    j += 1
                elif entry[0] == "-":
                    i += 1
                else:
                    j += 1
            return found

        with_ours, with_theirs = pairs(ours), pairs(theirs)
        anchors = sorted(q for q in with_ours if q in with_theirs)

        result, i, j, k = [], 0, 0, 0
        while (i, j, k) != (len(base), len(ours), len(theirs)):
            if i in anchors and with_ours[i] == j and with_theirs[i] == k:
                result.append(base[i])
                i, j, k = i + 1, j + 1, k + 1
                continue
            ahead = [q for q in anchors if q >= i]
            if ahead:
                q = ahead[0]
                to_j, to_k = with_ours[q], with_theirs[q]
            else:
                q, to_j, to_k = len(base), len(ours), len(theirs)
            o, a, b = base[i:q], ours[j:to_j], theirs[k:to_k]
            if a == b:
                result.extend(a)
            elif a == o:
                result.extend(b)
            elif b == o:
                result.extend(a)
            else:
                result.append("<<<<<<< ours")
                result.extend(a)
                result.append("=======")
                result.extend(b)
                result.append(">>>>>>> theirs")
            i, j, k = q, to_j, to_k
        return result

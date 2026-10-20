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

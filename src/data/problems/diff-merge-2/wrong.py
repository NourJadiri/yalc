# Off by one in the grouping: joins two changes only when FEWER than
# 2 * context kept entries separate them. With exactly 2 * context between,
# the two context windows touch, and the hunks should have become one; here
# they come out as two hunks, back to back.


class DiffTool:

    def __init__(self):
        pass                                    # no state: every call stands alone

    def diff(self, a: List[str], b: List[str]) -> List[str]:
        # Trim the shared top, then the shared bottom of what's left.
        # Keeping matching ends never costs a shortest diff anything.
        top = 0
        while top < len(a) and top < len(b) and a[top] == b[top]:
            top += 1
        bottom = 0
        while (bottom < len(a) - top and bottom < len(b) - top
               and a[len(a) - 1 - bottom] == b[len(b) - 1 - bottom]):
            bottom += 1
        x, y = a[top:len(a) - bottom], b[top:len(b) - bottom]
        m, n = len(x), len(y)

        # L[i][j] = LCS length of x[i:] and y[j:]. Suffixes, not prefixes:
        # the walk goes forward and asks how many lines it can still keep.
        L = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m - 1, -1, -1):
            row, below = L[i], L[i + 1]
            for j in range(n - 1, -1, -1):
                if x[i] == y[j]:
                    row[j] = below[j + 1] + 1
                else:
                    row[j] = max(below[j], row[j + 1])

        # Walk the middle from the top; matching lines are always safe to keep.
        out = [" " + line for line in a[:top]]
        i = j = 0
        while i < m or j < n:
            if i < m and j < n and x[i] == y[j]:
                out.append(" " + x[i])
                i += 1
                j += 1
            # Delete x[i] if that keeps as many lines as before; else add y[j].
            elif i < m and L[i + 1][j] == L[i][j]:
                out.append("-" + x[i])
                i += 1
            else:
                out.append("+" + y[j])
                j += 1

        # The shared bottom closes the diff.
        out += [" " + line for line in a[len(a) - bottom:]]
        return out

    def unified(self, a: List[str], b: List[str], context: int) -> List[str]:
        # Take the diff; before[k] counts the lines of a and of b ahead of entry k.
        d = self.diff(a, b)
        before_a, before_b = [0], [0]
        for entry in d:
            before_a.append(before_a[-1] + (entry[0] != "+"))
            before_b.append(before_b[-1] + (entry[0] != "-"))

        # Group the changes: a gap shorter than both windows together joins them.
        groups = []                             # [first change, last change]
        for k, entry in enumerate(d):
            if entry[0] == " ":
                continue
            if groups and k - groups[-1][1] - 1 < 2 * context:
                groups[-1][1] = k
            else:
                groups.append([k, k])

        out = []
        for first, last in groups:
            # Widen by up to `context` entries each side (all kept ones).
            lo = max(0, first - context)
            hi = min(len(d), last + 1 + context)
            # The header: n counts the hunk's lines of each file; s is the
            # first of them, or the line just before the hunk when n is 0.
            n1 = before_a[hi] - before_a[lo]
            n2 = before_b[hi] - before_b[lo]
            s1 = before_a[lo] + (1 if n1 else 0)
            s2 = before_b[lo] + (1 if n2 else 0)
            out.append(f"@@ -{s1},{n1} +{s2},{n2} @@")
            out.extend(d[lo:hi])
        return out

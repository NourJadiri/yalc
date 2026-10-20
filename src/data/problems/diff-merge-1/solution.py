class DiffTool:

    def __init__(self):
        pass                                    # no state: every call stands alone

    def diff(self, a: List[str], b: List[str]) -> List[str]:
        # 1. Trim the shared top, then the shared bottom of what's left.
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

        # 2. L[i][j] = LCS length of x[i:] and y[j:]. Suffixes, not prefixes:
        # the walk goes forward and asks how many lines it can still keep.
        L = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m - 1, -1, -1):
            row, below = L[i], L[i + 1]
            for j in range(n - 1, -1, -1):
                if x[i] == y[j]:
                    row[j] = below[j + 1] + 1
                else:
                    row[j] = max(below[j], row[j + 1])

        # 3. Walk the middle from the top; matching lines are always safe to keep.
        out = [" " + line for line in a[:top]]
        i = j = 0
        while i < m or j < n:
            if i < m and j < n and x[i] == y[j]:
                out.append(" " + x[i])
                i += 1
                j += 1
            # 4. Delete x[i] if that keeps as many lines as before; else add y[j].
            elif i < m and L[i + 1][j] == L[i][j]:
                out.append("-" + x[i])
                i += 1
            else:
                out.append("+" + y[j])
                j += 1

        # 5. The shared bottom closes the diff.
        out += [" " + line for line in a[len(a) - bottom:]]
        return out

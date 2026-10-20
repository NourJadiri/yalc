# Breaks the tie the other way: when deleting and adding would both keep the
# diff shortest, it adds first. Every output is still a valid shortest diff,
# just not the one the rules pick: a replaced line comes out "+new", "-old".


class DiffTool:
    def __init__(self):
        pass

    def diff(self, a, b):
        top = 0
        while top < len(a) and top < len(b) and a[top] == b[top]:
            top += 1
        bottom = 0
        while (bottom < len(a) - top and bottom < len(b) - top
               and a[len(a) - 1 - bottom] == b[len(b) - 1 - bottom]):
            bottom += 1
        x, y = a[top:len(a) - bottom], b[top:len(b) - bottom]
        m, n = len(x), len(y)
        L = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                if x[i] == y[j]:
                    L[i][j] = L[i + 1][j + 1] + 1
                else:
                    L[i][j] = max(L[i + 1][j], L[i][j + 1])
        out = [" " + line for line in a[:top]]
        i = j = 0
        while i < m or j < n:
            if i < m and j < n and x[i] == y[j]:
                out.append(" " + x[i])
                i += 1
                j += 1
            elif j < n and L[i][j + 1] == L[i][j]:     # add first on a tie
                out.append("+" + y[j])
                j += 1
            else:
                out.append("-" + x[i])
                i += 1
        out += [" " + line for line in a[len(a) - bottom:]]
        return out

# Resolves "both sides changed it, differently" by quietly taking ours. Every
# clean merge still comes out right, but a real conflict disappears: theirs'
# edit is lost and nobody is told.


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

        # Group the changes. Each one claims `context` entries on both sides,
        # and two claims touch exactly when at most 2 * context kept entries
        # separate the changes.
        groups = []                             # [first change, last change]
        for k, entry in enumerate(d):
            if entry[0] == " ":
                continue
            if groups and k - groups[-1][1] - 1 <= 2 * context:
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

    def merge(self, base: List[str], ours: List[str], theirs: List[str]) -> List[str]:
        # Diff base against each side. mine[i] / yours[i] is the line of
        # ours / theirs that base[i] is paired with, or -1 if that side dropped it.
        mine, yours = self._partners(base, ours), self._partners(base, theirs)

        out = []
        i = j = k = 0                           # current line of base, ours, theirs
        while i < len(base) or j < len(ours) or k < len(theirs):
            # An anchor lined up with both sides is stable: output it, step all three.
            if i < len(base) and mine[i] == j and yours[i] == k:
                out.append(base[i])
                i, j, k = i + 1, j + 1, k + 1
                continue

            # Otherwise the chunk runs to the next anchor (a base line both
            # sides kept) and its two partners, or to the ends of all three files.
            q = i
            while q < len(base) and (mine[q] < 0 or yours[q] < 0):
                q += 1
            j2, k2 = (mine[q], yours[q]) if q < len(base) else (len(ours), len(theirs))

            # Resolve: the same on both sides, or changed by one side only.
            o, a, b = base[i:q], ours[j:j2], theirs[k:k2]
            if a == b:
                out += a
            elif a == o:
                out += b
            elif b == o:
                out += a
            else:
                out += a                        # both changed it: keep ours

            # Jump to the anchor; the next round outputs it as stable.
            i, j, k = q, j2, k2
        return out

    def _partners(self, a: List[str], b: List[str]) -> List[int]:
        partner = [-1] * len(a)
        i = j = 0                               # lines of a and of b passed so far
        for entry in self.diff(a, b):
            if entry[0] == " ":
                partner[i] = j
            if entry[0] != "+":
                i += 1
            if entry[0] != "-":
                j += 1
        return partner

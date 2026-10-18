class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        # 1. match[i][j]: does the suffix s[i:] match the suffix p[j:]?
        match = [[False] * (n + 1) for _ in range(m + 1)]
        match[m][n] = True                       # empty string, empty pattern
        # 2. Fill the table from the back
        for i in range(m, -1, -1):               # i == m: s is used up
            for j in range(n - 1, -1, -1):
                first = i < m and p[j] in (s[i], ".")
                if j + 1 < n and p[j + 1] == "*":
                    # 3. "x*" either matches nothing (skip both characters), or
                    # matches s[i] and stays available for the rest of s.
                    match[i][j] = match[i][j + 2] or (first and match[i + 1][j])
                else:
                    # 4. No star: match exactly one letter
                    match[i][j] = first and match[i + 1][j + 1]
        # 5. Whole string against whole pattern
        return match[0][0]

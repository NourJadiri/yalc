class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        m, n = len(matrix), len(matrix[0])

        # 1. Longest path from (r, c), cached
        @cache
        def longest(r, c):
            # Length of the longest increasing path that starts at (r, c).
            # Each step goes strictly uphill, so a path can never come back to
            # a cell: the answer doesn't depend on how we got here, which is
            # exactly what makes caching it safe.
            best = 1
            # 2. Step to each larger neighbour
            for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= x < m and 0 <= y < n and matrix[x][y] > matrix[r][c]:
                    best = max(best, 1 + longest(x, y))
            return best

        # 3. Best path over every starting cell
        return max(longest(r, c) for r in range(m) for c in range(n))

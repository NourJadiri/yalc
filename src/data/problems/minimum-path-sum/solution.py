class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        n = len(grid[0])
        # 1. best[c] = cheapest cost of a route ending at column c of the current
        # row. Before a row is processed it still describes the row above.
        best = [math.inf] * n
        best[0] = 0
        # 2. Go row by row
        for row in grid:
            best[0] += row[0]                  # the left column has one way in
            for c in range(1, n):
                # 3. from above (old best[c]) or from the left (new best[c - 1])
                best[c] = row[c] + min(best[c], best[c - 1])
        # 4. The bottom-right cell is the answer
        return best[-1]

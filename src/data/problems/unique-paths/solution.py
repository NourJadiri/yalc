class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        # 1. row[c] = number of routes to column c of the row being filled.
        # The top row is all 1s: the robot can only have come from the left.
        row = [1] * n
        # 2. Fill the remaining rows, left to right
        for _ in range(1, m):
            for c in range(1, n):
                # 3. Before this line row[c] is still the count from the row above;
                # row[c - 1] already holds this row's count to the left.
                row[c] += row[c - 1]
        # 4. The bottom-right cell's count
        return row[-1]

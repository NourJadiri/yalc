class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        # 1. Row 0 is just [1]
        rows = [[1]]
        # 2. Build each next row from the last
        for _ in range(numRows - 1):
            above = rows[-1]
            # 3. Both ends are 1; each number in between is the sum of the two
            # numbers above it.
            middle = [above[j - 1] + above[j] for j in range(1, len(above))]
            rows.append([1] + middle + [1])
        # 4. All numRows rows are built
        return rows

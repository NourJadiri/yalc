class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        m, n = len(heights), len(heights[0])

        def climb(shore):
            # 1. Multi-source BFS run uphill, starting from every cell on one
            # ocean's shore at once. A neighbour joins if it is at least as
            # high: rain on it could flow down into a cell that already drains.
            drains = set(shore)
            queue = deque(shore)
            # 2. Pop a cell, look at its neighbours
            while queue:
                r, c = queue.popleft()
                for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    # 3. Uphill or level neighbours join
                    if (0 <= x < m and 0 <= y < n and (x, y) not in drains
                            and heights[x][y] >= heights[r][c]):
                        drains.add((x, y))
                        queue.append((x, y))
            return drains

        # 4. Run it from each ocean's shore
        pacific = climb([(0, c) for c in range(n)] + [(r, 0) for r in range(1, m)])
        atlantic = climb([(m - 1, c) for c in range(n)] + [(r, n - 1) for r in range(m - 1)])
        # 5. Cells that drain to both oceans
        return [[r, c] for r, c in pacific & atlantic]

class Solution:
    def shortestPathBinaryMatrix(self, grid: List[List[int]]) -> int:
        # 1. Blocked start or goal: return -1
        n = len(grid)
        if grid[0][0] == 1 or grid[n - 1][n - 1] == 1:
            return -1
        # 2. BFS reaches cells in order of path length, so the first time the
        # corner comes off the queue, its length is the shortest possible.
        grid[0][0] = 1                      # visited cells are marked as blocked
        queue = deque([(0, 0, 1)])          # (row, col, cells on the path so far)
        # 3. Pop a cell; stop at the corner
        while queue:
            r, c, length = queue.popleft()
            if r == n - 1 and c == n - 1:
                return length
            # 4. Visit the eight neighbours, marking on push
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    x, y = r + dr, c + dc
                    if 0 <= x < n and 0 <= y < n and grid[x][y] == 0:
                        grid[x][y] = 1      # mark on push: queued at most once
                        queue.append((x, y, length + 1))
        # 5. Queue emptied: no path
        return -1

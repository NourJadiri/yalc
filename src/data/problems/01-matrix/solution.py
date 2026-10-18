class Solution:
    def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:
        # 1. Distance grid, -1 means unreached
        m, n = len(mat), len(mat[0])
        dist = [[-1] * n for _ in range(m)]      # -1: not reached yet
        # 2. Seed the queue with every 0
        queue = deque()
        for r in range(m):
            for c in range(n):
                if mat[r][c] == 0:
                    dist[r][c] = 0
                    queue.append((r, c))
        # 3. Multi-source BFS from every 0 at once. Cells leave the queue in order
        # of distance, so the first time a cell is reached is its answer.
        while queue:
            r, c = queue.popleft()
            for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= x < m and 0 <= y < n and dist[x][y] == -1:
                    dist[x][y] = dist[r][c] + 1
                    queue.append((x, y))
        return dist

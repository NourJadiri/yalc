class Solution:
    def validPath(self, n: int, edges: List[List[int]], source: int, destination: int) -> bool:
        # 1. Adjacency list, both directions
        graph = [[] for _ in range(n)]
        for u, v in edges:
            graph[u].append(v)      # a cable works both ways,
            graph[v].append(u)      # so record it from both ends

        # 2. Start from the source
        seen = {source}
        queue = deque([source])
        while queue:
            # 3. Take the front machine
            node = queue.popleft()
            if node == destination:
                return True
            # 4. Queue each unseen neighbour
            for nxt in graph[node]:
                if nxt not in seen:
                    seen.add(nxt)   # mark when queued, so nothing is queued twice
                    queue.append(nxt)
        # 5. Queue empty: no route
        return False

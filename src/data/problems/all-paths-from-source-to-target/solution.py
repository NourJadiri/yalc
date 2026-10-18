class Solution:
    def allPathsSourceTarget(self, graph: List[List[int]]) -> List[List[int]]:
        # 1. The path starts at node 0
        target = len(graph) - 1
        paths, path = [], [0]

        def dfs(node):
            # 2. At the target, record a copy
            if node == target:
                paths.append(path[:])   # a copy: `path` keeps changing after this
                return
            # 3. Choose, explore, un-choose
            for nxt in graph[node]:
                path.append(nxt)        # choose
                dfs(nxt)                # explore
                path.pop()              # un-choose

        # 4. No visited set: the graph has no cycles, so a path can never return
        # to a node, and different paths are allowed to share nodes.
        dfs(0)
        return paths

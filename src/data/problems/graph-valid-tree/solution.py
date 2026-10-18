class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        # 1. A tree on n nodes has exactly n - 1 edges. With exactly that many,
        # "connected" and "no cycle" imply each other, so union-find only has
        # to confirm that no cable joins two switches that are already linked.
        if len(edges) != n - 1:
            return False
        # 2. Every node starts in its own set
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]    # path halving
                x = parent[x]
            return x

        # 3. Does this cable close a loop?
        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return False                     # this cable closes a loop
            # 4. Different sets: merge them
            parent[ra] = rb
        # 5. No loop, so it is a tree
        return True

class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        # 1. Every city starts as its own group
        n = len(isConnected)
        parent = list(range(n))          # every city starts as its own province

        # 2. find: walk up to the root
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]   # path halving: hop to the grandparent
                x = parent[x]
            return x

        # 3. One province per city, to start
        provinces = n
        # 4. For each road, find both roots
        for i in range(n):
            for j in range(i + 1, n):    # symmetric matrix: the upper triangle is enough
                if isConnected[i][j]:
                    ri, rj = find(i), find(j)
                    # 5. Different roots: merge the provinces
                    if ri != rj:         # a road between two provinces merges them;
                        parent[ri] = rj  # a road inside one changes nothing
                        provinces -= 1
        return provinces

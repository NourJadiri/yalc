class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        # 1. One map from original node to copy
        copies = {}                         # original node -> its copy

        def clone(original):
            # 2. Reuse the copy if it exists
            if original in copies:          # copied already (or in progress): reuse it
                return copies[original]
            # 3. Make the copy and register it
            copy = Node(original.val)
            copies[original] = copy         # register before recursing, so a cycle
            for nb in original.neighbors:   # leading back here finds this copy
                # 4. Link the clone of each neighbour
                copy.neighbors.append(clone(nb))
            return copy

        # 5. Start from the given node
        return clone(node) if node else None

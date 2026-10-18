class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        # 1. The longest bent path seen so far
        best = 0

        # 2. Height of a subtree, by recursion
        def height(node):
            # Returns the height of node's subtree (nodes on its longest
            # downward path) and, on the side, records the longest path that
            # bends at node.
            nonlocal best
            if node is None:
                return 0
            left = height(node.left)
            right = height(node.right)
            # 3. Record the path that bends at this node
            best = max(best, left + right)  # edges: left going down, right going down
            # 4. Hand the parent a path it can extend
            return 1 + max(left, right)     # what the parent can extend upward

        # 5. Run it from the root
        height(root)
        return best

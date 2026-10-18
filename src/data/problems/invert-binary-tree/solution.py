class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        # 1. An empty tree is its own mirror
        if root is None:        # the mirror image of an empty tree is empty
            return None
        # 2. Mirror both subtrees and hang them on the opposite sides. The right
        # side is evaluated in full before either link changes, so both calls
        # see the original children.
        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        # 3. Hand the node back to its parent
        return root

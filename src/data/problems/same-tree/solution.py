class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        # 1. Both empty: the same
        if p is None and q is None:     # two empty trees are identical
            return True
        # 2. One empty: different shapes
        if p is None or q is None:      # a node facing an empty spot
            return False
        # 3. Both are real nodes: the values must match, then both pairs of
        # subtrees. `and` stops at the first difference it finds.
        return (p.val == q.val
                and self.isSameTree(p.left, q.left)
                and self.isSameTree(p.right, q.right))

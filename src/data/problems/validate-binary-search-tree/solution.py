class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def within(node, low, high):
            # 1. Every value in this subtree must lie strictly between low and high:
            # the bounds collect the constraints of every ancestor, not just the parent.
            if node is None:
                return True
            # 2. Outside the bounds: not a BST
            if not low < node.val < high:
                return False
            # 3. Tighten one bound for each child
            return within(node.left, low, node.val) and within(node.right, node.val, high)

        # 4. Infinite bounds, so values at the integer limits need no special case.
        return within(root, -math.inf, math.inf)

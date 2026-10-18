class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        # 1. Running best starts at -inf, not 0
        best = -math.inf

        def gain(node):
            # 2. The best sum of a path that starts at `node` and only goes down.
            nonlocal best
            if node is None:
                return 0
            # 3. Clamp arms at 0, score the bend
            left = max(gain(node.left), 0)      # a branch that loses money is left out
            right = max(gain(node.right), 0)
            best = max(best, node.val + left + right)   # the path that bends here
            # 4. Hand up one arm only
            return node.val + max(left, right)          # going up, only one branch can come along

        # 5. The answer is best, not gain(root)
        gain(root)
        return best

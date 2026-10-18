class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:
        def best(node):
            # 1. (best total in this subtree if node is robbed, best if it isn't)
            if node is None:
                return 0, 0
            # 2. Get both children's pairs first
            left_take, left_skip = best(node.left)
            right_take, right_skip = best(node.right)
            # 3. Robbed: its value plus the children's skips
            take = node.val + left_skip + right_skip                    # children must be left alone
            # 4. Skipped: each child takes its better total
            skip = max(left_take, left_skip) + max(right_take, right_skip)  # each child chooses freely
            # 5. Hand the pair up
            return take, skip

        return max(best(root))

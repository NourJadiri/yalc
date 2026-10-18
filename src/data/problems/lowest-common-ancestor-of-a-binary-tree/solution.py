class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        # 1. Reports up what this subtree holds: p or q if it holds just one of
        # them, their LCA if it holds both, None if it holds neither.
        if root is None or root is p or root is q:
            return root
        # 2. Ask both children
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        # 3. A target on each side: split here
        if left and right:      # one on each side: the paths split right here
            return root
        # 4. Otherwise pass up whichever side found one
        return left or right    # both on one side, already resolved below; or neither

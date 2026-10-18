class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> List[List[int]]:
        # 1. Shared path and answer list
        paths, path = [], []

        def dfs(node, remaining):
            path.append(node.val)                   # choose
            remaining -= node.val
            # 2. At a leaf, record a matching path
            if node.left is None and node.right is None:
                if remaining == 0:                  # only a leaf can end a path
                    paths.append(path[:])           # a copy: `path` keeps changing
            else:
                # 3. No early exit when `remaining` drops below zero: values can
                # be negative, so a later node can bring the sum back.
                if node.left:
                    dfs(node.left, remaining)       # explore
                if node.right:
                    dfs(node.right, remaining)
            # 4. Pop the node on the way out
            path.pop()                              # un-choose

        # 5. Start at the root unless empty
        if root:
            dfs(root, targetSum)
        return paths

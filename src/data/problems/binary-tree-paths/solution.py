class Solution:
    def binaryTreePaths(self, root: Optional[TreeNode]) -> List[str]:
        # 1. Answers, plus one shared path list
        paths, path = [], []

        def dfs(node):
            # 2. Push this node's value
            path.append(str(node.val))              # choose this node
            # 3. A node with no children is a leaf
            if node.left is None and node.right is None:
                paths.append("->".join(path))       # a leaf ends one path
            else:
                # 4. Recurse into each child that exists
                if node.left:
                    dfs(node.left)                  # explore each child that exists
                if node.right:
                    dfs(node.right)
            # 5. Pop it on the way back up
            path.pop()                              # un-choose on the way back up

        dfs(root)
        return paths

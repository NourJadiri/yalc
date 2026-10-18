class Solution:
    def delNodes(self, root: Optional[TreeNode], to_delete: List[int]) -> List[TreeNode]:
        # 1. A set makes each lookup cheap
        doomed = set(to_delete)
        forest = []

        def visit(node, parent_gone):
            # 2. Returns what the parent should keep as this child: the node
            # itself, or None when it's deleted. Storing that None cuts the link.
            if node is None:
                return None
            # 3. Is this node a new root?
            gone = node.val in doomed
            if parent_gone and not gone:
                forest.append(node)          # nothing above it survives: a new root
            # 4. Recurse, storing what comes back
            node.left = visit(node.left, gone)
            node.right = visit(node.right, gone)
            # 5. Tell the parent what to keep
            return None if gone else node

        # 6. Start at the root
        visit(root, True)                    # the root has no parent, so it starts a tree
        return forest

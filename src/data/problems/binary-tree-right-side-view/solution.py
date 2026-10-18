class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        # 1. Begin with the root's level
        view = []
        level = [root] if root else []
        while level:
            # 2. Record the level's last node
            view.append(level[-1].val)      # the last node of a level is the one you see
            # 3. The next level, still left to right.
            level = [child for node in level for child in (node.left, node.right) if child]
        return view

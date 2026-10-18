class Solution:
    def averageOfLevels(self, root: Optional[TreeNode]) -> List[float]:
        # 1. The root starts the queue
        averages = []
        queue = deque([root])
        while queue:
            # 2. Right now the queue holds exactly one level: none of these
            # nodes' children have been added yet.
            count = len(queue)
            # 3. Take exactly that many nodes, summing their values
            total = 0
            for _ in range(count):
                node = queue.popleft()
                total += node.val
                if node.left:
                    queue.append(node.left)     # next level, waits its turn
                if node.right:
                    queue.append(node.right)
            # 4. True division: the level's average
            averages.append(total / count)
        return averages

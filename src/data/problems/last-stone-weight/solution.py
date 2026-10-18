class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        # 1. heapq is a min-heap, so store every weight negated: the heaviest
        # stone becomes the smallest number and comes out first.
        heap = [-w for w in stones]
        heapq.heapify(heap)
        # 2. Smash the two heaviest while two remain
        while len(heap) > 1:
            y = -heapq.heappop(heap)    # the heaviest stone
            x = -heapq.heappop(heap)    # the next heaviest, x <= y
            # 3. Put the leftover back
            if y > x:
                heapq.heappush(heap, -(y - x))
        # 4. The last stone, or 0
        return -heap[0] if heap else 0

class Solution:
    def maxArea(self, height: List[int]) -> int:
        # 1. Pointers at both ends
        i, j = 0, len(height) - 1
        best = 0
        while i < j:
            # 2. The shorter wall caps the water. Any other container using it
            # would be narrower and no taller, so it can be dropped for good.
            if height[i] < height[j]:
                best = max(best, height[i] * (j - i))
                i += 1
            else:
                best = max(best, height[j] * (j - i))
                j -= 1
        # 3. The best area seen
        return best

class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        # 1. Sum the first window
        window = sum(nums[:k])                 # the first window
        best = window                          # not 0: every sum might be negative
        # 2. Slide: add the new, drop the old
        for i in range(k, len(nums)):
            window += nums[i] - nums[i - k]    # nums[i] slides in, nums[i - k] slides out
            # 3. Keep the best sum so far
            best = max(best, window)
        # 4. Average of the best window
        return best / k                        # divide once, at the end

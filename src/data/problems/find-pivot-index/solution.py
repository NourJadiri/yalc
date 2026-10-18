class Solution:
    def pivotIndex(self, nums: List[int]) -> int:
        # 1. Total of the whole list
        total = sum(nums)
        # 2. Left sum starts empty
        left = 0                               # sum of nums[:i]
        for i, x in enumerate(nums):
            # 3. left + x + right == total, so the right side is total - left - x.
            if left == total - left - x:
                return i                       # the first hit is the leftmost pivot
            # 4. Then add x to the left sum
            left += x                          # only now does nums[i] join the left side
        return -1

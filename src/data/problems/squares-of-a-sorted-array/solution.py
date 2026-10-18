class Solution:
    def sortedSquares(self, nums: List[int]) -> List[int]:
        # 1. Result array and a pointer at each end
        result = [0] * len(nums)
        lo, hi = 0, len(nums) - 1
        # 2. The biggest square still unplaced always sits at one of the two ends,
        # so fill the answer from the back.
        for write in range(len(nums) - 1, -1, -1):
            # 3. Take the end with the bigger absolute value
            if abs(nums[lo]) > abs(nums[hi]):
                result[write] = nums[lo] * nums[lo]
                lo += 1
            else:
                result[write] = nums[hi] * nums[hi]
                hi -= 1
        # 4. Every slot filled
        return result

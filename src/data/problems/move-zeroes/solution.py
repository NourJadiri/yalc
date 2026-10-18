class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        # 1. Invariant: nums[:write] holds the non-zero values met so far, in their
        # original order, and nums[write:read] holds only zeros.
        write = 0
        # 2. Read every index; swap non-zeros forward
        for read in range(len(nums)):
            if nums[read] != 0:
                nums[write], nums[read] = nums[read], nums[write]
                # 3. Advance the write slot
                write += 1

class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        # 1. Start with the whole index range
        lo, hi = 0, len(nums) - 1
        # 2. Invariant: everything left of lo is smaller than target, and
        # everything right of hi is bigger.
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            # 3. Move lo or hi past mid
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        # 4. The loop ends with lo == hi + 1: everything before lo is smaller and
        # everything from lo on is bigger, so lo is exactly where target belongs.
        return lo

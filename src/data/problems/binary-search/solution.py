class Solution:
    def search(self, nums: List[int], target: int) -> int:
        # 1. Whole list, both ends included
        lo, hi = 0, len(nums) - 1       # if target is anywhere, it's in nums[lo..hi]
        # 2. Probe the middle element
        while lo <= hi:                 # the range still holds at least one element
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            # 3. Discard the half that can't hold it
            if nums[mid] < target:
                lo = mid + 1            # mid and everything to its left are too small
            else:
                hi = mid - 1            # mid and everything to its right are too big
        # 4. Empty range means not found
        return -1                       # the range is empty: target isn't there

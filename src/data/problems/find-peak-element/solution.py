class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        # 1. Invariant: [lo, hi] is entered by a rising step (or lo == 0) and left
        # by a falling step (or hi is the last index), so it contains a peak.
        lo, hi = 0, len(nums) - 1
        # 2. Compare mid with its right neighbour
        while lo < hi:
            mid = (lo + hi) // 2         # mid < hi, so nums[mid + 1] exists
            if nums[mid] < nums[mid + 1]:
                # 3. Rising: keep the right half
                lo = mid + 1             # rising at mid: a peak lies to the right
            else:
                # 4. Falling: keep mid and the left
                hi = mid                 # falling at mid: mid or something left of it
        # 5. One index left: it is a peak
        return lo

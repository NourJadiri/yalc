class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def lower(x):
            # 1. First index whose value is >= x, or len(nums) if there is none.
            # The answer always lies in [lo, hi]; hi starts past the end.
            lo, hi = 0, len(nums)
            # 2. Halve [lo, hi] until lo meets hi
            while lo < hi:
                mid = (lo + hi) // 2
                if nums[mid] < x:
                    lo = mid + 1      # mid and everything left of it are too small
                else:
                    hi = mid          # mid qualifies; the first one is here or left
            return lo

        # 3. The run's first index, if target is there
        first = lower(target)
        if first == len(nums) or nums[first] != target:
            return [-1, -1]
        # 4. The run of target ends just before the first value >= target + 1.
        return [first, lower(target + 1) - 1]

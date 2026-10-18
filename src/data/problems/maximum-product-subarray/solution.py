class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        # 1. hi / lo: the largest and smallest product of a subarray that ends at
        # the current element. A negative x turns the smallest into the largest,
        # so both are needed.
        hi = lo = best = nums[0]
        for x in nums[1:]:
            # 2. Three ways to end at x
            candidates = (x, hi * x, lo * x)    # start fresh, or extend either one
            # 3. New extremes, from the old pair
            hi, lo = max(candidates), min(candidates)   # both from the *old* pair
            # 4. Keep the best product seen
            best = max(best, hi)
        return best

class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        # 1. The full range is 0 to n
        n = len(nums)
        # 2. 0 + 1 + ... + n is what a complete list would add up to; whatever
        # the real list falls short by is the number that isn't there.
        # 3. Subtract what the list really adds up to
        return n * (n + 1) // 2 - sum(nums)

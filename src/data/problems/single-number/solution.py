class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        # 1. Start from zero
        result = 0
        # 2. XOR everything: pairs cancel
        for x in nums:
            result ^= x     # x ^ x == 0 and x ^ 0 == x, so every pair cancels
        # 3. Only the unpaired number is left
        return result       # ...and only the single number is left

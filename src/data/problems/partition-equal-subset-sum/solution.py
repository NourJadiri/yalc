class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        # 1. An odd total can't split
        total = sum(nums)
        if total % 2:
            return False                  # an odd total can't split evenly
        target = total // 2
        # 2. can[s]: some subset of the numbers seen so far adds up to s.
        can = [True] + [False] * target
        for x in nums:
            # 3. Sweep downward, so can[s - x] still describes subsets made
            # *before* x arrived: each number is used at most once.
            for s in range(target, x - 1, -1):
                if can[s - x]:
                    can[s] = True
            # 4. Stop as soon as the target is reachable
            if can[target]:
                return True
        return can[target]

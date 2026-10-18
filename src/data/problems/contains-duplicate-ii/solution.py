class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        # 1. Remember each value's latest index
        last = {}                              # value -> the latest index it appeared at
        for i, x in enumerate(nums):
            # 2. Is an earlier copy close enough?
            if x in last and i - last[x] <= k:
                return True
            # 3. The newest copy is the closest one for anything still to come.
            last[x] = i
        # 4. No close pair anywhere
        return False

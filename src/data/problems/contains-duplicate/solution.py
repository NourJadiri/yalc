class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        # 1. Everything we've walked past so far. A set answers "seen it?"
        # in O(1) on average, which is what makes one pass enough.
        seen = set()
        # 2. Walk the numbers, checking the set
        for x in nums:
            if x in seen:
                return True
            # 3. Remember it for later numbers
            seen.add(x)
        # 4. No repeat found
        return False

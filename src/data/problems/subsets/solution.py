class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        # 1. Answers so far, and the current path
        out, path = [], []

        def backtrack(start):
            # 2. Record a copy: every node is a subset
            out.append(path[:])             # every node of the search tree is a subset
            # 3. Choose, explore, un-choose
            for i in range(start, len(nums)):
                path.append(nums[i])        # choose nums[i]
                backtrack(i + 1)            # explore: only later elements may follow
                path.pop()                  # un-choose

        # 4. Start from 0 and return out
        backtrack(0)
        return out

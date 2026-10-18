class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        # 1. The path so far, plus used flags
        out, path = [], []
        used = [False] * len(nums)

        def backtrack():
            # 2. Every slot filled: record a copy
            if len(path) == len(nums):
                out.append(path[:])
                return
            # 3. Try each element not yet used
            for i, x in enumerate(nums):
                if used[i]:
                    continue                # already placed in an earlier slot
                # 4. Choose, explore, un-choose
                used[i] = True              # choose x for the next slot
                path.append(x)
                backtrack()                 # explore
                path.pop()                  # un-choose: undo both changes,
                used[i] = False             # so x is free for the next branch

        # 5. Start with an empty path
        backtrack()
        return out

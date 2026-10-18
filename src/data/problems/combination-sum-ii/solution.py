class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        # 1. Sort so equal values are adjacent
        candidates = sorted(candidates)
        out, path = [], []

        def backtrack(start, remaining):
            # 2. Target reached: record a copy
            if remaining == 0:
                out.append(path[:])
                return
            # 3. Try each candidate, skipping repeats
            for i in range(start, len(candidates)):
                c = candidates[i]
                if i > start and c == candidates[i - 1]:
                    continue        # this value already had its turn in this slot
                # 4. Stop at the first too-big value
                if c > remaining:
                    break           # sorted: every later candidate is too big as well
                # 5. Choose, explore, un-choose
                path.append(c)                      # choose
                backtrack(i + 1, remaining - c)     # explore; entry i is used up
                path.pop()                          # un-choose

        backtrack(0, target)
        return out

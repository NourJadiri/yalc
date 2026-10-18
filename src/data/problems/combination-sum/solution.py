class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        # 1. Sort, so one big candidate ends the loop
        candidates = sorted(candidates)
        out, path = [], []

        def backtrack(start, remaining):
            # 2. Nothing left to make: record a copy
            if remaining == 0:
                out.append(path[:])
                return
            # 3. Only candidates[start:] may come next, so every combination is
            # built in non-decreasing order: once, never as a reordering.
            for i in range(start, len(candidates)):
                c = candidates[i]
                # 4. Prune: too big for what's left
                if c > remaining:
                    break                       # sorted: the rest are bigger still
                # 5. Choose, explore from the same i, un-choose
                path.append(c)                  # choose
                backtrack(i, remaining - c)     # explore from i: c may be used again
                path.pop()                      # un-choose

        # 6. Start with the whole target to make
        backtrack(0, target)
        return out

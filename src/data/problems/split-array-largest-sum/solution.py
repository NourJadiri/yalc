class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:
        def pieces_needed(cap):
            # 1. Greedy: grow the current piece until the next number would push
            # it past cap, then start a new piece with that number.
            count, cur = 1, 0
            for x in nums:
                if cur + x > cap:
                    count += 1
                    cur = 0
                cur += x
            return count

        # 2. Some piece holds the largest number, and no piece can exceed the
        # total, so the answer lies in [max(nums), sum(nums)]. Fewer than k
        # pieces is as good as k: split a piece further and no sum grows.
        lo, hi = max(nums), sum(nums)
        # 3. Binary search the cap
        while lo < hi:
            cap = (lo + hi) // 2
            if pieces_needed(cap) <= k:
                hi = cap        # cap is achievable: the answer is cap or lower
            else:
                lo = cap + 1    # cap is too tight
        # 4. The smallest cap that works
        return lo

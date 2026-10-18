class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        # 1. hours(k) never increases as k grows, so the speeds that work are
        # exactly [answer, max(piles)]. Binary search for where that range starts.
        lo, hi = 1, max(piles)       # at speed max(piles) each pile takes one hour, and len(piles) <= h
        # 2. Try the middle speed
        while lo < hi:
            k = (lo + hi) // 2
            # 3. Hours needed at speed k
            hours = sum((p + k - 1) // k for p in piles)   # ceil(p / k), in integers
            # 4. Keep the half that holds the answer
            if hours <= h:
                hi = k               # k works: the answer is k or slower
            else:
                lo = k + 1           # k is too slow
        # 5. The pointers meet on the answer
        return lo

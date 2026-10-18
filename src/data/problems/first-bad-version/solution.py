# The isBadVersion API is already defined for you.
# def isBadVersion(version: int) -> bool:

class Solution:
    def firstBadVersion(self, n: int) -> int:
        # 1. Search every version, 1 to n
        lo, hi = 1, n
        # 2. Invariant: every version before lo is good, every version after hi is bad.
        while lo <= hi:
            mid = (lo + hi) // 2
            # 3. Rule out half the range
            if isBadVersion(mid):
                hi = mid - 1    # mid is bad, so the first bad version is mid or earlier
            else:
                lo = mid + 1    # mid is good, so the first bad version is later
        # 4. lo == hi + 1: lo - 1 is good (or lo is 1) and lo is bad.
        return lo

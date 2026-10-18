class Solution:
    def longestPalindrome(self, s: str) -> str:
        def expand(lo, hi):
            # 1. Grow outwards while the ends match. The loop overshoots by one
            # on each side, so the palindrome is s[lo + 1:hi].
            while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
                lo -= 1
                hi += 1
            return lo + 1, hi

        # 2. Longest so far: the first character
        best = (0, 1)
        for i in range(len(s)):
            # 3. Centre on character i (odd length) and on the gap after it (even).
            for lo, hi in (expand(i, i), expand(i, i + 1)):
                # 4. Keep the longer one
                if hi - lo > best[1] - best[0]:
                    best = (lo, hi)
        # 5. Cut the winner out of s
        return s[best[0]:best[1]]

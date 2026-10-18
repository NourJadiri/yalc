class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        # 1. Pointer into s: the next letter to match
        i = 0   # s[:i] is matched so far; s[i] is the letter we're looking for
        # 2. Walk through t once
        for ch in t:
            # 3. Take the first chance to match s[i]: an earlier match leaves more
            # of t for the letters still to come.
            if i < len(s) and ch == s[i]:
                i += 1
        # 4. Every letter of s matched?
        return i == len(s)

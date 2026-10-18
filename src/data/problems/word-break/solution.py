class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        # 1. Words in a set, distinct lengths sorted
        words = set(wordDict)
        lengths = sorted({len(w) for w in words})
        n = len(s)
        # 2. dp[i]: the first i characters of s split cleanly into words.
        # The empty prefix needs no words, so dp[0] is True.
        dp = [True] + [False] * n
        # 3. For each i, try the word lengths
        for i in range(1, n + 1):
            # Some word must end exactly at i; try only the lengths that exist.
            for size in lengths:
                if size > i:
                    break
                # 4. Set dp[i] when a word fits there
                if dp[i - size] and s[i - size:i] in words:
                    dp[i] = True
                    break
        # 5. The answer is dp[n]
        return dp[n]

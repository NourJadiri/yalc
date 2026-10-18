class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        # 1. dp[a] = fewest coins that make exactly a. Every coin is worth at
        # least 1, so no answer uses more than `amount` coins: amount + 1
        # safely means "can't be made".
        impossible = amount + 1
        dp = [0] + [impossible] * amount
        # 2. Fill amounts upward, trying every coin
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a:
                    # 3. Is c a better last coin?
                    dp[a] = min(dp[a], dp[a - c] + 1)   # last coin is c
        # 4. Turn "can't be made" into -1
        return dp[amount] if dp[amount] != impossible else -1

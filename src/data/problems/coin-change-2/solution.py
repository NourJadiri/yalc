class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        # 1. ways[a] = how many combinations of the coins handled so far sum to a.
        # Coins sit in the OUTER loop: every combination is then assembled in
        # one fixed coin order, so it is counted exactly once.
        ways = [1] + [0] * amount          # one way to make 0: take nothing
        # 2. Coins go in the outer loop
        for coin in coins:
            # 3. Ascending a: ways[a - coin] already includes this coin, so the
            # coin can be used again (unlimited supply).
            for a in range(coin, amount + 1):
                ways[a] += ways[a - coin]
        # 4. The answer is ways[amount]
        return ways[amount]

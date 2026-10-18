class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # 1. Cheapest price and best profit so far
        lowest = prices[0]   # the cheapest price so far: the best day to have bought
        best = 0             # not trading is always allowed
        # 2. Walk once, lowering the low
        for price in prices:
            lowest = min(lowest, price)
            # 3. Score today as the sell day
            best = max(best, price - lowest)   # sell today, having bought at the low
        return best

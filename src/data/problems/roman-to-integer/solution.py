class Solution:
    def romanToInt(self, s: str) -> int:
        # 1. Symbol values, and a running total
        value = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
        total = 0
        # 2. Look up each symbol's value
        for i, ch in enumerate(s):
            v = value[ch]
            # 3. A symbol smaller than the one after it is the first half of a
            # subtractive pair (IV, XC, CM, ...), so it counts as negative.
            if i + 1 < len(s) and v < value[s[i + 1]]:
                total -= v
            else:
                total += v
        # 4. The signed sum is the answer
        return total

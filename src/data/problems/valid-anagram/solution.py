class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        # 1. Different lengths can't be anagrams
        if len(s) != len(t):
            return False
        # 2. Count the letters of s
        count = {}
        for ch in s:                    # how many of each letter s has
            count[ch] = count.get(ch, 0) + 1
        # 3. Spend those counts with t
        for ch in t:                    # t spends them
            if count.get(ch, 0) == 0:   # t needs a letter s has run out of
                return False
            count[ch] -= 1
        # 4. Equal lengths and t never overspent, so every count is back at 0.
        return True

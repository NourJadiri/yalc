class Solution:
    def firstUniqChar(self, s: str) -> int:
        # 1. Count every letter
        count = Counter(s)              # pass 1: how often each letter appears
        # 2. Rescan in string order
        for i, ch in enumerate(s):      # pass 2: in string order, not alphabetical
            # 3. First count of 1 wins; else -1
            if count[ch] == 1:
                return i
        return -1

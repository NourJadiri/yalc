class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        # 1. The first string is the guide
        first = strs[0]
        # 2. Walk the guide column by column
        for i, ch in enumerate(first):          # column i, read top to bottom
            # 3. Compare every other string here
            for s in strs[1:]:
                if i == len(s) or s[i] != ch:   # s ran out, or disagrees here
                    return first[:i]
        # 4. No column failed
        return first                            # every column of `first` matched

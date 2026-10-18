class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        # 1. Setup: shorter text2 and a zero row
        if len(text1) < len(text2):
            text1, text2 = text2, text1          # keep the rows short
        # prev[j] = LCS of the prefix of text1 processed so far and text2[:j].
        prev = [0] * (len(text2) + 1)
        # 2. New row per letter of text1
        for a in text1:
            cur = [0] * (len(text2) + 1)
            for j, b in enumerate(text2, 1):
                # 3. Letters match: diagonal plus 1
                if a == b:
                    cur[j] = prev[j - 1] + 1           # both last letters join the LCS
                # 4. No match: best of up and left
                else:
                    cur[j] = max(prev[j], cur[j - 1])  # drop one last letter or the other
            # 5. Roll the row; answer is prev[-1]
            prev = cur
        return prev[-1]

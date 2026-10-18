class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        # 1. d[i][j] = fewest edits turning word1[:i] into word2[:j]. Row i reads
        # only row i - 1 and itself, so keep just the previous row.
        m, n = len(word1), len(word2)
        # 2. Base row: j inserts build word2[:j]
        prev = list(range(n + 1))              # row 0: build word2[:j] from "" with j inserts
        # 3. Fill row by row
        for i in range(1, m + 1):
            cur = [i] + [0] * n                # column 0: delete all i characters
            for j in range(1, n + 1):
                # 4. Match: copy diagonal; else cheapest edit
                if word1[i - 1] == word2[j - 1]:
                    cur[j] = prev[j - 1]       # last characters agree: nothing to fix
                else:
                    cur[j] = 1 + min(prev[j - 1],   # replace word1[i-1] with word2[j-1]
                                     prev[j],       # delete word1[i-1]
                                     cur[j - 1])    # insert word2[j-1]
            # 5. This row becomes the previous row
            prev = cur
        return prev[n]

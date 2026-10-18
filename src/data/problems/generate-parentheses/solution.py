class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        # 1. A shared path and the answers
        out, path = [], []

        def backtrack(opened, closed):
            # 2. Complete: record the string
            if closed == n:                     # then opened == n too: complete
                out.append("".join(path))
                return
            # 3. Add ( while openers remain
            if opened < n:                      # an opener is still available
                path.append("(")                # choose
                backtrack(opened + 1, closed)   # explore
                path.pop()                      # un-choose
            # 4. Add ) while one is unmatched
            if closed < opened:                 # there's an open "(" to match
                path.append(")")
                backtrack(opened, closed + 1)
                path.pop()

        # 5. Start with nothing opened
        backtrack(0, 0)
        return out

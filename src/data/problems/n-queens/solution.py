class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        # 1. Queens by row, and the lines they attack
        boards = []
        queens = []                      # queens[r] = column of the queen in row r
        cols, diag, anti = set(), set(), set()

        def place(r):
            # 2. Every row has a queen: record the board
            if r == n:
                boards.append(["." * c + "Q" + "." * (n - 1 - c) for c in queens])
                return
            for c in range(n):
                # 3. A square is attacked through its column, its "\" diagonal
                # (constant r - c) or its "/" diagonal (constant r + c).
                if c in cols or r - c in diag or r + c in anti:
                    continue                            # prune
                # 4. Choose, explore, un-choose
                queens.append(c)                        # choose
                cols.add(c)
                diag.add(r - c)
                anti.add(r + c)
                place(r + 1)                            # explore the next row
                queens.pop()                            # un-choose
                cols.remove(c)
                diag.remove(r - c)
                anti.remove(r + c)

        # 5. Start at the top row
        place(0)
        return boards

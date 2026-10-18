class Solution:
    def climbStairs(self, n: int) -> int:
        # 1. ways(k) = ways(k - 1) + ways(k - 2): the last move onto step k was
        # either a 1-step from k - 1 or a 2-step from k - 2.
        # Base cases: ways(0) = 1 (the empty climb) and ways(1) = 1.
        # Each answer needs only the two before it, so keep just those two.
        two_back, one_back = 1, 1           # ways(k - 2), ways(k - 1), for k = 2
        # 2. Slide the pair up to step n
        for _ in range(2, n + 1):
            two_back, one_back = one_back, one_back + two_back
        # 3. one_back now holds ways(n)
        return one_back

class Solution:
    def countBits(self, n: int) -> List[int]:
        # 1. One answer per number, base case 0
        ans = [0] * (n + 1)
        # 2. Fill upward, smaller numbers first
        for i in range(1, n + 1):
            # 3. i >> 1 is i with its last bit dropped: a smaller number, already
            # counted. Add the dropped bit back: i & 1 (the parentheses matter,
            # since + binds tighter than &).
            ans[i] = ans[i >> 1] + (i & 1)
        return ans

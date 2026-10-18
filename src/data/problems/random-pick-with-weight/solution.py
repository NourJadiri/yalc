class Solution:

    def __init__(self, w: List[int]):
        # 1. prefix[i] = w[0] + ... + w[i]. Index i owns the integers
        # prefix[i-1] + 1 .. prefix[i] — exactly w[i] of them.
        self.prefix = list(accumulate(w))

    def pickIndex(self) -> int:
        # 2. Roll an integer in 1..total
        target = random.randint(1, self.prefix[-1])
        # 3. The owner of `target` is the first index whose prefix sum reaches it.
        return bisect_left(self.prefix, target)

class Solution:
    def isHappy(self, n: int) -> bool:
        # 1. step(x) is the next node
        def step(x: int) -> int:
            total = 0
            while x:
                x, digit = divmod(x, 10)
                total += digit * digit
            return total

        # 2. Each number points to the next, like nodes in a linked list. The chain
        # either reaches 1 (which points to itself) or runs into a loop. Floyd's
        # trick: a runner taking two steps per turn reaches 1 first, or laps the
        # one-step runner inside the loop.
        slow, fast = n, step(n)
        # 3. Slow takes one step, fast takes two
        while fast != 1 and slow != fast:
            slow = step(slow)
            fast = step(step(fast))
        # 4. Happy only if the chain hit 1
        return fast == 1

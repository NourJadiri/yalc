class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        # 1. dq holds indices whose values strictly decrease from front to back.
        # The front is the current window's maximum; each index behind it is
        # the maximum-in-waiting for when everything ahead of it has left.
        dq = deque()
        out = []
        for i, x in enumerate(nums):
            # 2. Expire the front once it leaves the window
            if dq and dq[0] <= i - k:       # the front just slid out of the window
                dq.popleft()
            # 3. Drop everything at the back that x dominates
            while dq and nums[dq[-1]] <= x:
                dq.pop()                    # x is newer and at least as big: they can never be a maximum again
            # 4. The newest index goes at the back
            dq.append(i)
            # 5. Full window: its maximum is at the front
            if i >= k - 1:                  # the first full window ends at index k - 1
                out.append(nums[dq[0]])
        return out

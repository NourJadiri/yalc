from collections import deque


class RecentCounter:

    def __init__(self):
        # 1. A deque of the recent request times
        self.window = deque()   # times of the requests still in the window, oldest first

    def ping(self, t: int) -> int:
        # 2. Append this request at the back
        self.window.append(t)
        # 3. Times only grow, so a request that is too old now stays too old for
        # every later ping: drop it from the front for good.
        while self.window[0] < t - 3000:
            self.window.popleft()
        # 4. Count what is left in the window
        return len(self.window)

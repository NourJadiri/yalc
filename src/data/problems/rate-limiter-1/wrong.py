# Whole tokens only: each call adds (t - last) // interval tokens and moves
# `last` to t, so the part of an interval that has already passed is thrown
# away. Requests 1.5 intervals apart lose half a token every time.


class RateLimiter:
    def __init__(self, capacity, interval):
        self.capacity = capacity
        self.interval = interval
        self.tokens = {}
        self.last = {}

    def allow(self, client, t):
        if client not in self.tokens:
            self.tokens[client] = self.capacity
            self.last[client] = t
        gained = (t - self.last[client]) // self.interval
        self.tokens[client] = min(self.capacity, self.tokens[client] + gained)
        self.last[client] = t
        if self.tokens[client] >= 1:
            self.tokens[client] -= 1
            return True
        return False

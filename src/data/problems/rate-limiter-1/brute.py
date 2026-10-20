# Follows the rules word for word, with exact fractions: d milliseconds add
# d / interval tokens, the bucket never holds more than capacity, and a
# request needs one whole token.
from fractions import Fraction


class RateLimiter:
    def __init__(self, capacity, interval):
        self.capacity = Fraction(capacity)
        self.interval = interval
        self.buckets = {}                       # client -> [tokens, time of last update]

    def allow(self, client, t):
        if client not in self.buckets:
            self.buckets[client] = [self.capacity, t]
        tokens, then = self.buckets[client]
        tokens = min(self.capacity, tokens + Fraction(t - then, self.interval))
        passed = tokens >= 1
        if passed:
            tokens -= 1
        self.buckets[client] = [tokens, t]
        return passed

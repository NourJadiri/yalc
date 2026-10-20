# Follows the rules word for word, with exact fractions: per client, one bucket
# per limit; d milliseconds add d / interval tokens to a bucket, never past its
# capacity; a request needs `cost` whole tokens in every bucket, or takes none.
from fractions import Fraction


class RateLimiter:
    def __init__(self, capacity, interval):
        self.limits = [(capacity, interval)]
        self.buckets = {}                       # client -> [tokens per limit, time of last update]

    def add_limit(self, capacity, interval):
        self.limits.append((capacity, interval))

    def allow(self, client, t, cost=1):
        if client not in self.buckets:
            self.buckets[client] = [[Fraction(c) for c, _ in self.limits], t]
        tokens, then = self.buckets[client]
        for k, (capacity, interval) in enumerate(self.limits):
            tokens[k] = min(Fraction(capacity), tokens[k] + Fraction(t - then, interval))
        self.buckets[client][1] = t
        for k in range(len(self.limits)):
            if tokens[k] < cost:
                return False
        for k in range(len(self.limits)):
            tokens[k] -= cost
        return True

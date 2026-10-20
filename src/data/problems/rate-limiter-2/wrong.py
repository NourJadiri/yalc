# Charges as it checks: walks the limits in order, taking `cost` from each one
# that can pay, and stops at the first that can't. The refusal is right, but
# the limits before the short one have already paid for a request that never
# went through.


class RateLimiter:
    def __init__(self, capacity, interval):
        self.limits = [(capacity * interval, interval)]
        self.level = {}
        self.last = {}

    def add_limit(self, capacity, interval):
        self.limits.append((capacity * interval, interval))

    def allow(self, client, t, cost=1):
        if client not in self.level:
            self.level[client] = [full for full, _ in self.limits]
            self.last[client] = t
        elapsed = t - self.last[client]
        self.last[client] = t
        levels = self.level[client]
        for k, (full, interval) in enumerate(self.limits):
            levels[k] = min(full, levels[k] + elapsed)
        for k, (full, interval) in enumerate(self.limits):
            if levels[k] < cost * interval:
                return False
            levels[k] -= cost * interval
        return True

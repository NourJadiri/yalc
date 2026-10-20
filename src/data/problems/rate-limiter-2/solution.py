class RateLimiter:

    def __init__(self, capacity: int, interval: int):
        # Count credit in whole milliseconds: one token of a limit is its `interval` ms of credit.
        self.limits = []                        # (full, interval) per limit; full = capacity * interval
        self.level = {}                         # client -> credit in ms, one entry per limit
        self.last = {}                          # client -> when its levels were last brought up to date
        self.add_limit(capacity, interval)

    def add_limit(self, capacity: int, interval: int) -> None:
        # 1. Every limit is one more bucket per client. Only called before the first request.
        self.limits.append((capacity * interval, interval))

    def allow(self, client: str, t: int, cost: int = 1) -> bool:
        # A client's buckets are created full at its first request.
        if client not in self.level:
            self.level[client] = [full for full, _ in self.limits]
            self.last[client] = t
        # 2. Refill every bucket by the elapsed time, each up to its own full level.
        levels = self.level[client]
        elapsed = t - self.last[client]
        self.last[client] = t
        for k, (full, _) in enumerate(self.limits):
            levels[k] = min(full, levels[k] + elapsed)
        # 3. Check every limit before charging any, so a refusal takes nothing anywhere.
        for (_, interval), level in zip(self.limits, levels):
            if level < cost * interval:
                return False
        # 4. Charge the cost to every limit.
        for k, (_, interval) in enumerate(self.limits):
            levels[k] -= cost * interval
        return True

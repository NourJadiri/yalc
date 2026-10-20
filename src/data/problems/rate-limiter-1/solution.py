class RateLimiter:

    def __init__(self, capacity: int, interval: int):
        # 1. Count credit in whole milliseconds: one token is `interval` ms of credit.
        self.interval = interval
        self.full = capacity * interval         # a full bucket
        self.level = {}                         # client -> credit in ms, 0 <= level <= full
        self.last = {}                          # client -> when its level was last brought up to date

    def allow(self, client: str, t: int) -> bool:
        # 2. A client's bucket is created full at its first request.
        if client not in self.level:
            self.level[client] = self.full
            self.last[client] = t
        # 3. Refill: every elapsed millisecond is a millisecond of credit, up to a full bucket.
        level = min(self.full, self.level[client] + (t - self.last[client]))
        self.last[client] = t
        # 4. Spend a whole token if there is one. A refusal still keeps the refill.
        ok = level >= self.interval
        if ok:
            level -= self.interval
        self.level[client] = level
        return ok

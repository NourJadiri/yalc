# Follows the rules word for word: exact fractions for the buckets, and every
# stream kept as a record that is scanned whenever slots are counted.
from fractions import Fraction


class RateLimiter:
    def __init__(self, capacity, interval):
        self.limits = [(capacity, interval)]
        self.buckets = {}                       # client -> [tokens per limit, time of last update]
        self.slots = None
        self.timeout = None
        self.streams = {}                       # request id -> [client, start time, finished?]

    def add_limit(self, capacity, interval):
        self.limits.append((capacity, interval))

    def set_concurrency(self, slots, timeout):
        self.slots = slots
        self.timeout = timeout

    def _ended(self, stream, t):
        client, began, finished = stream
        return finished or (self.timeout is not None and t >= began + self.timeout)

    def _busy(self, client, t):
        return sum(1 for s in self.streams.values() if s[0] == client and not self._ended(s, t))

    def _request(self, client, t, cost):
        if client not in self.buckets:
            self.buckets[client] = [[Fraction(c) for c, _ in self.limits], t]
        tokens, then = self.buckets[client]
        for k, (capacity, interval) in enumerate(self.limits):
            tokens[k] = min(Fraction(capacity), tokens[k] + Fraction(t - then, interval))
        self.buckets[client][1] = t
        if any(tokens[k] < cost for k in range(len(self.limits))):
            return False
        if self.slots is not None and self._busy(client, t) >= self.slots:
            return False
        for k in range(len(self.limits)):
            tokens[k] -= cost
        return True

    def allow(self, client, t, cost=1):
        return self._request(client, t, cost)

    def start(self, client, t, request_id, cost=1):
        if not self._request(client, t, cost):
            return False
        self.streams[request_id] = [client, t, False]
        return True

    def finish(self, request_id, t):
        stream = self.streams.get(request_id)
        if stream is None or self._ended(stream, t):
            return False
        stream[2] = True
        return True

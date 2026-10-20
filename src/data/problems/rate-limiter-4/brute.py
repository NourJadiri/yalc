# Follows the rules word for word: exact fractions for the buckets, every
# stream kept as a record that is scanned whenever slots are counted, and for
# each subscribed client a log of the requests that passed, summed over the
# current billing period whenever usage is needed.
from fractions import Fraction


class RateLimiter:
    def __init__(self, capacity, interval):
        self.limits = [(capacity, interval)]
        self.buckets = {}                       # client -> [tokens per limit, time of last update]
        self.slots = None
        self.timeout = None
        self.streams = {}                       # request id -> [client, start time, finished?]
        self.plans = {}                         # name -> (quota, period)
        self.subscription = {}                  # client -> (quota, period, time it subscribed)
        self.charged = {}                       # client -> [(time, cost)] passed since subscribing

    def add_limit(self, capacity, interval):
        self.limits.append((capacity, interval))

    def set_concurrency(self, slots, timeout):
        self.slots = slots
        self.timeout = timeout

    def add_plan(self, name, quota, period):
        self.plans[name] = (quota, period)

    def subscribe(self, client, plan, t):
        if plan not in self.plans:
            return False
        quota, period = self.plans[plan]
        self.subscription[client] = (quota, period, t)
        self.charged[client] = []
        return True

    def remaining(self, client, t):
        if client not in self.subscription:
            return -1
        quota, period, anchor = self.subscription[client]
        k = (t - anchor) // period
        begin, end = anchor + k * period, anchor + (k + 1) * period
        return quota - sum(cost for when, cost in self.charged[client] if begin <= when < end)

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
        if client in self.subscription and cost > self.remaining(client, t):
            return False
        for k in range(len(self.limits)):
            tokens[k] -= cost
        if client in self.subscription:
            self.charged[client].append((t, cost))
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

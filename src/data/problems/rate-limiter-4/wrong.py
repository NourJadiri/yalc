# Period drift: when a request arrives after the period has run out, the next
# period starts at that request instead of on the boundary. Subscribed at 30
# with periods of 100, a request at 180 should fall in [130, 230); here it
# opens [180, 280), and every later boundary comes late.
import collections


class RateLimiter:
    def __init__(self, capacity, interval):
        self.limits = [(capacity * interval, interval)]
        self.level = {}
        self.last = {}
        self.slots = None
        self.timeout = None
        self.in_flight = collections.defaultdict(set)
        self.deadlines = collections.defaultdict(collections.deque)
        self.owner = {}
        self.plans = {}
        self.billing = {}

    def add_limit(self, capacity, interval):
        self.limits.append((capacity * interval, interval))

    def set_concurrency(self, slots, timeout):
        self.slots = slots
        self.timeout = timeout

    def add_plan(self, name, quota, period):
        self.plans[name] = (quota, period)

    def subscribe(self, client, plan, t):
        if plan not in self.plans:
            return False
        quota, period = self.plans[plan]
        self.billing[client] = [quota, period, t, 0]
        return True

    def remaining(self, client, t):
        if client not in self.billing:
            return -1
        quota, _, _, used = self._bill(client, t)
        return quota - used

    def allow(self, client, t, cost=1):
        if client not in self.level:
            self.level[client] = [full for full, _ in self.limits]
            self.last[client] = t
        levels = self.level[client]
        elapsed = t - self.last[client]
        self.last[client] = t
        for k, (full, _) in enumerate(self.limits):
            levels[k] = min(full, levels[k] + elapsed)
        for (_, interval), level in zip(self.limits, levels):
            if level < cost * interval:
                return False
        if self.slots is not None:
            self._expire(client, t)
            if len(self.in_flight[client]) >= self.slots:
                return False
        bill = self._bill(client, t) if client in self.billing else None
        if bill is not None and bill[3] + cost > bill[0]:
            return False
        for k, (_, interval) in enumerate(self.limits):
            levels[k] -= cost * interval
        if bill is not None:
            bill[3] += cost
        return True

    def start(self, client, t, request_id, cost=1):
        if not self.allow(client, t, cost):
            return False
        self.in_flight[client].add(request_id)
        self.owner[request_id] = client
        if self.timeout is not None:
            self.deadlines[client].append((t + self.timeout, request_id))
        return True

    def finish(self, request_id, t):
        client = self.owner.get(request_id)
        if client is None:
            return False
        self._expire(client, t)
        if request_id not in self.in_flight[client]:
            return False
        self.in_flight[client].remove(request_id)
        return True

    def _expire(self, client, t):
        queue, live = self.deadlines[client], self.in_flight[client]
        while queue and queue[0][0] <= t:
            live.discard(queue.popleft()[1])

    def _bill(self, client, t):
        bill = self.billing[client]
        if t >= bill[2] + bill[1]:
            bill[2] = t                         # should be the boundary, not this request
            bill[3] = 0
        return bill

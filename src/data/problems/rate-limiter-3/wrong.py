# A counter of busy slots per client. A timeout frees a slot (lazily, the next
# time the client is touched), and so does finish -- but finish only checks
# that the request started and hasn't been finished before. Finishing a
# request that already timed out frees its slot a second time, and the client
# gains a slot it shouldn't have.
import collections


class RateLimiter:
    def __init__(self, capacity, interval):
        self.limits = [(capacity * interval, interval)]
        self.level = {}
        self.last = {}
        self.slots = None
        self.timeout = None
        self.busy = collections.defaultdict(int)
        self.deadlines = collections.defaultdict(collections.deque)
        self.owner = {}
        self.done = set()

    def add_limit(self, capacity, interval):
        self.limits.append((capacity * interval, interval))

    def set_concurrency(self, slots, timeout):
        self.slots = slots
        self.timeout = timeout

    def _expire(self, client, t):
        queue = self.deadlines[client]
        while queue and queue[0][0] <= t:
            _, rid = queue.popleft()
            if rid not in self.done:
                self.busy[client] -= 1

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
            if self.busy[client] >= self.slots:
                return False
        for k, (_, interval) in enumerate(self.limits):
            levels[k] -= cost * interval
        return True

    def start(self, client, t, request_id, cost=1):
        if not self.allow(client, t, cost):
            return False
        self.busy[client] += 1
        self.owner[request_id] = client
        if self.timeout is not None:
            self.deadlines[client].append((t + self.timeout, request_id))
        return True

    def finish(self, request_id, t):
        if request_id not in self.owner or request_id in self.done:
            return False
        client = self.owner[request_id]
        self._expire(client, t)
        self.done.add(request_id)
        self.busy[client] -= 1                  # its timeout may have freed this slot already
        return True

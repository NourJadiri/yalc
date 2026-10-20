class RateLimiter:

    def __init__(self, capacity: int, interval: int):
        # Count credit in whole milliseconds: one token of a limit is its `interval` ms of credit.
        self.limits = []                        # (full, interval) per limit; full = capacity * interval
        self.level = {}                         # client -> credit in ms, one entry per limit
        self.last = {}                          # client -> when its levels were last brought up to date
        # 1. Slots: no limit and no timeout until set_concurrency.
        self.slots = None
        self.timeout = None
        self.in_flight = collections.defaultdict(set)                # client -> ids in flight
        self.deadlines = collections.defaultdict(collections.deque)  # client -> (deadline, id), oldest first
        self.owner = {}                         # request id -> client, for every start that went through
        self.add_limit(capacity, interval)

    def add_limit(self, capacity: int, interval: int) -> None:
        # Every limit is one more bucket per client. Only called before the first request.
        self.limits.append((capacity * interval, interval))

    def set_concurrency(self, slots: int, timeout: int) -> None:
        self.slots = slots
        self.timeout = timeout

    def allow(self, client: str, t: int, cost: int = 1) -> bool:
        # A client's buckets are created full at its first request.
        if client not in self.level:
            self.level[client] = [full for full, _ in self.limits]
            self.last[client] = t
        # Refill every bucket by the elapsed time, each up to its own full level.
        levels = self.level[client]
        elapsed = t - self.last[client]
        self.last[client] = t
        for k, (full, _) in enumerate(self.limits):
            levels[k] = min(full, levels[k] + elapsed)
        # Check every limit before charging any, so a refusal takes nothing anywhere.
        for (_, interval), level in zip(self.limits, levels):
            if level < cost * interval:
                return False
        # 2. A request also needs a free slot at t. allow gives it straight back.
        if self.slots is not None:
            self._expire(client, t)
            if len(self.in_flight[client]) >= self.slots:
                return False
        # Charge the cost to every limit.
        for k, (_, interval) in enumerate(self.limits):
            levels[k] -= cost * interval
        return True

    def start(self, client: str, t: int, request_id: str, cost: int = 1) -> bool:
        # 3. A stream is an allow that keeps its slot, until finish or its deadline.
        if not self.allow(client, t, cost):
            return False
        self.in_flight[client].add(request_id)
        self.owner[request_id] = client
        if self.timeout is not None:
            self.deadlines[client].append((t + self.timeout, request_id))
        return True

    def finish(self, request_id: str, t: int) -> bool:
        # 4. Expire first: a request past its deadline has already ended by itself.
        client = self.owner.get(request_id)
        if client is None:
            return False                        # unknown id, or its start was refused
        self._expire(client, t)
        if request_id not in self.in_flight[client]:
            return False                        # finished or timed out already
        self.in_flight[client].remove(request_id)
        return True

    def _expire(self, client, t):
        # 5. One timeout for all, so deadlines arrive in start order: the expired ones are in front.
        queue, live = self.deadlines[client], self.in_flight[client]
        while queue and queue[0][0] <= t:
            live.discard(queue.popleft()[1])    # discard: a request that finished early is gone already

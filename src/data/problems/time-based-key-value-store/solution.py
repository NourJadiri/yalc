class TimeMap:

    def __init__(self):
        # 1. key -> its timestamps and values, side by side. set's timestamps only
        # ever increase, so appending keeps every list sorted for free.
        self.times = defaultdict(list)
        self.values = defaultdict(list)

    # 2. set: append, lists stay sorted
    def set(self, key: str, value: str, timestamp: int) -> None:
        self.times[key].append(timestamp)
        self.values[key].append(value)

    # 3. get: an unknown key has no history
    def get(self, key: str, timestamp: int) -> str:
        times = self.times.get(key)
        if not times:
            return ""
        # 4. Everything before index i was set at or before `timestamp`;
        # the newest of those is at i - 1.
        i = bisect_right(times, timestamp)
        # 5. Return the newest version, if any
        return self.values[key][i - 1] if i else ""

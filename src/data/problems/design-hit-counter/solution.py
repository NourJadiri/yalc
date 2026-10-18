class HitCounter:
    WINDOW = 300

    def __init__(self):
        # 1. Bucket i holds the hits of the most recent second that mapped to it.
        self.time = [0] * self.WINDOW
        self.hits = [0] * self.WINDOW

    def record(self, t: int) -> None:
        # 2. Locate the bucket; reclaim it if stale
        i = t % self.WINDOW
        if self.time[i] != t:      # stale bucket from a previous lap: reclaim it
            self.time[i] = t
            self.hits[i] = 0
        # 3. Count this hit
        self.hits[i] += 1

    def count(self, t: int) -> int:
        # 4. A bucket counts only if its second is inside [t - 299, t].
        return sum(h for s, h in zip(self.time, self.hits) if t - s < self.WINDOW)

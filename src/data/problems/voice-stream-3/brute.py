# Remembers every seq it ever kept and every packet still waiting, with its
# arrival time, and applies the rules literally: at a gap it scans all waiting
# packets for the earliest arrival.


class StreamReceiver:
    def __init__(self, window):
        self.window = window
        self.kept = []                      # every seq ever kept
        self.waiting = []                   # (seq, data, t) kept but not played yet
        self.next = 0
        self.delay = None

    def set_delay(self, delay):
        self.delay = delay

    def receive(self, seq, data, t):
        if seq < self.next:                 # played, or given up on
            return False
        if self.kept:
            top = max(self.kept)
            if seq <= top - self.window:    # too old to tell
                return False
            if seq in self.kept:            # duplicate
                return False
        self.kept.append(seq)
        self.waiting.append((seq, data, t))
        return True

    def play(self, t):
        out = []
        while True:
            found = [p for p in self.waiting if p[0] == self.next]
            if found:
                self.waiting.remove(found[0])
                out.append(found[0][1])
            elif (self.waiting and self.delay is not None
                    and min(p[2] for p in self.waiting) <= t - self.delay):
                out.append(None)            # give up on the missing seq
            else:
                return out
            self.next += 1

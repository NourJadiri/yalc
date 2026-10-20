# Remembers every seq it ever kept and every packet still waiting, and applies
# the rules literally. play() searches the waiting list for each next seq.


class StreamReceiver:
    def __init__(self, window):
        self.window = window
        self.kept = []                      # every seq ever kept
        self.waiting = []                   # (seq, data) kept but not played yet
        self.next = 0

    def receive(self, seq, data, t):
        if seq < self.next:                 # already played
            return False
        if self.kept:
            top = max(self.kept)
            if seq <= top - self.window:    # too old to tell
                return False
            if seq in self.kept:            # duplicate
                return False
        self.kept.append(seq)
        self.waiting.append((seq, data))
        return True

    def play(self, t):
        out = []
        while True:
            found = [p for p in self.waiting if p[0] == self.next]
            if not found:
                return out
            self.waiting.remove(found[0])
            out.append(found[0][1])
            self.next += 1

# Remembers every seq kept in the current response and every packet still
# waiting, with its arrival time, and applies the rules literally. Switching to
# a newer response throws all of that away and starts from nothing.


class StreamReceiver:
    def __init__(self, window):
        self.window = window
        self.delay = None
        self.gen = 0
        self.start_over()

    def start_over(self):
        self.kept = []                      # every seq kept in this response
        self.waiting = []                   # (seq, data, t) kept but not played yet
        self.next = 0

    def set_delay(self, delay):
        self.delay = delay

    def interrupt(self, gen, t):
        if gen <= self.gen:
            return 0
        thrown = len(self.waiting)
        self.gen = gen
        self.start_over()
        return thrown

    def receive(self, seq, data, t, gen=0):
        if gen < self.gen:                  # an abandoned response
            return False
        if gen > self.gen:                  # overtook its interrupt
            self.interrupt(gen, t)
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

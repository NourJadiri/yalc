# Starts the buffer and playback over on an interrupt, but not the window: `top`
# and the ring still describe the old response. The new response's first seqs
# are then judged against the old ones and dropped, as too old when the old top
# was high, or as duplicates of the old response's packets with the same seq.


class StreamReceiver:
    def __init__(self, window):
        self.window = window
        self.top = -1
        self.slot = [-1] * window
        self.buffer = {}
        self.next = 0
        self.delay = None
        self.arrivals = collections.deque()
        self.gen = 0

    def receive(self, seq, data, t, gen=0):
        if gen < self.gen:
            return False
        if gen > self.gen:
            self.interrupt(gen, t)
        if seq < self.next:
            return False
        if seq > self.top:
            self.top = seq
        elif seq <= self.top - self.window:
            return False
        elif self.slot[seq % self.window] == seq:
            return False
        self.slot[seq % self.window] = seq
        self.buffer[seq] = data
        self.arrivals.append((t, seq))
        return True

    def play(self, t):
        out = []
        while True:
            if self.next in self.buffer:
                out.append(self.buffer.pop(self.next))
                self.next += 1
                continue
            if not self.buffer or self.delay is None:
                return out
            while self.arrivals[0][1] not in self.buffer:
                self.arrivals.popleft()
            if self.arrivals[0][0] > t - self.delay:
                return out
            out.append(None)
            self.next += 1

    def set_delay(self, delay):
        self.delay = delay

    def interrupt(self, gen, t):
        if gen <= self.gen:
            return 0
        thrown = len(self.buffer)
        self.gen = gen
        self.buffer = {}
        self.arrivals = collections.deque()
        self.next = 0
        return thrown

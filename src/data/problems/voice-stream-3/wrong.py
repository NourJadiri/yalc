# Judges the wait by the packet right after the gap instead of the packet that
# has waited longest. When a fresh packet fills in just behind the gap while an
# older one waits further on, the old audio goes overdue and playback still
# waits.
import heapq


class StreamReceiver:
    def __init__(self, window):
        self.window = window
        self.top = -1
        self.slot = [-1] * window
        self.buffer = {}
        self.next = 0
        self.delay = None
        self.arrived = {}                   # seq -> arrival time
        self.ahead = []                     # min-heap of buffered seqs

    def receive(self, seq, data, t):
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
        self.arrived[seq] = t
        heapq.heappush(self.ahead, seq)
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
            while self.ahead[0] not in self.buffer:
                heapq.heappop(self.ahead)
            if self.arrived[self.ahead[0]] > t - self.delay:     # the packet after the gap
                return out
            out.append(None)
            self.next += 1

    def set_delay(self, delay):
        self.delay = delay

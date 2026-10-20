# Plays everything in the buffer, in seq order, and skips over the gaps. A
# missing packet should hold playback back until it arrives. Here it is played
# past, and when it does arrive it counts as already played and is dropped.


class StreamReceiver:
    def __init__(self, window):
        self.window = window
        self.top = -1
        self.slot = [-1] * window
        self.buffer = {}
        self.next = 0

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
        return True

    def play(self, t):
        out = [self.buffer[s] for s in sorted(self.buffer)]
        if self.buffer:
            self.next = max(self.buffer) + 1
        self.buffer.clear()
        return out

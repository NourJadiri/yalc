# Off by one at the window's edge: `seq < top - window` lets seq = top - window
# through, though the window no longer covers it. Its slot is top's slot, which
# holds top, so the packet is kept, and it even overwrites top's slot: a later
# copy of top is no longer recognised as a duplicate.


class StreamReceiver:
    def __init__(self, window):
        self.window = window
        self.top = -1
        self.slot = [-1] * window

    def receive(self, seq, data, t):
        if seq > self.top:
            self.top = seq
        elif seq < self.top - self.window:
            return False
        elif self.slot[seq % self.window] == seq:
            return False
        self.slot[seq % self.window] = seq
        return True

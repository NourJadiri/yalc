# Remembers every seq it ever kept and applies the four rules literally.


class StreamReceiver:
    def __init__(self, window):
        self.window = window
        self.kept = []

    def receive(self, seq, data, t):
        if not self.kept:                   # the first packet
            self.kept.append(seq)
            return True
        top = max(self.kept)
        if seq > top:
            self.kept.append(seq)
            return True
        if seq <= top - self.window:        # too old to tell
            return False
        if seq in self.kept:                # duplicate
            return False
        self.kept.append(seq)
        return True

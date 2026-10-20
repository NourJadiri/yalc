class StreamReceiver:

    def __init__(self, window: int):
        # 1. The highest seq kept, and one slot for each seq the window covers
        self.window = window
        self.top = -1                       # highest seq kept so far (-1: nothing yet)
        self.slot = [-1] * window           # slot[seq % window] = the last seq kept there

    def receive(self, seq: int, data: str, t: int) -> bool:
        # 2. Above the top: a new packet, and the new top (the first packet lands here too)
        if seq > self.top:
            self.top = seq
        # 3. The window covers top - window + 1 .. top; anything lower is too old to judge
        elif seq <= self.top - self.window:
            return False
        # 4. Inside the window, the slot holds this seq only if it was already kept.
        # Any other kept seq sharing the slot is a multiple of `window` lower: below the window.
        elif self.slot[seq % self.window] == seq:
            return False
        # 5. Keep it
        self.slot[seq % self.window] = seq
        return True

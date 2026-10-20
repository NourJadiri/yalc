class StreamReceiver:

    def __init__(self, window: int):
        # The highest seq kept, and one slot for each seq the window covers
        self.window = window
        self.top = -1                       # highest seq kept so far (-1: nothing yet)
        self.slot = [-1] * window           # slot[seq % window] = the last seq kept there
        # 1. Kept packets wait here until played; playback starts at seq 0
        self.buffer = {}                    # seq -> data
        self.next = 0                       # the next seq to play

    def receive(self, seq: int, data: str, t: int) -> bool:
        # 2. Already played: drop it (the window rules below would drop it anyway)
        if seq < self.next:
            return False
        # Above the top: a new packet, and the new top (the first packet lands here too)
        if seq > self.top:
            self.top = seq
        # The window covers top - window + 1 .. top; anything lower is too old to judge
        elif seq <= self.top - self.window:
            return False
        # Inside the window, the slot holds this seq only if it was already kept.
        # Any other kept seq sharing the slot is a multiple of `window` lower: below the window.
        elif self.slot[seq % self.window] == seq:
            return False
        # 3. Keep it: claim its slot, and let it wait in the buffer for its turn
        self.slot[seq % self.window] = seq
        self.buffer[seq] = data
        return True

    def play(self, t: int) -> List[str]:
        # 4. Play the run that starts at next, up to the first missing seq
        out = []
        while self.next in self.buffer:
            out.append(self.buffer.pop(self.next))
            self.next += 1
        return out

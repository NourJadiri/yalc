class StreamReceiver:

    def __init__(self, window: int):
        # The highest seq kept, and one slot for each seq the window covers
        self.window = window
        self.top = -1                       # highest seq kept so far (-1: nothing yet)
        self.slot = [-1] * window           # slot[seq % window] = the last seq kept there
        # Kept packets wait here until played; playback starts at seq 0
        self.buffer = {}                    # seq -> data
        self.next = 0                       # the next seq to play
        # 1. The latency budget, and every kept packet in arrival order
        self.delay = None                   # None: wait for a missing seq forever
        self.arrivals = collections.deque() # (t, seq), oldest first

    def receive(self, seq: int, data: str, t: int) -> bool:
        # Already played or given up on: drop it
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
        # Keep it: claim its slot, and let it wait in the buffer for its turn
        self.slot[seq % self.window] = seq
        self.buffer[seq] = data
        # 2. Time never goes backwards, so call order is arrival order
        self.arrivals.append((t, seq))
        return True

    def play(self, t: int) -> List[Optional[str]]:
        # Play the run that starts at next; at a gap, maybe give up on the missing seq
        out = []
        while True:
            if self.next in self.buffer:
                out.append(self.buffer.pop(self.next))
                self.next += 1
                continue
            if not self.buffer or self.delay is None:
                return out                  # nothing waiting behind the gap, or no budget
            # 3. The oldest packet still waiting: played ones leave the front lazily
            while self.arrivals[0][1] not in self.buffer:
                self.arrivals.popleft()
            # 4. Once it has waited `delay` ms, the missing seq plays as silence
            if self.arrivals[0][0] > t - self.delay:
                return out
            out.append(None)
            self.next += 1

    def set_delay(self, delay: int) -> None:
        self.delay = delay

class MyQueue:

    def __init__(self):
        # 1. Two stacks: one in, one out
        self.inbox = []     # new items land here; its top is the newest item
        self.outbox = []    # items wait here in serving order; its top is the oldest

    def push(self, x: int) -> None:
        # 2. Every push goes on inbox
        self.inbox.append(x)

    def pop(self) -> int:
        # 3. Get the front ready, then take it
        self.peek()                 # makes sure the front item is on top of outbox
        return self.outbox.pop()

    def peek(self) -> int:
        # 4. Pour only when outbox is empty
        if not self.outbox:
            # Refill only when outbox is empty. Pouring reverses the order, so the
            # oldest item in inbox lands on top. If outbox still held anything,
            # those items are older and must be served first.
            while self.inbox:
                self.outbox.append(self.inbox.pop())
        return self.outbox[-1]

    def empty(self) -> bool:
        # 5. Empty only when both stacks are
        return not self.inbox and not self.outbox

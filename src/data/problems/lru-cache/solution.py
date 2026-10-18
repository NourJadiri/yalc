class Entry:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:

    def __init__(self, capacity: int):
        # 1. Map for lookup, list for recency order
        self.capacity = capacity
        self.entries = {}                   # key -> Entry, for O(1) lookup
        # A doubly linked list in recency order, between two sentinels:
        # head.next is the most recently used entry, tail.prev the least.
        # The sentinels mean unlinking never has to special-case an end.
        self.head, self.tail = Entry(), Entry()
        self.head.next, self.tail.prev = self.tail, self.head

    # 2. Two O(1) list helpers
    def _unlink(self, e):
        e.prev.next, e.next.prev = e.next, e.prev

    def _push_front(self, e):
        e.prev, e.next = self.head, self.head.next
        self.head.next.prev = e
        self.head.next = e

    # 3. get: move a hit to the front
    def get(self, key: int) -> int:
        e = self.entries.get(key)
        if e is None:
            return -1
        self._unlink(e)                     # a read is a use: move it to the front
        self._push_front(e)
        return e.value

    # 4. put: update an existing key
    def put(self, key: int, value: int) -> None:
        e = self.entries.get(key)
        if e is not None:                   # an update is a use too, and evicts nothing
            e.value = value
            self._unlink(e)
            self._push_front(e)
            return
        # 5. Full: evict the least recently used
        if len(self.entries) == self.capacity:
            lru = self.tail.prev            # evict the least recently used entry; the
            self._unlink(lru)               # key stored on it is what lets us drop it
            del self.entries[lru.key]       # from the dict as well
        # 6. Insert the new entry at the front
        e = Entry(key, value)
        self.entries[key] = e
        self._push_front(e)

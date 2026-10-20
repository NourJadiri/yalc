class KVStore:

    def __init__(self):
        # The data, and beside it how many keys hold each value
        self.data = {}                          # key -> value
        self.holders = collections.Counter()    # value -> number of keys holding it
        # One undo log shared by every open transaction, and where each one starts in it
        self.undo = []                          # (key, its value before the change, or None if absent)
        self.starts = []                        # undo-log length at each open begin, innermost last
        # 1. The durable log: (key, value) records, None meaning deleted. Only it survives a crash.
        self.log = []

    def set(self, key: str, value: int) -> None:
        self._change(key, value)

    def get(self, key: str) -> int | None:
        return self.data.get(key)

    def delete(self, key: str) -> bool:
        if key not in self.data:
            return False
        self._change(key, None)
        return True

    def count(self, value: int) -> int:
        # A lookup, never a scan
        return self.holders[value]

    def begin(self) -> None:
        # A transaction is just a bookmark into the undo log
        self.starts.append(len(self.undo))

    def rollback(self) -> bool:
        if not self.starts:
            return False
        # Undo newest first, back to the bookmark; _write puts the counts back too
        start = self.starts.pop()
        while len(self.undo) > start:
            key, old = self.undo.pop()
            self._write(key, old)
        return True

    def commit(self) -> bool:
        if not self.starts:
            return False
        # Keep the entries: they now lie inside the parent's range, so the
        # parent's rollback still undoes them.
        self.starts.pop()
        if not self.starts:
            # 2. The outermost commit makes the whole transaction durable at once:
            # one record per key it changed, holding that key's final value.
            touched = dict.fromkeys(key for key, _ in self.undo)
            self.log.extend((key, self.data.get(key)) for key in touched)
            self.undo.clear()
        return True

    def crash(self) -> None:
        # 3. Power cut: everything except the durable log is gone
        self.data = {}
        self.holders = collections.Counter()
        self.undo = []
        self.starts = []

    def recover(self) -> int:
        # 4. Rebuild from the log alone, oldest record first: a key's last record wins
        self.data = {}
        self._replay(self.data)
        self.holders = collections.Counter(self.data.values())
        return len(self.data)

    def _change(self, key, value):
        if self.starts:
            # Inside a transaction, write down what the key held before changing it
            self.undo.append((key, self.data.get(key)))
        else:
            # 5. With no transaction open, the change is durable as soon as it's made
            self.log.append((key, value))
        self._write(key, value)

    def _write(self, key, value):
        # Store value under key (None removes the key). The key leaves its
        # old value's count before it joins the new one's.
        old = self.data.get(key)
        if old is not None:
            self.holders[old] -= 1
        if value is None:
            del self.data[key]
        else:
            self.data[key] = value
            self.holders[value] += 1

    def _replay(self, into):
        # Apply the durable log to the dict `into`, oldest record first
        for key, value in self.log:
            if value is None:
                into.pop(key, None)
            else:
                into[key] = value

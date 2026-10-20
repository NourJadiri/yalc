class KVStore:

    def __init__(self, disk=None):
        # The data, and beside it how many keys hold each value
        self.data = {}                          # key -> value
        self.holders = collections.Counter()    # value -> number of keys holding it
        # One undo log shared by every open transaction, and where each one starts in it
        self.undo = []                          # (key, its value before the change, or None if absent)
        self.starts = []                        # undo-log length at each open begin, innermost last
        # The disk outlives this object. Its log holds (key, value) records,
        # None meaning deleted; its snapshot is the committed data as of the
        # last checkpoint, and the log holds only what came after it.
        self.disk = disk

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
            # The outermost commit makes the whole transaction durable at once:
            # one record per key it changed, holding that key's final value.
            for key in dict.fromkeys(key for key, _ in self.undo):
                self._persist(key, self.data.get(key))
            self.undo.clear()
        return True

    def recover(self) -> int:
        # 1. A fresh object on the old disk: start from the snapshot, if a
        # checkpoint wrote one (the disk hands back a copy), then replay the log
        self.data = self.disk.read_snapshot() or {}
        self._replay(self.data)
        self.holders = collections.Counter(self.data.values())
        return len(self.data)

    def checkpoint(self) -> int:
        # 2. Snapshot plus log is the committed state. Open transactions have
        # put nothing on the disk yet, so none of their changes are in it.
        snapshot = self.disk.read_snapshot() or {}
        self._replay(snapshot)
        # 3. Save it as the new snapshot, then start an empty log. Snapshot
        # first: written the other way round, a crash in between would lose data.
        self.disk.write_snapshot(snapshot)
        self.disk.clear_log()
        return len(snapshot)

    def _change(self, key, value):
        if self.starts:
            # Inside a transaction, write down what the key held before changing it
            self.undo.append((key, self.data.get(key)))
        else:
            # With no transaction open, the change is durable as soon as it's made
            self._persist(key, value)
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

    def _persist(self, key, value):
        # Append a record to the disk. A store built without one keeps nothing.
        if self.disk is not None:
            self.disk.append((key, value))

    def _replay(self, into):
        # Apply the disk's log to the dict `into`, oldest record first
        for key, value in self.disk.read_log():
            if value is None:
                into.pop(key, None)
            else:
                into[key] = value

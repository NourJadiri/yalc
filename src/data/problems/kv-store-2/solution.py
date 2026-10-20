class KVStore:

    def __init__(self):
        # The data, and beside it how many keys hold each value
        self.data = {}                          # key -> value
        self.holders = collections.Counter()    # value -> number of keys holding it
        # 1. One undo log shared by every open transaction, and where each one starts in it
        self.undo = []                          # (key, its value before the change, or None if absent)
        self.starts = []                        # undo-log length at each open begin, innermost last

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
        # 2. A transaction is just a bookmark into the log
        self.starts.append(len(self.undo))

    def rollback(self) -> bool:
        if not self.starts:
            return False
        # 3. Undo newest first, back to the bookmark; _write puts the counts back too
        start = self.starts.pop()
        while len(self.undo) > start:
            key, old = self.undo.pop()
            self._write(key, old)
        return True

    def commit(self) -> bool:
        if not self.starts:
            return False
        # 4. Keep the entries: they now lie inside the parent's range, so the
        # parent's rollback still undoes them. Once the outermost transaction
        # closes, nothing can be undone any more.
        self.starts.pop()
        if not self.starts:
            self.undo.clear()
        return True

    def _change(self, key, value):
        # 5. Inside a transaction, write down what the key held before changing it
        if self.starts:
            self.undo.append((key, self.data.get(key)))
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

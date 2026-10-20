# The tempting shortcut: "commit keeps the changes, so their undo entries are
# no longer needed" — and commit() throws them away. That's right for the
# outermost transaction, but a nested commit hands its changes to the parent,
# and the parent's rollback can no longer undo them.
import collections


class KVStore:
    def __init__(self):
        self.data = {}
        self.holders = collections.Counter()
        self.undo = []
        self.starts = []

    def set(self, key, value):
        self._change(key, value)

    def get(self, key):
        return self.data.get(key)

    def delete(self, key):
        if key not in self.data:
            return False
        self._change(key, None)
        return True

    def count(self, value):
        return self.holders[value]

    def begin(self):
        self.starts.append(len(self.undo))

    def rollback(self):
        if not self.starts:
            return False
        start = self.starts.pop()
        while len(self.undo) > start:
            key, old = self.undo.pop()
            self._write(key, old)
        return True

    def commit(self):
        if not self.starts:
            return False
        del self.undo[self.starts.pop():]       # gone for good, even when nested
        return True

    def _change(self, key, value):
        if self.starts:
            self.undo.append((key, self.data.get(key)))
        self._write(key, value)

    def _write(self, key, value):
        old = self.data.get(key)
        if old is not None:
            self.holders[old] -= 1
        if value is None:
            del self.data[key]
        else:
            self.data[key] = value
            self.holders[value] += 1

# The tempting shortcut: a checkpoint writes the live data as the snapshot.
# That is the committed state whenever no transaction is open. With one open,
# the snapshot holds its uncommitted changes, and after a crash they come back.
import collections


class KVStore:

    def __init__(self, disk=None):
        self.data = {}
        self.holders = collections.Counter()
        self.undo = []
        self.starts = []
        self.disk = disk

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
        self.starts.pop()
        if not self.starts:
            for key in dict.fromkeys(key for key, _ in self.undo):
                self._persist(key, self.data.get(key))
            self.undo.clear()
        return True

    def recover(self):
        self.data = self.disk.read_snapshot() or {}
        self._replay(self.data)
        self.holders = collections.Counter(self.data.values())
        return len(self.data)

    def checkpoint(self):
        self.disk.write_snapshot(self.data)     # the live data: open transactions included
        self.disk.clear_log()
        return len(self.data)

    def _change(self, key, value):
        if self.starts:
            self.undo.append((key, self.data.get(key)))
        else:
            self._persist(key, value)
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

    def _persist(self, key, value):
        if self.disk is not None:
            self.disk.append((key, value))

    def _replay(self, into):
        for key, value in self.disk.read_log():
            if value is None:
                into.pop(key, None)
            else:
                into[key] = value

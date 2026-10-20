# The tempting shortcut: put the disk write inside the one write path, so every
# write is logged the moment it happens. Rollbacks even come out right, since
# undoing a change writes (and logs) the old value back. But a transaction that
# is still open at the crash already has its changes on the disk, and they come
# back on recovery.
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
            self.undo.clear()
        return True

    def recover(self):
        self.data = {}
        for key, value in self.disk.read_log():
            if value is None:
                self.data.pop(key, None)
            else:
                self.data[key] = value
        self.holders = collections.Counter(self.data.values())
        return len(self.data)

    def _change(self, key, value):
        if self.starts:
            self.undo.append((key, self.data.get(key)))
        self._write(key, value)

    def _write(self, key, value):
        if self.disk is not None:
            self.disk.append((key, value))      # durable at once, committed or not
        old = self.data.get(key)
        if old is not None:
            self.holders[old] -= 1
        if value is None:
            del self.data[key]
        else:
            self.data[key] = value
            self.holders[value] += 1

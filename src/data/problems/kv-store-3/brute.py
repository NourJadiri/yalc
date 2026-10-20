# The obvious version. begin() saves a full copy of the data, rollback() puts
# it back, commit() drops it. Whenever no transaction is open, the data IS the
# committed state, so after every change that makes something durable the
# whole of it goes onto the disk as one record. recover() reads back the last
# record. count() scans.


class KVStore:
    def __init__(self, disk=None):
        self.disk = disk
        self.data = {}
        self.saved = []                 # one full copy per open transaction

    def _settle(self):
        if not self.saved and self.disk is not None:
            self.disk.append(dict(self.data))

    def set(self, key, value):
        self.data[key] = value
        self._settle()

    def get(self, key):
        return self.data.get(key)

    def delete(self, key):
        if key in self.data:
            del self.data[key]
            self._settle()
            return True
        return False

    def count(self, value):
        return sum(1 for v in self.data.values() if v == value)

    def begin(self):
        self.saved.append(dict(self.data))

    def rollback(self):
        if not self.saved:
            return False
        self.data = self.saved.pop()
        return True

    def commit(self):
        if not self.saved:
            return False
        self.saved.pop()
        self._settle()
        return True

    def recover(self):
        log = self.disk.read_log()
        self.data = log[-1] if log else {}      # the disk hands back a copy
        return len(self.data)

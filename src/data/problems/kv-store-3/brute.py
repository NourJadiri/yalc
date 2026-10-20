# The obvious version. begin() saves a full copy of the data, rollback() puts
# it back, commit() drops it. Whenever no transaction is open, the data IS the
# committed state, so a full copy of it is kept as the "disk". crash() forgets
# everything else, and recover() copies the disk back. count() scans.


class KVStore:
    def __init__(self):
        self.data = {}
        self.saved = []                 # one full copy per open transaction
        self.disk = {}                  # the committed state, copied in full

    def _settle(self):
        if not self.saved:
            self.disk = dict(self.data)

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

    def crash(self):
        self.data = None                # any call but recover() would now fail
        self.saved = []

    def recover(self):
        self.data = dict(self.disk)
        return len(self.data)
